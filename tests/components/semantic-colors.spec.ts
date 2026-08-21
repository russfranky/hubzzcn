import { expect, test } from "@playwright/test"

import { THEME_STORAGE_KEY } from "../../src/catalog/theme-provider"
import { hexToRgb, normalizeCssColor } from "../helpers/colors"

const LIGHT_FOREGROUND = hexToRgb("#12131A")
const INVERSE_FOREGROUND = hexToRgb("#FCFDFE")

test.describe("Semantic foreground colors", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(
      ({ key }) => localStorage.setItem(key, "light"),
      { key: THEME_STORAGE_KEY }
    )
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await expect(page.locator("html")).toHaveClass(/\blight\b/)
  })

  test("BadgeCategory neutral states follow the light theme foreground", async ({
    page,
  }) => {
    const badges = page
      .locator("#badge-category")
      .locator('[data-state="default"], [data-state="hover"]')

    await expect(badges).toHaveCount(4)
    for (const badge of await badges.all()) {
      await expect
        .poll(() => normalizeCssColor(badge, "color"))
        .toBe(LIGHT_FOREGROUND)
    }
  })

  test("inverse semantic foregrounds remain readable", async ({ page }) => {
    const activeBadge = page
      .locator("#badge-category")
      .locator('[data-state="active"]')
    await expect(activeBadge).toHaveCount(1)
    await expect
      .poll(() => normalizeCssColor(activeBadge, "color"))
      .toBe(INVERSE_FOREGROUND)

    const destructiveButton = page
      .locator("#button [data-catalog-preview]")
      .locator('[data-slot="button"][data-variant="destructive"]')
      .first()
    await expect(destructiveButton).toBeVisible()
    await expect
      .poll(() => normalizeCssColor(destructiveButton, "color"))
      .toBe(INVERSE_FOREGROUND)
  })
})
