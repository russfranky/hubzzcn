/**
 * Capsule component tests — DOM measurement + color verification.
 *
 * Run: npm run test:ui
 */

import { test, expect, type Page } from "@playwright/test"
import { hexToRgb, normalizeCssColor } from "../helpers/colors"

// spec colors
const BG_BASE = hexToRgb("#24262B") // rgb(36, 38, 43)
const TEXT_ACTIVE = hexToRgb("#FCFDFE") // rgb(252, 253, 254)
const TEXT_INACTIVE = hexToRgb("#ACB9C4") // rgb(172, 185, 196)

function capsules(page: Page) {
  return page.locator('#capsule [data-catalog-preview] [data-slot="toggle"]')
}

function capsulesByState(page: Page, pressed: boolean) {
  return page.locator(
    `#capsule [data-catalog-preview] [data-slot="toggle"][aria-pressed="${pressed}"]`
  )
}

test.describe("Capsule", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto("/")
    await page.locator("#capsule").scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    await expect(capsules(page)).toHaveCount(5)
  })

  test.afterAll(async () => {
    await page.close()
  })

  // ── Dimensions ───────────────────────────────────────────────────────────

  test("all capsules are 30px tall", async () => {
    for (const capsule of await capsules(page).all()) {
      const box = await capsule.boundingBox()
      expect(box?.height, "capsule height").toBe(30)
    }
  })

  // ── Background color ─────────────────────────────────────────────────────

  test("all capsules have base bg #24262B", async () => {
    for (const capsule of await capsules(page).all()) {
      const bg = await normalizeCssColor(capsule, "backgroundColor")
      expect(bg, "capsule bg").toBe(BG_BASE)
    }
  })

  test("capsule background changes on hover", async () => {
    const capsule = capsules(page).first()
    const bgRest = await normalizeCssColor(capsule, "backgroundColor")
    await capsule.hover()
    await page.waitForTimeout(300)
    const bgHover = await normalizeCssColor(capsule, "backgroundColor")
    expect(bgHover, "hover should differ from rest").not.toBe(bgRest)
  })

  // ── Text colors ──────────────────────────────────────────────────────────

  test("active capsules have text color #FCFDFE", async () => {
    const activeCapsules = capsulesByState(page, true)
    await expect(activeCapsules).toHaveCount(2)
    for (const capsule of await activeCapsules.all()) {
      const color = await normalizeCssColor(capsule, "color")
      expect(color, "active text color").toBe(TEXT_ACTIVE)
    }
  })

  test("inactive capsules have text color #ACB9C4", async () => {
    const inactiveCapsules = capsulesByState(page, false)
    await expect(inactiveCapsules).toHaveCount(3)
    for (const capsule of await inactiveCapsules.all()) {
      const color = await normalizeCssColor(capsule, "color")
      expect(color, "inactive text color").toBe(TEXT_INACTIVE)
    }
  })

  // ── Typography ───────────────────────────────────────────────────────────

  test("capsule text is 12px weight 500", async () => {
    const capsule = capsules(page).first()
    const styles = await capsule.evaluate((el) => {
      const cs = getComputedStyle(el)
      return { fontSize: cs.fontSize, fontWeight: cs.fontWeight }
    })
    expect(styles.fontSize).toBe("12px")
    expect(styles.fontWeight).toBe("500")
  })

  // ── Cursor ───────────────────────────────────────────────────────────────

  test("capsules have pointer cursor", async () => {
    for (const capsule of await capsules(page).all()) {
      const cursor = await capsule.evaluate((el) => getComputedStyle(el).cursor)
      expect(cursor, "capsule cursor").toBe("pointer")
    }
  })
})
