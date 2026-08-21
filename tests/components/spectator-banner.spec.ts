import { expect, test } from "@playwright/test"

test.describe("SpectatorBanner", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.locator("#spectator-banner").scrollIntoViewIfNeeded()
  })

  test("composes the Hubzz mark and primary action", async ({ page }) => {
    const banner = page
      .locator("#spectator-banner [data-catalog-preview] [data-slot='spectator-banner']")
      .first()

    await expect(banner).toHaveAttribute("aria-label", "Spectator mode")
    await expect(
      banner.locator('[data-slot="spectator-banner-logo"] svg')
    ).toBeVisible()
    await expect(
      banner.getByRole("button", { name: "Log in or Sign up" })
    ).toBeVisible()
  })

  test("switches from pill to stacked mobile layout", async ({ page }) => {
    const banner = page
      .locator("#spectator-banner [data-catalog-preview] [data-slot='spectator-banner']")
      .first()

    await page.setViewportSize({ width: 1280, height: 900 })
    const desktop = await banner.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        flexDirection: style.flexDirection,
        borderRadius: parseFloat(style.borderRadius),
      }
    })
    expect(desktop.flexDirection).toBe("row")
    expect(desktop.borderRadius).toBeGreaterThan(40)

    await page.setViewportSize({ width: 500, height: 800 })
    const mobile = await banner.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        flexDirection: style.flexDirection,
        alignItems: style.alignItems,
        borderRadius: parseFloat(style.borderRadius),
      }
    })
    expect(mobile.flexDirection).toBe("column")
    expect(mobile.alignItems).toBe("flex-end")
    expect(mobile.borderRadius).toBe(12)
  })

  test("supports an informational state without an action", async ({ page }) => {
    const section = page.locator("#spectator-banner")
    const informational = section
      .locator('[data-slot="spectator-banner"]')
      .filter({ hasText: "Spectator mode is active for this session." })

    await expect(informational).toHaveCount(1)
    await expect(informational.getByRole("button")).toHaveCount(0)
  })
})
