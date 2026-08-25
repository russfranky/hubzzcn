import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("HubzzLogo", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.locator("#hubzz-logo").scrollIntoViewIfNeeded()
  })

  test("current-color variants inherit the host semantic color", async ({
    page,
  }) => {
    const logo = page.locator('#hubzz-logo [data-variant="light"]').first()
    const path = logo.locator("path")

    await expect(path).toHaveAttribute("fill", "currentColor")
    const [color, fill] = await Promise.all([
      logo.evaluate((element) => getComputedStyle(element).color),
      path.evaluate((element) => getComputedStyle(element).fill),
    ])
    expect(fill).toBe(color)
  })

  test("decorative marks stay hidden from assistive technology", async ({
    page,
  }) => {
    const logo = page.locator('#hubzz-logo [data-variant="icon"]').first()
    await expect(logo).toHaveAttribute("aria-hidden", "true")
    await expect(logo).not.toHaveAttribute("role", "img")
  })

  test("titled marks expose image semantics and requested size", async ({
    page,
  }) => {
    const logo = page.getByRole("img", { name: "Hubzz", exact: true })
    await expect(logo).toHaveAttribute("width", "40")
    await expect(logo).toHaveAttribute("height", "40")
  })

  test("legacy white-mark mode does not define a chromatic brand color", async ({
    page,
  }) => {
    const path = page
      .locator('#hubzz-logo [data-variant="dark"]')
      .first()
      .locator("path")
    await expect(path).toHaveAttribute("fill", "white")
  })

  test("catalog section has no WCAG A/AA violations", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include("#hubzz-logo")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()

    expect(results.violations).toEqual([])
  })
})
