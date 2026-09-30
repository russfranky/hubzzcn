import { expect, test } from "@playwright/test"

test.describe("SpectatorBanner", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.locator("#spectator-banner").scrollIntoViewIfNeeded()
  })

  test("composes the Hubzz mark and gradient action", async ({ page }) => {
    const banner = page
      .locator(
        "#spectator-banner [data-catalog-preview] [data-slot='spectator-banner']"
      )
      .first()

    await expect(banner).toHaveAttribute("aria-label", "Spectator mode")
    await expect(
      banner.locator('[data-slot="spectator-banner-logo"] svg')
    ).toBeVisible()
    await expect(
      banner.getByRole("button", { name: "Log in or Sign up" })
    ).toBeVisible()

    const styles = await banner.evaluate((element) => {
      const style = getComputedStyle(element)
      const action = element.querySelector(
        '[data-slot="spectator-banner-action"]'
      ) as HTMLElement | null
      const actionStyle = action ? getComputedStyle(action) : null
      const logo = element.querySelector(
        '[data-slot="spectator-banner-logo"]'
      ) as HTMLElement | null
      const logoStyle = logo ? getComputedStyle(logo) : null
      return {
        backgroundColor: style.backgroundColor,
        borderRadius: parseFloat(style.borderRadius),
        actionBackgroundImage: actionStyle?.backgroundImage ?? "",
        logoBackgroundColor: logoStyle?.backgroundColor ?? "",
        logoSize: logo
          ? { w: logo.clientWidth, h: logo.clientHeight }
          : { w: 0, h: 0 },
      }
    })

    expect(styles.backgroundColor).toBe("rgb(36, 38, 43)")
    expect(styles.borderRadius).toBeGreaterThan(40)
    expect(styles.actionBackgroundImage).toContain("linear-gradient")
    expect(styles.actionBackgroundImage).toMatch(
      /rgb\(154,\s*119,\s*255\)|#9A77FF/i
    )
    expect(styles.logoSize).toEqual({ w: 44, h: 44 })
    // No light tile wrapper behind the mark
    expect(styles.logoBackgroundColor).toMatch(
      /rgba\(0,\s*0,\s*0,\s*0\)|transparent/
    )
  })

  test("switches from pill to stacked mobile layout", async ({ page }) => {
    const banner = page
      .locator(
        "#spectator-banner [data-catalog-preview] [data-slot='spectator-banner']"
      )
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

})
