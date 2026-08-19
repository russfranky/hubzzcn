/**
 * EventTicket component tests — DOM measurement, not screenshots.
 *
 * Run: npm run test:ui
 * Fast iteration: keep dev server running, changes hot-reload.
 */

import { test, expect, type Page, type Locator } from "@playwright/test"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get all computed style values we care about for an element. */
async function computedStyles(
  locator: Locator,
  props: string[]
): Promise<Record<string, string>> {
  return locator.evaluate(
    (el, keys) =>
      Object.fromEntries(keys.map((k) => [k, getComputedStyle(el)[k as never]])),
    props
  )
}

/** Gap between the right edge of `a` and the left edge of `b`, in px. */
async function gapBetween(a: Locator, b: Locator): Promise<number> {
  const [aBox, bBox] = await Promise.all([a.boundingBox(), b.boundingBox()])
  if (!aBox || !bBox) throw new Error("Could not get bounding box")
  return bBox.x - (aBox.x + aBox.width)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("EventTicket", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto("/")
    await page.locator("#tickets").scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
  })

  test.afterAll(async () => {
    await page.close()
  })

  // ── Card dimensions ──────────────────────────────────────────────────────

  test("all cards are 344×184px", async () => {
    const cards = page.locator("[data-ticket-state]")
    for (const card of await cards.all()) {
      const state = await card.getAttribute("data-ticket-state")
      const box = await card.boundingBox()
      expect(box?.width, `width: state=${state}`).toBe(344)
      expect(box?.height, `height: state=${state}`).toBe(184)
    }
  })

  // ── Date / time row ──────────────────────────────────────────────────────

  test("date/time gap is ~16px (gap-4) in stub states", async () => {
    for (const state of ["ready", "upcoming", "joined"]) {
      const card = page.locator(`[data-testid="ticket-${state}"]`)
      const spans = card.locator("div.flex.gap-4 span")
      const [dateSpan, timeSpan] = await spans.all()
      const gap = await gapBetween(dateSpan, timeSpan)
      expect(gap, `date/time gap: state=${state}`).toBeGreaterThanOrEqual(14)
      expect(gap, `date/time gap: state=${state}`).toBeLessThanOrEqual(18)
    }
  })

  test("past state date row uses justify-between", async () => {
    const card = page.locator('[data-testid="ticket-past"]')
    const dateRow = card.locator("div.flex.justify-between").first()
    await expect(dateRow).toBeVisible()
    const spans = dateRow.locator("span")
    await expect(spans).toHaveCount(2)
  })

  // ── Title ────────────────────────────────────────────────────────────────

  test("title is clamped to ≤217px wide", async () => {
    const states = ["ready", "upcoming", "joined", "past"]
    for (const state of states) {
      const card = page.locator(`[data-testid="ticket-${state}"]`)
      const title = card.locator("p.text-\\[20px\\]")
      const box = await title.boundingBox()
      expect(box?.width, `title width: state=${state}`).toBeLessThanOrEqual(217)
    }
  })

  test("title has line-clamp-2 (max 2 lines)", async () => {
    // Edge-case ticket has a very long title — should be clamped to 2 lines (56px)
    const card = page.locator('[data-testid="ticket-longTitle"]')
    const title = card.locator("p.text-\\[20px\\]")
    const box = await title.boundingBox()
    // 2 lines × 28px line-height = 56px; allow ±2px for rounding
    expect(box?.height, "long title clamped to 2 lines").toBeLessThanOrEqual(58)
  })

  // ── Text selection ───────────────────────────────────────────────────────

  test("ticket text is non-selectable", async () => {
    const cards = page.locator("[data-ticket-state]")
    for (const card of await cards.all()) {
      const state = await card.getAttribute("data-ticket-state")
      const userSelect = await card.evaluate(
        (el) => getComputedStyle(el).userSelect
      )
      expect(userSelect, `user-select: state=${state}`).toBe("none")
    }
  })

  // ── Buttons ──────────────────────────────────────────────────────────────

  test("action buttons have pointer cursor", async () => {
    const buttons = page.locator("[data-ticket-state] button")
    for (const button of await buttons.all()) {
      const cursor = await button.evaluate(
        (el) => getComputedStyle(el).cursor
      )
      expect(cursor, "button cursor").toBe("pointer")
    }
  })

  // ── Stub / barcode ───────────────────────────────────────────────────────

  test("barcode SVG is 37×139px in stub states", async () => {
    const stubStates = ["ready", "upcoming", "joined"]
    for (const state of stubStates) {
      const card = page.locator(`[data-testid="ticket-${state}"]`)
      const barcode = card.locator('svg[width="37"][height="139"]')
      const box = await barcode.boundingBox()
      expect(box?.width, `barcode width: state=${state}`).toBe(37)
      expect(box?.height, `barcode height: state=${state}`).toBe(139)
    }
  })

  test("past state has no barcode (no stub)", async () => {
    const card = page.locator('[data-testid="ticket-past"]')
    const barcode = card.locator('svg[width="37"][height="139"]')
    await expect(barcode).toHaveCount(0)
  })

  // ── Loading skeleton ─────────────────────────────────────────────────────

  test("loading skeleton barcode is 37×139px", async () => {
    const card = page.locator('[data-testid="ticket-loading"]')
    const skeleton = card.locator(".animate-pulse").filter({ hasNot: page.locator("button") })
    // Find the tall thin one (the barcode skeleton)
    const allSkeletons = await skeleton.all()
    const barcodeSkeleton = await (async () => {
      for (const s of allSkeletons) {
        const box = await s.boundingBox()
        if (box && box.width < 60 && box.height > 80) return s
      }
      return null
    })()
    expect(barcodeSkeleton, "barcode skeleton found").not.toBeNull()
    const box = await barcodeSkeleton!.boundingBox()
    expect(box?.width, "skeleton barcode width").toBe(37)
    expect(box?.height, "skeleton barcode height").toBe(139)
  })

  // ── Host / space links ───────────────────────────────────────────────────

  test("host and space render as links when hrefs provided", async () => {
    const card = page.locator('[data-testid="ticket-ready"]')
    const links = card.locator("a[href]")
    await expect(links).toHaveCount(2)
  })

  // ── Overflow guards ──────────────────────────────────────────────────────

  test("ticket number span has min-w-0 and text-overflow ellipsis", async () => {
    const card = page.locator('[data-testid="ticket-ready"]')
    // Find the ticket number span (small text in action row)
    const ticketNumSpan = card.locator("span.truncate").first()
    const styles = await computedStyles(ticketNumSpan, [
      "overflow",
      "textOverflow",
      "minWidth",
    ])
    expect(styles.overflow).toBe("hidden")
    expect(styles.textOverflow).toBe("ellipsis")
    expect(styles.minWidth).toBe("0px")
  })
})
