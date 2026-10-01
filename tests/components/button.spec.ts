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

  test("matches intentional Hubzz kit geometry and brand treatment", async ({
    page,
  }) => {
    const button = page
      .locator("#button")
      .getByRole("button", { name: "Continue" })

    const readVisualContract = async () => {
      await button.scrollIntoViewIfNeeded()
      const [geometry, color] = await Promise.all([
        button.evaluate((element) => {
          const style = getComputedStyle(element)
          return {
            height: style.height,
            borderRadius: style.borderRadius,
            fontWeight: style.fontWeight,
            backgroundImage: style.backgroundImage,
          }
        }),
        normalizeCssColor(button, "color"),
      ])
      return { ...geometry, color }
    }

    const assertHubzzKit = async () => {
      const contract = await readVisualContract()
      expect(contract.height).toBe("36px")
      // rounded-full resolves to a pill radius (>= half height, often infinity px)
      expect(Number.parseFloat(contract.borderRadius)).toBeGreaterThanOrEqual(
        18
      )
      expect(contract.fontWeight).toBe("600")
      expect(contract.backgroundImage).toContain("linear-gradient")
      expect(contract.backgroundImage).toContain("oklch(0.667 0.194 292.169)")
      expect(contract.backgroundImage).toContain("oklch(0.592 0.221 283.18)")
      // primary-foreground stays near-white in both themes
      expect(contract.color).toBe("rgb(252, 253, 254)")
    }

    await setTheme(page, "light")
    await assertHubzzKit()

    await setTheme(page, "dark")
    await assertHubzzKit()
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
