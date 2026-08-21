/**
 * ToastBanner component tests — DOM measurement + color verification.
 *
 * Run: npm run test:ui
 */

import { test, expect, type Page } from "@playwright/test"
import { hexToRgb } from "../helpers/colors"

// spec background colors per type
const BG_NEUTRAL = hexToRgb("#24262B") // rgb(36, 38, 43)
const BG_BLUE = hexToRgb("#194084") // rgb(25, 64, 132)
const BG_SUCCESS = hexToRgb("#054E31") // rgb(5, 78, 49)
const BG_WARNING = hexToRgb("#792D0D") // rgb(121, 45, 13)
const BG_ERROR = hexToRgb("#7A2619") // rgb(122, 38, 25)

test.describe("ToastBanner", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto("/")
    await page.locator("#toast-banner").scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
  })

  test.afterAll(async () => {
    await page.close()
  })

  // ── Dimensions ───────────────────────────────────────────────────────────

  test("all banners have min-height 52px", async () => {
    const banners = page.locator("#toast-banner [class*='max-w-\\[349px\\]']")
    for (const banner of await banners.all()) {
      const box = await banner.boundingBox()
      expect(box?.height, "banner min-height").toBeGreaterThanOrEqual(52)
    }
  })

  test("all banners are at most 349px wide", async () => {
    const banners = page.locator("#toast-banner [class*='max-w-\\[349px\\]']")
    for (const banner of await banners.all()) {
      const box = await banner.boundingBox()
      expect(box?.width, "banner max-width").toBeLessThanOrEqual(349)
    }
  })

  // ── Background colors per type ────────────────────────────────────────────

  test("each banner type has the correct background color", async () => {
    const banners = page.locator("#toast-banner [class*='max-w-\\[349px\\]']")
    const all = await banners.all()
    expect(all.length, "should have 5 banners").toBe(5)

    const expected = [BG_NEUTRAL, BG_BLUE, BG_SUCCESS, BG_WARNING, BG_ERROR]
    for (let i = 0; i < all.length; i++) {
      const bg = await all[i].evaluate(
        (el) => getComputedStyle(el).backgroundColor
      )
      expect(bg, `banner[${i}] background`).toBe(expected[i])
    }
  })

  // ── Icon container ────────────────────────────────────────────────────────

  test("icon container is 36×36px circle with black bg", async () => {
    const iconContainers = page.locator(
      "#toast-banner [class*='max-w-\\[349px\\]'] .rounded-full.bg-black"
    )
    for (const container of await iconContainers.all()) {
      const box = await container.boundingBox()
      expect(box?.width, "icon container width").toBe(36)
      expect(box?.height, "icon container height").toBe(36)
      const bg = await container.evaluate(
        (el) => getComputedStyle(el).backgroundColor
      )
      expect(bg, "icon container bg").toBe("rgb(0, 0, 0)")
    }
  })

  // ── Dismiss button ────────────────────────────────────────────────────────

  test("all banners with onDismiss have a dismiss button", async () => {
    const dismissBtns = page
      .locator("#toast-banner")
      .getByRole("button", { name: "Dismiss notification" })
    await expect(dismissBtns).toHaveCount(5)
  })
})
