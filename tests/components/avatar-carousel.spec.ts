import { expect, test, type Page } from "@playwright/test"

test.describe("AvatarCarousel", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto("/")
    await page.locator("#avatar-carousel").scrollIntoViewIfNeeded()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test("exposes one selected slide and decorative side avatars", async () => {
    const carousel = page
      .locator(
        "#avatar-carousel [data-catalog-preview] [data-slot='avatar-carousel']"
      )
      .first()

    await expect(carousel).toHaveAttribute("role", "region")
    await expect(carousel).toHaveAttribute("aria-label", "Choose an avatar")
    await expect(carousel).toHaveAttribute("data-value", "nova")
    await expect(carousel).toHaveAttribute("data-index", "0")

    const selected = carousel.locator('[data-slot="avatar-carousel-selected"]')
    await expect(selected).toHaveAttribute("aria-label", "1 of 5")
    await expect(
      selected.getByRole("img", { name: "Selected avatar 1 of 5: Nova" })
    ).toBeVisible()

    const sides = carousel.locator('[data-slot="avatar-carousel-side"]')
    await expect(sides).toHaveCount(2)
    await expect(sides.first()).toHaveAttribute("aria-hidden", "true")
  })

  test("cycles forward and backward through controlled selection", async () => {
    const carousel = page
      .locator(
        "#avatar-carousel [data-catalog-preview] [data-slot='avatar-carousel']"
      )
      .first()
    const previous = carousel.getByRole("button", { name: "Previous avatar" })
    const next = carousel.getByRole("button", { name: "Next avatar" })

    await next.click()
    await expect(carousel).toHaveAttribute("data-value", "orbit")
    await expect(carousel).toHaveAttribute("data-index", "1")
    await expect(next).toHaveAttribute("data-active", "true")

    await previous.click()
    await expect(carousel).toHaveAttribute("data-value", "nova")
    await expect(previous).toHaveAttribute("data-active", "true")

    await previous.click()
    await expect(carousel).toHaveAttribute("data-value", "violet")
    await expect(carousel).toHaveAttribute("data-index", "4")

    await next.click()
    await expect(carousel).toHaveAttribute("data-value", "nova")
    await expect(carousel).toHaveAttribute("data-index", "0")
  })

  test("preserves the three-up pre-alpha geometry", async () => {
    const carousel = page
      .locator(
        "#avatar-carousel [data-catalog-preview] [data-slot='avatar-carousel']"
      )
      .first()
    const selected = carousel.locator('[data-slot="avatar-carousel-selected"]')
    const side = carousel.locator('[data-slot="avatar-carousel-side"]').first()

    const [carouselBox, selectedStyle, sideStyle] = await Promise.all([
      carousel.boundingBox(),
      selected.evaluate((element) => {
        const style = getComputedStyle(element)
        return { opacity: style.opacity, transform: style.transform }
      }),
      side.evaluate((element) => {
        const style = getComputedStyle(element)
        return { opacity: style.opacity, transform: style.transform }
      }),
    ])

    expect(carouselBox?.width).toBeLessThanOrEqual(520)
    expect(selectedStyle.opacity).toBe("1")
    expect(selectedStyle.transform).toBe("none")
    expect(sideStyle.opacity).toBe("0.4")
    expect(sideStyle.transform).not.toBe("none")
  })

  test("disables navigation when only one avatar exists", async () => {
    const carousel = page
      .locator(
        "#avatar-carousel [data-catalog-preview] [data-slot='avatar-carousel']"
      )
      .nth(1)

    await expect(carousel).toHaveAttribute("data-value", "nova")
    await expect(
      carousel.getByRole("button", { name: "Previous avatar" })
    ).toBeDisabled()
    await expect(
      carousel.getByRole("button", { name: "Next avatar" })
    ).toBeDisabled()
  })
})
