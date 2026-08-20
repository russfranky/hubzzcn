import {
  ToastBanner,
  type ToastBannerProps,
} from "@/components/hubzz/toast-banner"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof ToastBanner> = {
  title: "ToastBanner",
  slug: "toast-banner",
  navLabel: "Toast Banner",
  component: ToastBanner,
  description:
    "Compact Hubzz status banner with neutral, info, success, warning, and error treatments.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Error uses alert semantics; other variants use status semantics.",
    "Provide onDismiss when the message can be dismissed.",
    "dismissLabel customizes the accessible name when the surrounding context requires more specificity.",
  ],
}

export const Neutral: Example<ToastBannerProps> = {
  name: "Neutral",
  args: {
    type: "neutral",
    children: "Your changes have been saved",
    onDismiss: () => {},
  },
}

export const Blue: Example<ToastBannerProps> = {
  name: "Info",
  args: {
    type: "blue",
    children: "New update available — refresh to apply",
    onDismiss: () => {},
  },
}

export const Success: Example<ToastBannerProps> = {
  name: "Success",
  args: {
    type: "success",
    children: "Successfully joined the event",
    onDismiss: () => {},
  },
}

export const Warning: Example<ToastBannerProps> = {
  name: "Warning",
  args: {
    type: "warning",
    children: "Event starts in 10 minutes",
    onDismiss: () => {},
  },
}

export const ErrorVariant: Example<ToastBannerProps> = {
  name: "Error",
  args: {
    type: "error",
    children: "Failed to connect to the space",
    onDismiss: () => {},
  },
}

export const examples = [Neutral, Blue, Success, Warning, ErrorVariant]
