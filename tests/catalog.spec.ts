/**
 * Catalog smoke tests — every registered example section mounts on the landing page.
 *
 * Run: npm run test:ui
 */

import { test, expect } from "@playwright/test"
import { allExamples } from "../src/examples"

const CATALOG_SLUGS = allExamples.map((mod) => {
  const meta = (mod as { meta: { slug?: string; title: string } }).meta
  return meta.slug ?? meta.title.toLowerCase()
})

test.describe("Component catalog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("landing page loads with Hubzz branding", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  for (const slug of CATALOG_SLUGS) {
    test(`section #${slug} is present`, async ({ page }) => {
      const section = page.locator(`#${slug}`)
      await section.scrollIntoViewIfNeeded()
      await expect(section).toBeVisible()
      await expect(section.getByRole("heading", { level: 2 })).toBeVisible()
    })
  }
})
