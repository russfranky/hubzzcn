import { expect, test, type Page } from "@playwright/test"

test.describe("AvatarPicker", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto("/")
    await page.locator("#avatar-picker").scrollIntoViewIfNeeded()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test("wallet selection uses accessible radio semantics", async () => {
    const picker = page
      .locator("#avatar-picker [data-catalog-preview] [data-slot='avatar-picker']")
      .first()
    const group = picker.getByRole("radiogroup", { name: "Choose an avatar" })
    const options = group.getByRole("radio")

    await expect(options).toHaveCount(3)
    await expect(options.first()).toHaveAttribute("aria-checked", "true")

    await options.nth(1).click()
    await expect(options.nth(1)).toHaveAttribute("aria-checked", "true")
    await expect(options.first()).toHaveAttribute("aria-checked", "false")
  })

  test("auto density preserves the pre-alpha collection thresholds", async () => {
    const section = page.locator("#avatar-picker")
    const largePicker = section.locator('[data-slot="avatar-picker"][data-density="large"]').first()
    const smallPicker = section.locator('[data-slot="avatar-picker"][data-density="small"]').first()

    const largeOption = largePicker.locator('[data-slot="avatar-picker-option"]').first()
    const smallOptions = smallPicker.locator('[data-slot="avatar-picker-option"]')
    const [largeBox, smallBox] = await Promise.all([
      largeOption.boundingBox(),
      smallOptions.first().boundingBox(),
    ])

    expect(largeBox?.width).toBe(192)
    expect(largeBox?.height).toBe(192)
    await expect(smallOptions).toHaveCount(12)
    expect(smallBox?.width).toBe(64)
    expect(smallBox?.height).toBe(64)
  })

  test("loading and empty states stay inside the picker contract", async () => {
    const section = page.locator("#avatar-picker")

    await expect(section.getByRole("status")).toHaveCount(1)
    await expect(
      section.getByText("No avatars found in connected wallets.")
    ).toBeVisible()
  })
})
