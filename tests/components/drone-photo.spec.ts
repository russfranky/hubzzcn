import { expect, test } from "@playwright/test"

test.describe("DronePhoto", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.locator("#drone-photo").scrollIntoViewIfNeeded()
  })

  test("renders meaningful media and metadata", async ({ page }) => {
    const section = page.locator("#drone-photo")
    const figure = section.locator("figure").first()

    await expect(figure).toBeVisible()
    await expect(
      figure.getByRole("img", { name: "Hubzz drone capture placeholder" })
    ).toBeVisible()
    await expect(figure.getByText("06/13/24 11:12 UTC")).toBeVisible()
    await expect(figure.getByText("hubzz.xyz/0,0/8,13/-1")).toBeVisible()
  })

  test("metadata is exposed as a figure caption", async ({ page }) => {
    const figure = page.locator("#drone-photo figure").first()
    await expect(figure.locator("figcaption")).toContainText("06/13/24 11:12 UTC")
  })
})
