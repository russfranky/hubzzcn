/**
 * Capsule component tests — DOM measurement + semantic theme roles.
 *
 * Run: pnpm test:ui
 */

import { expect, test, type Page } from "@playwright/test"
import { normalizeCssColor } from "../helpers/colors"

function capsules(page: Page) {
  return page.locator('#capsule [data-catalog-preview] [data-slot="toggle"]')
}

function capsulesByState(page: Page, pressed: boolean) {
  return page.locator(
    `#capsule [data-catalog-preview] [data-slot="toggle"][aria-pressed="${pressed}"]`
  )
}

async function tokenColor(page: Page, token: string) {
  return page.evaluate((name) => {
    const probe = document.createElement("span")
    probe.style.color = `var(${name})`
    document.body.append(probe)
    const color = getComputedStyle(probe).color
    probe.remove()
    return color
  }, token)
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

  test("all capsules are 30px tall", async () => {
    for (const capsule of await capsules(page).all()) {
      const box = await capsule.boundingBox()
      expect(box?.height, "capsule height").toBe(30)
    }
  })

  test("all capsules use the card background role", async () => {
    const expected = await tokenColor(page, "--card")
    for (const capsule of await capsules(page).all()) {
      const background = await normalizeCssColor(capsule, "backgroundColor")
      expect(background, "capsule background").toBe(expected)
    }
  })

  test("capsule hover uses the accent background role", async () => {
    const capsule = capsules(page).first()
    await capsule.hover()
    await page.waitForTimeout(300)
    const [background, expected] = await Promise.all([
      normalizeCssColor(capsule, "backgroundColor"),
      tokenColor(page, "--accent"),
    ])
    expect(background).toBe(expected)
  })

  test("active capsules use the foreground role", async () => {
    const activeCapsules = capsulesByState(page, true)
    await expect(activeCapsules).toHaveCount(2)
    const expected = await tokenColor(page, "--foreground")
    for (const capsule of await activeCapsules.all()) {
      const color = await normalizeCssColor(capsule, "color")
      expect(color, "active text color").toBe(expected)
    }
  })

  test("inactive capsules use the secondary foreground role", async () => {
    const inactiveCapsules = capsulesByState(page, false)
    await expect(inactiveCapsules).toHaveCount(3)
    const expected = await tokenColor(page, "--secondary-foreground")
    for (const capsule of await inactiveCapsules.all()) {
      const color = await normalizeCssColor(capsule, "color")
      expect(color, "inactive text color").toBe(expected)
    }
  })

  test("capsule text is 12px weight 500", async () => {
    const capsule = capsules(page).first()
    const styles = await capsule.evaluate((element) => {
      const style = getComputedStyle(element)
      return { fontSize: style.fontSize, fontWeight: style.fontWeight }
    })
    expect(styles.fontSize).toBe("12px")
    expect(styles.fontWeight).toBe("500")
  })

  test("capsules have pointer cursor", async () => {
    for (const capsule of await capsules(page).all()) {
      const cursor = await capsule.evaluate(
        (element) => getComputedStyle(element).cursor
      )
      expect(cursor, "capsule cursor").toBe("pointer")
    }
  })
})
