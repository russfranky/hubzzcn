/**
 * BadgeCategory component tests — DOM measurement + semantic theme roles.
 *
 * Run: pnpm test:ui
 */

import { expect, test, type Page } from "@playwright/test"
import { normalizeCssColor, normalizeCssVariableColor } from "../helpers/colors"

test.describe("BadgeCategory", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto("/")
    await page.locator("#badge-category").scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test("all badges are 36px tall", async () => {
    const badges = page.locator("#badge-category [data-state]")
    for (const badge of await badges.all()) {
      const box = await badge.boundingBox()
      expect(box?.height, "badge height").toBe(36)
    }
  })

  test("default state uses the background role", async () => {
    const badge = page.locator('#badge-category [data-state="default"]').first()
    const [background, expected] = await Promise.all([
      normalizeCssColor(badge, "backgroundColor"),
      normalizeCssVariableColor(page, "--background"),
    ])
    expect(background).toBe(expected)
  })

  test("active state uses primary roles", async () => {
    const badge = page.locator('#badge-category [data-state="active"]').first()
    const [background, color, expectedBackground, expectedColor] =
      await Promise.all([
        normalizeCssColor(badge, "backgroundColor"),
        normalizeCssColor(badge, "color"),
        normalizeCssVariableColor(page, "--primary"),
        normalizeCssVariableColor(page, "--primary-foreground"),
      ])

    expect(background).toBe(expectedBackground)
    expect(color).toBe(expectedColor)
  })

  test("controlled hover state uses the card role", async () => {
    const badge = page.locator('#badge-category [data-state="hover"]').first()
    const [background, expected] = await Promise.all([
      normalizeCssColor(badge, "backgroundColor"),
      normalizeCssVariableColor(page, "--card"),
    ])
    expect(background).toBe(expected)
  })

  test(
    "default badge transitions to the card role on mouse hover",
    async () => {
      const badge = page
        .locator('#badge-category [data-state="default"]')
        .first()
      await badge.hover()
      await page.waitForTimeout(300)
      const [background, expected] = await Promise.all([
        normalizeCssColor(badge, "backgroundColor"),
        normalizeCssVariableColor(page, "--card"),
      ])
      expect(background).toBe(expected)
    }
  )

  test("default badge uses foreground typography", async () => {
    const badge = page.locator("#badge-category [data-state]").first()
    const [color, expectedColor, styles] = await Promise.all([
      normalizeCssColor(badge, "color"),
      normalizeCssVariableColor(page, "--foreground"),
      badge.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
        }
      }),
    ])

    expect(color).toBe(expectedColor)
    expect(styles.fontSize).toBe("14px")
    expect(styles.fontWeight).toBe("500")
  })

  test("remove button is present when onRemove is provided", async () => {
    const section = page.locator("#badge-category")
    const removeButtons = section.locator("button[aria-label='Remove']")
    await expect(removeButtons).toHaveCount(4)
  })

  test("remove button is absent without onRemove prop", async () => {
    const lastBadge = page.locator("#badge-category [data-state]").last()
    const removeButton = lastBadge.locator("button")
    await expect(removeButton).toHaveCount(0)
  })
})
