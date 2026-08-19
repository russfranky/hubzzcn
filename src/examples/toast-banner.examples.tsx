import { ToastBanner, type ToastBannerProps } from "@/components/ui/toast-banner"
import type { Meta, Example } from "./types"

export const meta: Meta<typeof ToastBanner> = {
  title: "ToastBanner",
  slug: "toast-banner",  // preserves existing #toast-banner anchor
  navLabel: "Toast",
  component: ToastBanner,
  description:
    "Notification banner with 5 type variants: neutral, blue, success, warning, error. " +
    "Max width 349px. Optional dismiss button.",
  category: "hubzz",
  notes: [
    "Always provide onDismiss unless the banner is intentionally permanent",
    "max-w-[349px] is fixed — do not override with a wider container",
    "type='neutral' uses the card background (#24262B) — use for non-urgent confirmations",
    "Icon is always rendered in a 36×36 black circle regardless of type",
  ],
}

export const Neutral: Example<ToastBannerProps> = {
  name: "Neutral",
  args: { type: "neutral", children: "Your changes have been saved", onDismiss: () => {} },
}

export const Blue: Example<ToastBannerProps> = {
  name: "Blue — Info",
  args: { type: "blue", children: "New update available — refresh to apply", onDismiss: () => {} },
}

export const Success: Example<ToastBannerProps> = {
  name: "Success",
  args: { type: "success", children: "Successfully joined the event", onDismiss: () => {} },
}

export const Warning: Example<ToastBannerProps> = {
  name: "Warning",
  args: { type: "warning", children: "Event starts in 10 minutes", onDismiss: () => {} },
}

export const ErrorVariant: Example<ToastBannerProps> = {
  name: "Error",
  args: { type: "error", children: "Failed to connect to the space", onDismiss: () => {} },
}

export const examples = [Neutral, Blue, Success, Warning, ErrorVariant]
