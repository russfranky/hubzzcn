import { expect, test } from "@playwright/test"

import { allExamples } from "../src/examples"

const CATALOG_SECTIONS = allExamples.map((module) => {
  const meta = (module as { meta: { slug?: string; title: string } }).meta
  return {
    slug: meta.slug ?? meta.title.toLowerCase(),
    title: meta.title,
  }
})

test.describe("Component catalog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("landing page exposes the design-system hierarchy", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.locator("#foundations")).toBeVisible()
    await expect(page.locator("#upstream")).toBeVisible()
    await expect(page.locator("#overrides")).toBeVisible()
    await expect(page.locator("#components")).toBeVisible()
    await expect(page.locator("#patterns")).toBeVisible()
  })

  for (const { slug, title } of CATALOG_SECTIONS) {
    test(`section #${slug} is present`, async ({ page }) => {
      const section = page.locator(`#${slug}`)
      await section.scrollIntoViewIfNeeded()
      await expect(section).toBeVisible()
      await expect(
        section.getByRole("heading", { level: 3, name: title, exact: true })
      ).toBeVisible()
    })
  }
})
