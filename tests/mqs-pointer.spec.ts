import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

const rows = (page: Page) =>
  page.getByRole("list", { name: "Media queue items" }).getByRole("listitem")
const trigger = (page: Page, position: number) =>
  page.getByRole("button", {
    name: `Reorder item ${position}`,
    exact: true,
  })
const panel = (page: Page) =>
  page.getByRole("dialog", { name: /^Reorder item/ })
const command = (page: Page) => page.getByTestId("last-mqs-command")
const moveLabels = ["Move up", "Move down", "Move to start", "Move to end"]

async function openQueue(page: Page) {
  await page.goto("/?prototype=mqs")
  await expect(rows(page)).toHaveCount(5)
}

test.describe("MQS single-pointer move actions", () => {
  test.beforeEach(async ({ page }) => openQueue(page))

  test("a click opens named actions without moving an item", async ({
    page,
  }) => {
    const before = await rows(page).allTextContents()
    await trigger(page, 3).click()
    await expect(panel(page)).toBeVisible()
    await expect(panel(page)).toContainText("Afterlife Tulum 2025")
    for (const name of moveLabels) {
      await expect(
        panel(page).getByRole("button", { name, exact: true })
      ).toBeVisible()
    }
    await expect(trigger(page, 3)).toHaveAttribute("aria-expanded", "true")
    await expect(trigger(page, 3)).toHaveAttribute(
      "aria-keyshortcuts",
      "Alt+ArrowUp Alt+ArrowDown"
    )
    await expect(command(page)).toHaveText("")
    await expect(rows(page)).toHaveText(before)
  })

  for (const [label, destination] of [
    ["Move up", 2],
    ["Move down", 4],
    ["Move to start", 1],
    ["Move to end", 5],
  ] as const) {
    test(`${label} emits a valid command and restores item focus`, async ({
      page,
    }) => {
      const row = rows(page).filter({ hasText: "Afterlife Tulum 2025" })
      const control = row.getByRole("button", { name: /^Reorder item/ })
      await control.click()
      await panel(page)
        .getByRole("button", { name: label, exact: true })
        .click()
      await expect(command(page)).toHaveText(`--move 3 ${destination}`)
      await expect(rows(page).nth(destination - 1)).toContainText(
        "Afterlife Tulum 2025"
      )
      await expect(panel(page)).toHaveCount(0)
      await expect(control).toBeFocused()
      await expect(page.getByTestId("current-row")).toContainText(
        "Tomorrowland 2026 Mainstage W1"
      )
      await expect(
        page.getByRole("slider", { name: "Playback position" })
      ).toHaveAttribute("aria-valuenow", "1938")
    })
  }

  test("moving the active item preserves time, pause and mute", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Pause", exact: true }).click()
    await page.getByRole("button", { name: "Mute", exact: true }).click()
    await trigger(page, 2).click()
    await panel(page)
      .getByRole("button", { name: "Move to end", exact: true })
      .click()
    await expect(command(page)).toHaveText("--move 2 5")
    await expect(page.getByTestId("current-row")).toHaveAttribute(
      "data-queue-index",
      "4"
    )
    await expect(page.getByTestId("current-row")).toContainText(
      "Tomorrowland 2026 Mainstage W1"
    )
    await expect(
      page.getByRole("slider", { name: "Playback position" })
    ).toHaveAttribute("aria-valuenow", "1938")
    await expect(
      page.getByRole("button", { name: "Play", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Unmute", exact: true })
    ).toBeVisible()
  })

  test("first and last rows disable invalid destinations", async ({ page }) => {
    const before = await rows(page).allTextContents()
    for (const [position, disabled, enabled] of [
      [1, ["Move up", "Move to start"], ["Move down", "Move to end"]],
      [5, ["Move down", "Move to end"], ["Move up", "Move to start"]],
    ] as const) {
      await trigger(page, position).click()
      for (const name of disabled) {
        const button = panel(page).getByRole("button", {
          name,
          exact: true,
        })
        await expect(button).toBeDisabled()
        await button.dispatchEvent("click")
      }
      for (const name of enabled) {
        await expect(
          panel(page).getByRole("button", { name, exact: true })
        ).toBeEnabled()
      }
      await panel(page)
        .getByRole("button", { name: "Done", exact: true })
        .click()
    }
    await expect(command(page)).toHaveText("")
    await expect(rows(page)).toHaveText(before)
  })

  test("a single-item queue keeps a usable close control", async ({ page }) => {
    await page.getByRole("button", { name: "Clear queue", exact: true }).click()
    await trigger(page, 1).press("Enter")
    for (const name of moveLabels) {
      await expect(
        panel(page).getByRole("button", { name, exact: true })
      ).toBeDisabled()
    }
    const done = panel(page).getByRole("button", {
      name: "Done",
      exact: true,
    })
    await expect(done).toBeFocused()
    await done.press("Enter")
    await expect(panel(page)).toHaveCount(0)
    await expect(trigger(page, 1)).toBeFocused()
    await expect(command(page)).toHaveText("--clearqueue")
  })

  test("Enter and Tab operate actions without special shortcuts", async ({
    page,
  }) => {
    await trigger(page, 3).press("Enter")
    await expect(
      panel(page).getByRole("button", { name: "Move up", exact: true })
    ).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(
      panel(page).getByRole("button", { name: "Move down", exact: true })
    ).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(command(page)).toHaveText("--move 3 4")
    await expect(trigger(page, 4)).toBeFocused()
  })

  test("Escape returns focus and focus outside closes without moving", async ({
    page,
  }) => {
    await trigger(page, 2).press("Space")
    await expect(panel(page)).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(panel(page)).toHaveCount(0)
    await expect(trigger(page, 2)).toBeFocused()
    await trigger(page, 2).click()
    const mute = page.getByRole("button", { name: "Mute", exact: true })
    await mute.focus()
    await expect(panel(page)).toHaveCount(0)
    await expect(mute).toBeFocused()
    await expect(command(page)).toHaveText("")
  })

  test("opening actions cancels an old drag payload", async ({ page }) => {
    const before = await rows(page).allTextContents()
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await rows(page).first().dispatchEvent("dragstart", { dataTransfer })
    await trigger(page, 3).click()
    await expect(panel(page)).toBeVisible()
    await rows(page).last().dispatchEvent("drop", { dataTransfer })
    await expect(command(page)).toHaveText("")
    await expect(rows(page)).toHaveText(before)
    await dataTransfer.dispose()
  })

  test("open actions use updated positions after a host change", async ({
    page,
  }) => {
    await trigger(page, 3).click()
    // Programmatic activation simulates a snapshot change while focus stays in the panel.
    await page
      .getByRole("button", { name: "Remove item 1", exact: true })
      .evaluate((button) => (button as HTMLButtonElement).click())
    await expect(rows(page)).toHaveCount(4)
    await expect(panel(page)).toHaveAttribute("aria-label", "Reorder item 2")
    await panel(page)
      .getByRole("button", { name: "Move to end", exact: true })
      .click()
    await expect(command(page)).toHaveText("--move 2 4")
    await expect(rows(page).last()).toContainText("Afterlife Tulum 2025")
    await expect(trigger(page, 4)).toBeFocused()
  })

  test("removing the source closes its actions", async ({ page }) => {
    await trigger(page, 3).click()
    await page
      .getByRole("button", { name: "Remove item 3", exact: true })
      .evaluate((button) => (button as HTMLButtonElement).click())
    await expect(panel(page)).toHaveCount(0)
    await expect(rows(page)).toHaveCount(4)
    await expect(command(page)).toHaveText("--remove 3")
    await page.getByRole("button", { name: "Mute", exact: true }).click()
    await expect(command(page)).toHaveText("--mute")
  })

  test("replacement imports remove obsolete actions", async ({ page }) => {
    await trigger(page, 3).click()
    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "replacement.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          segments: [{ type: "native", title: "Replacement" }],
        })
      ),
    })
    await expect(rows(page)).toHaveCount(1)
    await expect(rows(page)).toContainText("Replacement")
    await expect(panel(page)).toHaveCount(0)
    await expect(command(page)).toHaveText("")
    await trigger(page, 1).click()
    await expect(panel(page)).toContainText("Replacement")
  })

  test("closing the window removes its open panel", async ({ page }) => {
    await trigger(page, 3).click()
    await page
      .getByRole("button", { name: "Close", exact: true })
      .evaluate((button) => (button as HTMLButtonElement).click())
    await expect(panel(page)).toHaveCount(0)
    await page.getByRole("button", { name: "Open queue", exact: true }).click()
    await expect(rows(page)).toHaveCount(5)
    await trigger(page, 2).click()
    await expect(panel(page)).toBeVisible()
    await expect(command(page)).toHaveText("")
  })

  test("the grip still supports a native pointer drag", async ({ page }) => {
    await trigger(page, 1).dragTo(rows(page).nth(2), {
      targetPosition: { x: 60, y: 12 },
    })
    await expect(command(page)).toHaveText("--move 1 3")
    await expect(rows(page).nth(2)).toContainText(
      "Sunset Drive 2025 – Live Set"
    )
    await expect(panel(page)).toHaveCount(0)
  })

  test("move actions fit a short viewport", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 240 })
    await trigger(page, 3).click()
    await expect(panel(page)).toBeInViewport({ ratio: 1 })
    await panel(page)
      .getByRole("button", { name: "Move to end", exact: true })
      .click()
    await expect(command(page)).toHaveText("--move 3 5")
  })

  test("the open panel passes accessibility checks with reduced motion", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.waitForLoadState("networkidle")
    await trigger(page, 3).click()
    await expect(panel(page)).toBeInViewport({ ratio: 1 })
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(results.violations).toEqual([])
  })
})

test.describe("MQS touch move actions", () => {
  test.use({ hasTouch: true, viewport: { width: 320, height: 720 } })
  test.beforeEach(async ({ page }) => openQueue(page))

  test("taps reorder without dragging or a keyboard", async ({ page }) => {
    await trigger(page, 3).tap()
    await expect(panel(page)).toBeInViewport({ ratio: 1 })
    const move = panel(page).getByRole("button", {
      name: "Move to start",
      exact: true,
    })
    const bounds = await move.boundingBox()
    expect(bounds?.height).toBeGreaterThanOrEqual(36)
    await move.tap()
    await expect(command(page)).toHaveText("--move 3 1")
    await expect(rows(page).first()).toContainText("Afterlife Tulum 2025")
    await expect(panel(page)).toHaveCount(0)
    await expect(page.getByTestId("current-row")).toContainText(
      "Tomorrowland 2026 Mainstage W1"
    )
  })

  test("a long queue supports a single move from end to start", async ({
    page,
  }) => {
    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "long.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          segments: Array.from({ length: 500 }, (_, index) => ({
            type: "native",
            title: `Track ${index + 1}`,
          })),
        })
      ),
    })
    await expect(rows(page)).toHaveCount(500)
    await trigger(page, 500).tap()
    await expect(panel(page)).toBeInViewport({ ratio: 1 })
    await panel(page)
      .getByRole("button", { name: "Move to start", exact: true })
      .tap()
    await expect(command(page)).toHaveText("--move 500 1")
    await expect(rows(page).first()).toContainText("Track 500")
    await expect(page.getByTestId("current-row")).toHaveAttribute(
      "data-queue-index",
      "1"
    )
    await expect(page.getByTestId("current-row")).toContainText("Track 1")
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  })
})
