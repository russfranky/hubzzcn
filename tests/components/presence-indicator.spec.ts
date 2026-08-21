import { expect, test, type Page } from "@playwright/test"
import { hexToRgb, normalizeCssColor } from "../helpers/colors"

const statusExpectations = [
  { status: "online", label: "Online", color: "#12B76A" },
  { status: "idle", label: "Away", color: "#F59E0B" },
  { status: "offline", label: "Offline", color: "#7C878E" },
] as const

test.describe("PresenceIndicator", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto("/")
    await page.locator("#presence-indicator").scrollIntoViewIfNeeded()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test("centralizes Hubzz presence labels and colors", async () => {
    const section = page.locator("#presence-indicator")

    for (const expectation of statusExpectations) {
      const indicator = section
        .locator(
          `[data-slot="presence-indicator"][data-status="${expectation.status}"]`
        )
        .first()

      await expect(indicator).toHaveAttribute("role", "img")
      await expect(indicator).toHaveAttribute("aria-label", expectation.label)
      expect(await normalizeCssColor(indicator, "backgroundColor")).toBe(
        hexToRgb(expectation.color)
      )
    }
  })

  test("keeps local geometry under host control", async () => {
    const indicator = page
      .locator(
        '#presence-indicator [data-slot="presence-indicator"][data-status="idle"]'
      )
      .last()
    const box = await indicator.boundingBox()

    expect(box?.width).toBe(12)
    expect(box?.height).toBe(12)
    await expect(indicator).toHaveAttribute("aria-label", "Away from keyboard")

    const position = await indicator.evaluate(
      (element) => getComputedStyle(element).position
    )
    expect(position).toBe("static")
  })

  test("defaults to the compact chat-sized dot", async () => {
    const indicator = page
      .locator(
        '#presence-indicator [data-slot="presence-indicator"][data-status="online"]'
      )
      .first()
    const box = await indicator.boundingBox()

    expect(box?.width).toBe(8)
    expect(box?.height).toBe(8)
  })
})
