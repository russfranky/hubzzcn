import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const THEMES = ["dark", "light"] as const

for (const theme of THEMES) {
  test.describe(`Accessibility — ${theme}`, () => {
    test("catalog has no WCAG A or AA violations", async ({ page }) => {
      await page.addInitScript((selectedTheme) => {
        localStorage.setItem("theme", selectedTheme)
      }, theme)

      await page.goto("/")
      await page.waitForLoadState("networkidle")
      await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`))

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
  })
}
