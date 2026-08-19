import * as React from "react"
import { Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Meta, Example } from "./types"

type ButtonProps = React.ComponentProps<typeof Button>

export const meta: Meta<typeof Button> = {
  title: "Button",
  slug: "button",
  component: Button,
  description:
    "Upstream-first shadcn button with Hubzz sizing, color, focus, and pressed-state treatment.",
  category: "shadcn",
  notes: [
    "Keep the shadcn API: semantic variant, size, disabled, and asChild props.",
    "Use the native disabled attribute instead of a disabled visual variant.",
    "Default size is the medium Hubzz control; sm and lg map to the compact and large control sizes.",
    "Primary, secondary, and destructive states are themed here; avoid creating one-off button components.",
  ],
}

export const Primary: Example<ButtonProps> = {
  name: "Primary",
  args: { children: "Continue" },
}

export const PrimaryWithIcon: Example<ButtonProps> = {
  name: "Primary + icon",
  args: { children: "Share" },
  render: () => (
    <Button>
      <Share2 data-icon="inline-start" />
      Share
    </Button>
  ),
}

export const Secondary: Example<ButtonProps> = {
  name: "Secondary",
  args: { children: "Cancel", variant: "secondary" },
}

export const Outline: Example<ButtonProps> = {
  name: "Outline",
  args: { children: "Details", variant: "outline" },
}

export const Destructive: Example<ButtonProps> = {
  name: "Destructive",
  args: { children: "Delete", variant: "destructive" },
}

export const Disabled: Example<ButtonProps> = {
  name: "Disabled",
  args: { children: "Unavailable", disabled: true },
}

export const Small: Example<ButtonProps> = {
  name: "Small",
  args: { children: "Small", size: "sm" },
}

export const Large: Example<ButtonProps> = {
  name: "Large",
  args: { children: "Large", size: "lg" },
}

export const IconOnly: Example<ButtonProps> = {
  name: "Icon only",
  args: { "aria-label": "Share", size: "icon" },
  render: () => (
    <Button size="icon" aria-label="Share">
      <Share2 />
    </Button>
  ),
}

export const examples = [
  Primary,
  PrimaryWithIcon,
  Secondary,
  Outline,
  Destructive,
  Disabled,
  Small,
  Large,
  IconOnly,
]
