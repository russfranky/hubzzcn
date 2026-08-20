import { expect, test } from "@playwright/test"

test.describe("ProfileHeader", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
    await page.locator("#profile-header").scrollIntoViewIfNeeded()
  })

  test("exposes accessible profile appearance controls", async ({ page }) => {
    const section = page.locator("#profile-header")
    const panel = section
      .getByRole("region", { name: "Profile appearance" })
      .first()

    await expect(panel).toBeVisible()
    await expect(
      panel.getByRole("button", { name: "Close profile appearance" })
    ).toBeVisible()
    await expect(
      panel.getByRole("button", { name: "Add avatar" })
    ).toBeVisible()
    await expect(panel.getByRole("button", { name: "Go back" })).toBeVisible()
    await expect(
      panel.getByRole("button", { name: "Save changes" })
    ).toBeVisible()
  })

  test("avatar selection exposes pressed state", async ({ page }) => {
    const panel = page
      .locator("#profile-header")
      .getByRole("region", { name: "Profile appearance" })
      .first()

    await expect(
      panel.getByRole("button", { name: "Avatar A" })
    ).toHaveAttribute("aria-pressed", "true")
    await expect(
      panel.getByRole("button", { name: "Avatar B" })
    ).toHaveAttribute("aria-pressed", "false")
  })

  test("fallback state remains explicit when no preview is supplied", async ({
    page,
  }) => {
    const preview = page
      .locator("#profile-header")
      .locator('[data-catalog-preview="No preview"]')

    await expect(preview.getByText("No preview", { exact: true })).toBeVisible()
  })
})
