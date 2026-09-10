import { expect, type Page } from "@playwright/test"

/** Scan the readable toast, not a transparent entrance or exit frame. */
export async function holdToastForAccessibility(page: Page, title: string) {
  const notification = page.locator("[data-sonner-toast]").filter({
    has: page.getByText(title, { exact: true }),
  })
  await expect(notification).toHaveCount(1)
  await expect(notification).toBeInViewport({ ratio: 1 })

  // Use Sonner's normal hover pause so the message cannot expire during axe.
  // This changes neither application styles nor the configured duration.
  await notification.hover()
  await expect(notification).toHaveAttribute("data-mounted", "true")
  await expect(notification).toHaveAttribute("data-removed", "false")
  await expect(notification).toHaveCSS("opacity", "1")
  await expect
    .poll(() =>
      notification.evaluate(
        (element) =>
          element
            .getAnimations({ subtree: true })
            .filter(
              (animation) =>
                animation.pending || animation.playState === "running"
            ).length
      )
    )
    .toBe(0)
  return notification
}
