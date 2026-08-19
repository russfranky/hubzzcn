import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

test.describe("Button", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("catalog examples expose semantic button states", async ({ page }) => {
    const section = page.locator("#button")
    await section.scrollIntoViewIfNeeded()

    await expect(
      section.getByRole("button", { name: "Continue" })
    ).toBeVisible()
    await expect(
      section.getByRole("button", { name: "Cancel" })
    ).toHaveAttribute("data-variant", "secondary")
    await expect(
      section.getByRole("button", { name: "Delete" })
    ).toHaveAttribute("data-variant", "destructive")
    await expect(
      section.getByRole("button", { name: "Unavailable" })
    ).toBeDisabled()
    await expect(
      section.getByRole("button", { name: "Share", exact: true }).last()
    ).toHaveAttribute("data-size", "icon")
  })

  test("enabled controls can receive keyboard focus", async ({ page }) => {
    const button = page
      .locator("#button")
      .getByRole("button", { name: "Continue" })
    await button.focus()
    await expect(button).toBeFocused()

    const outline = await button.evaluate(
      (element) => getComputedStyle(element).outlineStyle
    )
    expect(outline).toBeTruthy()
  })

  test("button catalog section has no WCAG A/AA violations", async ({
    page,
  }) => {
    const section = page.locator("#button")
    await section.scrollIntoViewIfNeeded()

    const results = await new AxeBuilder({ page })
      .include("#button")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze()

    expect(results.violations).toEqual([])
  })
})
