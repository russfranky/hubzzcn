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

  test("matches canonical shadcn geometry and neutral theme roles", async ({
    page,
  }) => {
    const button = page
      .locator("#button")
      .getByRole("button", { name: "Continue" })

    await page.evaluate(() => {
      document.documentElement.classList.remove("dark")
      document.documentElement.classList.add("light")
    })

    const light = await button.evaluate((element) => {
      const buttonStyle = getComputedStyle(element)
      const rootStyle = getComputedStyle(document.documentElement)
      return {
        height: buttonStyle.height,
        borderRadius: buttonStyle.borderRadius,
        fontWeight: buttonStyle.fontWeight,
        backgroundImage: buttonStyle.backgroundImage,
        primary: rootStyle.getPropertyValue("--primary").trim(),
        ring: rootStyle.getPropertyValue("--ring").trim(),
        radius: rootStyle.getPropertyValue("--radius").trim(),
      }
    })

    expect(light).toEqual({
      height: "36px",
      borderRadius: "8px",
      fontWeight: "500",
      backgroundImage: "none",
      primary: "#030213",
      ring: "oklch(0.708 0 0)",
      radius: "0.625rem",
    })

    await page.evaluate(() => {
      document.documentElement.classList.remove("light")
      document.documentElement.classList.add("dark")
    })

    const dark = await button.evaluate((element) => {
      const buttonStyle = getComputedStyle(element)
      const rootStyle = getComputedStyle(document.documentElement)
      return {
        height: buttonStyle.height,
        borderRadius: buttonStyle.borderRadius,
        fontWeight: buttonStyle.fontWeight,
        backgroundImage: buttonStyle.backgroundImage,
        primary: rootStyle.getPropertyValue("--primary").trim(),
        ring: rootStyle.getPropertyValue("--ring").trim(),
      }
    })

    expect(dark).toEqual({
      height: "36px",
      borderRadius: "8px",
      fontWeight: "500",
      backgroundImage: "none",
      primary: "oklch(0.985 0 0)",
      ring: "oklch(0.439 0 0)",
    })
  })

  test("enabled controls expose the canonical focus ring", async ({ page }) => {
    const button = page
      .locator("#button")
      .getByRole("button", { name: "Continue" })

    await page.locator("body").click({ position: { x: 1, y: 1 } })
    for (let index = 0; index < 50; index += 1) {
      if (await button.evaluate((element) => element === document.activeElement)) {
        break
      }
      await page.keyboard.press("Tab")
    }
    await expect(button).toBeFocused()

    const boxShadow = await button.evaluate(
      (element) => getComputedStyle(element).boxShadow
    )
    expect(boxShadow).not.toBe("none")
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
