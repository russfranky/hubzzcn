import { expect, test, type Page } from "@playwright/test"

const queue = (page: Page) =>
  page.getByRole("region", { name: "Controlled media queue" })
const rows = (page: Page) => queue(page).getByRole("listitem")
const grip = (page: Page, position: number) =>
  queue(page).getByRole("button", {
    name: `Reorder item ${position}`,
    exact: true,
  })
const remove = (page: Page, position: number) =>
  queue(page).getByRole("button", {
    name: `Remove item ${position}`,
    exact: true,
  })

// Deliver a snapshot without moving focus to a test control. Commands alone
// deliberately do not mutate the host snapshot in this fixture.
async function publish(page: Page, snapshot: Record<string, unknown>) {
  await page
    .getByRole("textbox", { name: "Host snapshot", exact: true })
    .evaluate((element, value) => {
      ;(element as HTMLTextAreaElement).value = JSON.stringify(value)
    }, snapshot)
  await page
    .getByTestId("apply-snapshot")
    .evaluate((element) => (element as HTMLButtonElement).click())
}

test.describe("MQS authoritative focus updates", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://127.0.0.1:4174/tests/fixtures/mqs-focus.html")
    await expect(rows(page)).toHaveCount(4)
  })

  test("a pending or rejected removal does not move focus", async ({ page }) => {
    await remove(page, 2).press("Enter")
    await expect(page.getByTestId("commands")).toHaveText('["--remove 2"]')
    await expect(remove(page, 2)).toBeFocused()
    await publish(page, { ids: ["a", "b", "c", "d"] })
    await expect(remove(page, 2)).toBeFocused()
    await expect(rows(page)).toHaveCount(4)
    await publish(page, { ids: ["a", "c", "d"] })
    await expect(rows(page)).toHaveCount(3)
    await expect(grip(page, 2)).toBeFocused()
  })

  test("a user can leave before the delayed removal arrives", async ({
    page,
  }) => {
    await remove(page, 2).press("Enter")
    const outside = page.getByRole("textbox", {
      name: "Outside field",
      exact: true,
    })
    await outside.fill("Keep my focus")
    await publish(page, { ids: ["a", "c", "d"] })
    await expect(rows(page)).toHaveCount(3)
    await expect(outside).toBeFocused()
    await expect(outside).toHaveValue("Keep my focus")
  })

  test("explicit blur before an update does not recall old row focus", async ({
    page,
  }) => {
    await remove(page, 2).focus()
    await remove(page, 2).evaluate((element) =>
      (element as HTMLButtonElement).blur()
    )
    await publish(page, { ids: ["a", "c", "d"] })
    await expect(rows(page)).toHaveCount(3)
    await expect(page.locator("body")).toBeFocused()
  })

  test("a move before removal uses the latest neighbor order", async ({
    page,
  }) => {
    await remove(page, 2).focus()
    await publish(page, { ids: ["a", "c", "b", "d"] })
    await expect(remove(page, 3)).toBeFocused()
    await publish(page, { ids: ["a", "c", "d"] })
    await expect(grip(page, 3)).toBeFocused()
  })

  test("batch removal selects the next surviving identity despite reorder", async ({
    page,
  }) => {
    await remove(page, 2).focus()
    await publish(page, { ids: ["d", "a"] })
    await expect(rows(page)).toHaveCount(2)
    await expect(grip(page, 1)).toBeFocused()
  })

  test("batch removal at the tail selects a surviving predecessor", async ({
    page,
  }) => {
    await remove(page, 4).focus()
    await publish(page, { ids: ["b", "a"] })
    await expect(grip(page, 1)).toBeFocused()
  })

  test("replacement items with duplicate titles receive non-destructive focus", async ({
    page,
  }) => {
    await remove(page, 2).focus()
    await publish(page, { ids: ["new-a", "new-b"] })
    await expect(rows(page)).toHaveCount(2)
    await expect(grip(page, 1)).toBeFocused()
    await expect(page.getByTestId("commands")).toHaveText("[]")
  })

  for (const [load, close, fallback] of [
    [true, true, "Load setlist"],
    [false, true, "Close"],
    [false, false, "Mute"],
  ] as const) {
    test(`empty queue falls back to ${fallback}`, async ({ page }) => {
      await remove(page, 2).focus()
      await publish(page, { ids: [], currentIndex: -1, load, close })
      await expect(rows(page)).toHaveCount(0)
      await expect(
        queue(page).getByRole("button", { name: fallback, exact: true })
      ).toBeFocused()
    })
  }

  test("an unfocused queue never takes focus from another queue", async ({
    page,
  }) => {
    const other = page.getByRole("region", { name: "Other media queue" })
    const control = other.getByRole("button", {
      name: "Reorder item 2",
      exact: true,
    })
    await control.press("Enter")
    const action = page
      .getByRole("dialog")
      .getByRole("button", { name: "Move up", exact: true })
    await expect(action).toBeFocused()
    await publish(page, { ids: [] })
    await expect(rows(page)).toHaveCount(0)
    await expect(action).toBeFocused()
  })

  test("removed panel cannot later steal focus from an outside field", async ({
    page,
  }) => {
    await grip(page, 2).press("Enter")
    await expect(page.getByRole("dialog")).toBeVisible()
    const outside = page.getByRole("textbox", {
      name: "Outside field",
      exact: true,
    })
    await outside.focus()
    await publish(page, { ids: ["a", "c", "d"] })
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(outside).toBeFocused()
    await page.keyboard.type("still here")
    await expect(outside).toHaveValue("still here")
  })

  test("removing a focused popup recovers to its successor grip", async ({
    page,
  }) => {
    await grip(page, 2).press("Enter")
    await expect(
      page
        .getByRole("dialog")
        .getByRole("button", { name: "Move up", exact: true })
    ).toBeFocused()
    await publish(page, { ids: ["a", "c", "d"] })
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(grip(page, 2)).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(remove(page, 2)).toBeFocused()
  })

  test("a focused popup action that becomes disabled returns to its grip", async ({
    page,
  }) => {
    await grip(page, 2).press("Enter")
    await expect(
      page
        .getByRole("dialog")
        .getByRole("button", { name: "Move up", exact: true })
    ).toBeFocused()
    await publish(page, { ids: ["b", "c", "d"] })
    await expect(grip(page, 1)).toBeFocused()
    await expect(page.getByTestId("commands")).toHaveText("[]")
  })

  test("a seek control that loses its duration gets usable focus", async ({
    page,
  }) => {
    await queue(page).getByRole("slider", { name: "Playback position" }).focus()
    await publish(page, { live: true })
    await expect(queue(page).getByRole("slider")).toHaveCount(0)
    await expect(
      queue(page).getByRole("button", { name: "Pause", exact: true })
    ).toBeFocused()
  })

  test("a disabled transport button returns to a valid playback control", async ({
    page,
  }) => {
    await queue(page).getByRole("button", { name: "Skip", exact: true }).focus()
    await publish(page, { currentIndex: 3 })
    await expect(
      queue(page).getByRole("button", { name: "Skip", exact: true })
    ).toBeDisabled()
    await expect(
      queue(page).getByRole("button", { name: "Pause", exact: true })
    ).toBeFocused()
  })

  test("remount does not restore a stale row or panel", async ({ page }) => {
    await grip(page, 2).press("Enter")
    await publish(page, { mounted: false })
    await expect(queue(page)).toHaveCount(0)
    const outside = page.getByRole("textbox", {
      name: "Outside field",
      exact: true,
    })
    await outside.focus()
    await publish(page, { mounted: true, ids: ["x", "y"] })
    await expect(rows(page)).toHaveCount(2)
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(outside).toBeFocused()
  })

  test("special-character item IDs never become selector syntax", async ({
    page,
  }) => {
    await publish(page, { ids: ['a"]#id', "b:漢字", "c ' 😀"] })
    await remove(page, 2).focus()
    await publish(page, { ids: ['a"]#id', "c ' 😀"] })
    await expect(grip(page, 2)).toBeFocused()
  })

  test("repeated removal and reinsertion cannot reuse old focus intent", async ({
    page,
  }) => {
    await remove(page, 2).focus()
    await publish(page, { ids: ["a", "c", "d"] })
    await expect(grip(page, 2)).toBeFocused()
    await publish(page, { ids: ["b", "a", "c", "d"] })
    await expect(grip(page, 3)).toBeFocused()
    await publish(page, { ids: ["a", "c", "d"] })
    await expect(grip(page, 2)).toBeFocused()
    await expect(page.getByTestId("commands")).toHaveText("[]")
  })
})
