import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("Accessibility", () => {
  test("catalog has no serious or critical WCAG violations", async ({
    page,
  }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()

    const violations = results.violations.filter(
      (violation) =>
        violation.impact === "critical" || violation.impact === "serious"
    )

    expect(
      violations,
      violations
        .map(
          (violation) =>
            `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`
        )
        .join("\n")
    ).toEqual([])
  })
})
