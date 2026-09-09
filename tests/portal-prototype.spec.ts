import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test("Portal opens Spaces as a filter and keeps discovery available", async ({
  page,
}) => {
  await page.goto("/cn/portal")

  await expect(page.getByText("Spaces", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Back" })).toBeVisible()
  await expect(page).toHaveURL(/portal=hubzz_tower_portal/)

  await page.getByLabel("Search spaces").fill("Hallway 12")
  await expect(page.getByRole("heading", { name: "Hallway 12" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Hallway 11" })).toHaveCount(0)

  await page.getByLabel("Search spaces").fill("")
  await page
    .getByRole("button", { name: "View Hallway 12 and 15 attached spaces" })
    .click()

  await expect(page).toHaveURL(/attachedTo=hallway-12/)
  await expect(page.getByText("12-01", { exact: true })).toBeVisible()

  await page.getByRole("button", { name: "Back" }).click()
  await expect(page).toHaveURL(/portal=hubzz_tower_portal/)
  await expect(page.getByRole("heading", { name: "Hallway 12" })).toBeVisible()

  await page.getByRole("button", { name: "Filter spaces" }).click()
  await page.getByRole("menuitemradio", { name: "All spaces" }).click()

  await expect(page).toHaveURL(/scope=all/)
  await expect(page.getByRole("heading", { name: "The Lounge" })).toBeVisible()
})

test("routes Join through the pre-alpha profile host callback shape", async ({
  page,
}) => {
  await page.goto("/cn/portal?scope=all")

  const lounge = page.locator('[data-space-id="the-lounge"]')
  await lounge.getByRole("button", { name: "Join" }).click()

  await expect(page.getByTestId("last-portal-join")).toHaveText(
    JSON.stringify({ spaceId: "the-lounge", title: "The Lounge", path: null })
  )
})

test("supports every Portal route alias and preserves the query route", async ({
  page,
}) => {
  await page.goto("/portal")
  await expect(page.getByRole("region", { name: "Spaces" })).toBeVisible()
  await expect(page).toHaveURL(/portal=hubzz_tower_portal/)

  await page.goto("/?prototype=portal")
  await expect(page.getByRole("region", { name: "Spaces" })).toBeVisible()
  await expect(page).toHaveURL(/prototype=portal/)
  await expect(page).toHaveURL(/portal=hubzz_tower_portal/)

  await page.reload()
  await expect(page.getByRole("region", { name: "Spaces" })).toBeVisible()
  await expect(page).toHaveURL(/prototype=portal/)
})

test("keeps pre-alpha search and filter controls on the 32px sizing unit", async ({
  page,
}) => {
  await page.goto("/cn/portal")

  const search = page.getByLabel("Search spaces")
  const filter = page.getByRole("button", { name: "Filter spaces" })
  const searchBox = await search.boundingBox()
  const filterBox = await filter.boundingBox()

  if (!searchBox || !filterBox) {
    throw new Error("Portal toolbar geometry is unavailable")
  }

  expect(Math.abs(searchBox.height - 32)).toBeLessThan(1)
  expect(Math.abs(filterBox.height - 32)).toBeLessThan(1)
  expect(Math.abs(filterBox.width - 32)).toBeLessThan(1)
})

test("normalizes search text and exposes a no-results state", async ({
  page,
}) => {
  await page.goto("/cn/portal")

  const search = page.getByLabel("Search spaces")
  await search.fill("  hallway 12  ")
  await expect(page.getByRole("heading", { name: "Hallway 12" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Hallway 11" })).toHaveCount(0)

  await search.fill("not a space")
  await expect(page.getByText("No spaces match this search.")).toBeVisible()
})

test("normalizes unsupported hallway deep links to the Portal scope", async ({
  page,
}) => {
  await page.goto("/cn/portal?attachedTo=hallway-999")

  await expect(page).toHaveURL(/portal=hubzz_tower_portal/)
  await expect(page).not.toHaveURL(/attachedTo=hallway-999/)
  await expect(page.getByRole("heading", { name: "Hallway 12" })).toBeVisible()
})

test("uses a keyboard-safe scope menu with focus return", async ({ page }) => {
  await page.goto("/cn/portal")

  const filter = page.getByRole("button", { name: "Filter spaces" })
  await filter.focus()
  await page.keyboard.press("Enter")

  await expect(
    page.getByRole("menuitemradio", { name: "Hubzz Tower Portal" })
  ).toBeVisible()
  await expect(
    page.getByRole("menuitemradio", { name: "All spaces" })
  ).toBeVisible()

  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("menuitemradio", { name: "All spaces" })
  ).toHaveCount(0)
  await expect(filter).toBeFocused()

  await filter.click()
  await page.getByRole("menuitemradio", { name: "All spaces" }).click()
  await expect(page).toHaveURL(/scope=all/)
  await expect(filter).toBeFocused()
})

test("keeps the Spaces landmark truthful across scope changes", async ({
  page,
}) => {
  await page.goto("/cn/portal")

  await expect(page.getByRole("region", { name: "Spaces" })).toBeVisible()

  await page.getByRole("button", { name: "Filter spaces" }).click()
  await page.getByRole("menuitemradio", { name: "All spaces" }).click()

  await expect(page.getByRole("region", { name: "Spaces" })).toBeVisible()
})

test("keeps the visible count in sync with scope and search", async ({
  page,
}) => {
  await page.goto("/cn/portal")

  await expect(page.getByText("13", { exact: true })).toBeVisible()
  await page.getByLabel("Search spaces").fill("Hallway 12")
  await expect(page.getByText("1", { exact: true })).toBeVisible()

  await page.getByLabel("Search spaces").fill("")
  await page.getByRole("button", { name: "Filter spaces" }).click()
  await page.getByRole("menuitemradio", { name: "All spaces" }).click()
  await expect(page.getByText("17", { exact: true })).toBeVisible()
})

test("keeps the Portal panel usable on a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto("/cn/portal")

  const panel = page.getByRole("region", { name: "Spaces" })
  const box = await panel.boundingBox()
  if (!box) throw new Error("Portal panel has no bounding box")

  expect(box.width).toBeLessThanOrEqual(296)
  await expect(page.getByRole("button", { name: "Back" })).toBeVisible()
  await expect(page.getByLabel("Search spaces")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Filter spaces" })
  ).toBeVisible()
})

test("Portal has no WCAG A or AA violations", async ({ page }) => {
  await page.goto("/cn/portal")
  await page.waitForLoadState("networkidle")

  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze()

  expect(
    results.violations,
    results.violations
      .map(
        (violation) =>
          `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`
      )
      .join("\n")
  ).toEqual([])
})
