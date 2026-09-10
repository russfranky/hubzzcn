import { expect, test, type Page } from "@playwright/test"

const rows = (page: Page) =>
  page.getByRole("list", { name: "Media queue items" }).getByRole("listitem")
const grip = (page: Page, position: number) =>
  page.getByRole("button", { name: `Reorder item ${position}`, exact: true })
const remove = (page: Page, position: number) =>
  page.getByRole("button", { name: `Remove item ${position}`, exact: true })

test.describe("MQS focus recovery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?prototype=mqs")
    await expect(rows(page)).toHaveCount(5)
  })

  for (const [position, next, expectedTitle] of [
    [1, 1, "Tomorrowland 2026 Mainstage W1"],
    [3, 3, "Calvin Harris – Live at Ushuaïa"],
    [5, 4, "Calvin Harris – Live at Ushuaïa"],
  ] as const) {
    test(`keyboard removal at position ${position} focuses a surviving grip`, async ({
      page,
    }) => {
      await remove(page, position).press("Enter")
      await expect(rows(page)).toHaveCount(4)
      await expect(grip(page, next)).toBeFocused()
      await expect(rows(page).nth(next - 1)).toContainText(expectedTitle)
      await expect(grip(page, next)).toBeInViewport()
    })
  }

  test("removing the final row focuses Load setlist", async ({ page }) => {
    await page.getByRole("button", { name: "Clear queue", exact: true }).click()
    await remove(page, 1).press("Space")
    await expect(page.getByText("Queue is empty.")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Load setlist", exact: true })
    ).toBeFocused()
  })

  test("Enter after removal does not delete a second row", async ({ page }) => {
    await remove(page, 3).press("Enter")
    await expect(grip(page, 3)).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(rows(page)).toHaveCount(4)
    await expect(
      page.getByRole("dialog", { name: "Reorder item 3", exact: true })
    ).toBeVisible()
  })

  test("focus survives removal of an open action panel", async ({ page }) => {
    await grip(page, 3).press("Enter")
    await expect(page.getByRole("dialog")).toBeVisible()
    await remove(page, 3).evaluate((button) =>
      (button as HTMLButtonElement).click()
    )
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(grip(page, 3)).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(remove(page, 3)).toBeFocused()
  })

  test("unrelated programmatic deletion preserves outside focus", async ({
    page,
  }) => {
    const mute = page.getByRole("button", { name: "Mute", exact: true })
    await mute.focus()
    await remove(page, 3).evaluate((button) =>
      (button as HTMLButtonElement).click()
    )
    await expect(rows(page)).toHaveCount(4)
    await expect(mute).toBeFocused()
  })

  test("Previous at the first item leaves focus on a usable control", async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Previous", exact: true })
      .press("Enter")
    await expect(
      page.getByRole("button", { name: "Previous", exact: true })
    ).toBeDisabled()
    await expect(
      page.getByRole("button", { name: "Pause", exact: true })
    ).toBeFocused()
    await expect(rows(page)).toHaveCount(5)
  })
})
