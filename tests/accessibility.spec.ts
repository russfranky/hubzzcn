import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

import { THEME_STORAGE_KEY } from "../src/catalog/theme-provider"

const THEMES = ["dark", "light"] as const

for (const theme of THEMES) {
  test.describe(`Accessibility — ${theme}`, () => {
    test("catalog has no WCAG A or AA violations", async ({ page }) => {
      await page.addInitScript(
        ({ key, selectedTheme }) => {
          localStorage.setItem(key, selectedTheme)
        },
        { key: THEME_STORAGE_KEY, selectedTheme: theme }
      )

      await page.goto("/")
      await page.waitForLoadState("networkidle")
      await expect(page.locator("html")).toHaveClass(
        new RegExp(`\\b${theme}\\b`)
      )
      await expect
        .poll(() =>
          page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY)
        )
        .toBe(theme)

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
