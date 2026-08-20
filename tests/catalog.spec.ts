import { expect, test } from "@playwright/test"

import { THEME_STORAGE_KEY } from "../src/catalog/theme-provider"
import { allExamples } from "../src/examples"

const TEST_CLIPBOARD_KEY = "hubzz-ui-test-clipboard"

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

  test("exposes the design-system hierarchy", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Hubzz UI" })
    ).toBeVisible()
    await expect(page.locator("#foundations")).toBeVisible()
    await expect(page.locator("#upstream")).toBeVisible()
    await expect(page.locator("#overrides")).toBeVisible()
    await expect(page.locator("#components")).toBeVisible()
    await expect(page.locator("#patterns")).toBeVisible()
  })

  test("command search is keyboard accessible", async ({ page }) => {
    await page.keyboard.press("Control+K")
    const search = page.getByRole("textbox", { name: "Search Hubzz UI" })
    await expect(search).toBeVisible()

    await search.fill("EventTicket")
    await expect(page.getByRole("link", { name: /EventTicket/ })).toBeVisible()
  })

  test("install commands expose a working copy action", async ({ page }) => {
    await page.evaluate((storageKey) => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            sessionStorage.setItem(storageKey, value)
          },
        },
      })
    }, TEST_CLIPBOARD_KEY)

    const command = await page.locator("#overview code").innerText()
    const copy = page.getByRole("button", { name: "Copy base install command" })
    await copy.click()

    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible()
    await expect
      .poll(() =>
        page.evaluate(
          (storageKey) => sessionStorage.getItem(storageKey),
          TEST_CLIPBOARD_KEY
        )
      )
      .toBe(command)
  })

  test("theme choice persists across reloads", async ({ page }) => {
    const root = page.locator("html")
    await expect(root).toHaveClass(/\bdark\b/)

    await page.getByRole("button", { name: "Toggle color theme" }).click()
    await expect(root).toHaveClass(/\blight\b/)
    await expect
      .poll(() =>
        page.evaluate((key) => localStorage.getItem(key), THEME_STORAGE_KEY)
      )
      .toBe("light")

    await page.reload()
    await expect(root).toHaveClass(/\blight\b/)
  })

  test("source links point at the built revision", async ({ page }) => {
    const sourceRef = process.env.GITHUB_SHA ?? "main"
    const source = page
      .locator("#button")
      .getByRole("link", { name: "Source", exact: true })

    await expect(source).toHaveAttribute(
      "href",
      `https://github.com/russfranky/hubzzcn/blob/${sourceRef}/src/components/ui/button.tsx`
    )
  })

  for (const { slug, title } of CATALOG_SECTIONS) {
    test(`section #${slug} is present`, async ({ page }) => {
      const section = page.locator(`#${slug}`)
      await section.scrollIntoViewIfNeeded()
      await expect(section).toBeVisible()
      await expect(
        section.getByRole("heading", { level: 3, name: title, exact: true })
      ).toBeVisible()
      await expect(section.locator("[data-catalog-preview]").first()).toBeVisible()
    })
  }
})
