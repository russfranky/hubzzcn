import { BadgeCategory, type BadgeCategoryProps } from "@/components/ui/badge-category"
import type { Meta, Example } from "./types"

export const meta: Meta<typeof BadgeCategory> = {
  title: "BadgeCategory",
  slug: "badge-category",  // preserves existing #badge-category anchor
  navLabel: "Badge",
  component: BadgeCategory,
  description:
    "Emoji filter tag with default, hover, and active states. Supports optional remove (X) button.",
  category: "hubzz",
  notes: [
    "Three programmatic states: default (bg=#181B1F), hover (bg=#24262B), active (bg=#392F7D)",
    "CSS :hover fires the default→hover transition automatically — use state='hover' only for programmatic control (keyboard nav, focus-visible)",
    "onRemove renders an X button — omit the prop entirely to hide it",
    "emoji prop renders before the label text",
  ],
}

export const Default: Example<BadgeCategoryProps> = {
  name: "Default",
  args: { children: "Networking", emoji: "🤝", onRemove: () => {} },
}

export const Active: Example<BadgeCategoryProps> = {
  name: "Active",
  args: { children: "Gaming", emoji: "🎮", state: "active", onRemove: () => {} },
}

export const DefaultSecond: Example<BadgeCategoryProps> = {
  name: "Default (Music)",
  args: { children: "Music", emoji: "🎵", onRemove: () => {} },
}

export const Hover: Example<BadgeCategoryProps> = {
  name: "Hover (programmatic)",
  args: { children: "Fitness", emoji: "🏋️", state: "hover", onRemove: () => {} },
}

export const NoRemove: Example<BadgeCategoryProps> = {
  name: "No remove button",
  args: { children: "Technology", emoji: "💻" },
}

export const examples = [Default, Active, DefaultSecond, Hover, NoRemove]
