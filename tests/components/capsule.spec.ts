/**
 * Capsule component tests — DOM measurement + color verification.
 *
 * Run: npm run test:ui
 */

import { test, expect, type Page } from "@playwright/test"
import { hexToRgb, normalizeCssColor } from "../helpers/colors"

// spec colors
const BG_BASE       = hexToRgb("#24262B") // rgb(36, 38, 43)
const BG_HOVER      = hexToRgb("#2E3238") // rgb(46, 50, 56) — intentional UX addition
const TEXT_ACTIVE   = hexToRgb("#FCFDFE") // rgb(252, 253, 254)
const TEXT_INACTIVE = hexToRgb("#ACB9C4") // rgb(172, 185, 196)

test.describe("Capsule", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto("/")
    await page.locator("#capsule").scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
  })

  test.afterAll(async () => {
    await page.close()
  })

  // ── Dimensions ───────────────────────────────────────────────────────────

  test("all capsules are 30px tall", async () => {
    const capsules = page.locator("#capsule button")
    for (const capsule of await capsules.all()) {
      const box = await capsule.boundingBox()
      expect(box?.height, "capsule height").toBe(30)
    }
  })

  // ── Background color ─────────────────────────────────────────────────────

  test("all capsules have base bg #24262B", async () => {
    const capsules = page.locator("#capsule button")
    for (const capsule of await capsules.all()) {
      const bg = await normalizeCssColor(capsule, "backgroundColor")
      expect(bg, "capsule bg").toBe(BG_BASE)
    }
  })

  test("capsule background changes on hover", async () => {
    const capsule = page.locator("#capsule button").first()
    const bgRest = await normalizeCssColor(capsule, "backgroundColor")
    await capsule.hover()
    await page.waitForTimeout(300)
    const bgHover = await normalizeCssColor(capsule, "backgroundColor")
    expect(bgHover, "hover should differ from rest").not.toBe(bgRest)
  })

  // ── Text colors ──────────────────────────────────────────────────────────

  test("active capsules have text color #FCFDFE", async () => {
    // Landing.tsx: Music and Gaming are active
    // Use normalizeCssColor because Tailwind v4 may output near-white colors in oklch format
    const activeCapsules = page.locator("#capsule button.text-foreground")
    await expect(activeCapsules).toHaveCount(2)
    for (const capsule of await activeCapsules.all()) {
      const color = await normalizeCssColor(capsule, "color")
      expect(color, "active text color").toBe(TEXT_ACTIVE)
    }
  })

  test("inactive capsules have text color #ACB9C4", async () => {
    // Landing.tsx: Art, Sports, Technology are inactive
    const inactiveCapsules = page.locator("#capsule button.text-hubzz-muted")
    await expect(inactiveCapsules).toHaveCount(3)
    for (const capsule of await inactiveCapsules.all()) {
      const color = await normalizeCssColor(capsule, "color")
      expect(color, "inactive text color").toBe(TEXT_INACTIVE)
    }
  })

  // ── Typography ───────────────────────────────────────────────────────────

  test("capsule text is 12px weight 500", async () => {
    const capsule = page.locator("#capsule button").first()
    const styles = await capsule.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { fontSize: cs.fontSize, fontWeight: cs.fontWeight }
    })
    expect(styles.fontSize).toBe("12px")
    expect(styles.fontWeight).toBe("500")
  })

  // ── Cursor ───────────────────────────────────────────────────────────────

  test("capsules have pointer cursor", async () => {
    const capsules = page.locator("#capsule button")
    for (const capsule of await capsules.all()) {
      const cursor = await capsule.evaluate((el) => getComputedStyle(el).cursor)
      expect(cursor, "capsule cursor").toBe("pointer")
    }
  })
})
