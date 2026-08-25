import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

import { THEME_STORAGE_KEY } from "../../src/catalog/theme-provider"
import { normalizeCssColor } from "../helpers/colors"

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate(
    ([storageKey, nextTheme]) => {
      localStorage.setItem(storageKey, nextTheme)
    },
    [THEME_STORAGE_KEY, theme]
  )
  await page.reload()
  await page.waitForLoadState("networkidle")
  await expect(page.locator("html")).toHaveClass(new RegExp(`\\b${theme}\\b`))
}

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

    const readVisualContract = async () => {
      await button.scrollIntoViewIfNeeded()
      const [geometry, backgroundColor, color] = await Promise.all([
        button.evaluate((element) => {
          const style = getComputedStyle(element)
          return {
            height: style.height,
            borderRadius: style.borderRadius,
            fontWeight: style.fontWeight,
            backgroundImage: style.backgroundImage,
          }
        }),
        normalizeCssColor(button, "backgroundColor"),
        normalizeCssColor(button, "color"),
      ])
      return { ...geometry, backgroundColor, color }
    }

    await setTheme(page, "light")
    await expect(readVisualContract()).resolves.toEqual({
      height: "36px",
      borderRadius: "8px",
      fontWeight: "500",
      backgroundImage: "none",
      backgroundColor: "rgb(3, 2, 19)",
      color: "rgb(255, 255, 255)",
    })

    await setTheme(page, "dark")
    await expect(readVisualContract()).resolves.toEqual({
      height: "36px",
      borderRadius: "8px",
      fontWeight: "500",
      backgroundImage: "none",
      backgroundColor: "rgb(250, 250, 250)",
      color: "rgb(23, 23, 23)",
    })
  })

  test("enabled controls expose the canonical focus ring", async ({ page }) => {
    const button = page
      .locator("#button")
      .getByRole("button", { name: "Continue" })

    await page.locator("body").click({ position: { x: 1, y: 1 } })
    for (let index = 0; index < 50; index += 1) {
      if (
        await button.evaluate((element) => element === document.activeElement)
      ) {
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
