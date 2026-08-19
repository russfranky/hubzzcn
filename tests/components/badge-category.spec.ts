/**
 * BadgeCategory component tests — DOM measurement + color verification.
 *
 * Run: npm run test:ui
 */

import { test, expect, type Page } from "@playwright/test"
import { hexToRgb, normalizeCssColor } from "../helpers/colors"

// spec colors
const BG_DEFAULT = hexToRgb("#181B1F") // rgb(24, 27, 31)
const BG_HOVER   = hexToRgb("#24262B") // rgb(36, 38, 43)
const BG_ACTIVE  = hexToRgb("#392F7D") // rgb(57, 47, 125)

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

  // ── Dimensions ───────────────────────────────────────────────────────────

  test("all badges are 36px tall", async () => {
    // Use data-state to select only top-level badge containers, not inner elements
    const badges = page.locator("#badge-category [data-state]")
    for (const badge of await badges.all()) {
      const box = await badge.boundingBox()
      expect(box?.height, "badge height").toBe(36)
    }
  })

  // ── Background colors by state ───────────────────────────────────────────

  test("default state has bg #181B1F", async () => {
    const badge = page.locator('#badge-category [data-state="default"]').first()
    const bg = await normalizeCssColor(badge, "backgroundColor")
    expect(bg).toBe(BG_DEFAULT)
  })

  test("active state has bg #392F7D", async () => {
    const badge = page.locator('#badge-category [data-state="active"]').first()
    const bg = await normalizeCssColor(badge, "backgroundColor")
    expect(bg).toBe(BG_ACTIVE)
  })

  test("hover state prop has bg #24262B", async () => {
    const badge = page.locator('#badge-category [data-state="hover"]').first()
    const bg = await normalizeCssColor(badge, "backgroundColor")
    expect(bg).toBe(BG_HOVER)
  })

  test("default badge transitions to #24262B on mouse hover", async () => {
    const badge = page.locator('#badge-category [data-state="default"]').first()
    await badge.hover()
    await page.waitForTimeout(300)
    const bg = await normalizeCssColor(badge, "backgroundColor")
    expect(bg, "hover bg should be #24262B").toBe(BG_HOVER)
  })

  // ── Text styling ─────────────────────────────────────────────────────────

  test("badge text is white, 14px, weight 500", async () => {
    const badge = page.locator("#badge-category [data-state]").first()
    const styles = await badge.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { color: cs.color, fontSize: cs.fontSize, fontWeight: cs.fontWeight }
    })
    expect(styles.color).toMatch(/^rgb\(25[0-5], 25[0-5], 25[0-5]\)$/)
    expect(styles.fontSize).toBe("14px")
    expect(styles.fontWeight).toBe("500")
  })

  // ── Remove button ─────────────────────────────────────────────────────────

  test("remove button is present when onRemove is provided", async () => {
    // First 4 badges have onRemove; last one (Technology) does not
    const section = page.locator("#badge-category")
    const removeBtns = section.locator("button[aria-label='Remove']")
    await expect(removeBtns).toHaveCount(4)
  })

  test("remove button is absent without onRemove prop", async () => {
    // Technology badge (last one) has no onRemove prop
    const lastBadge = page.locator("#badge-category [data-state]").last()
    const removeBtn = lastBadge.locator("button")
    await expect(removeBtn).toHaveCount(0)
  })
})
