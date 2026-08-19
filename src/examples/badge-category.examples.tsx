import {
  BadgeCategory,
  type BadgeCategoryProps,
} from "@/components/hubzz/badge-category"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof BadgeCategory> = {
  title: "BadgeCategory",
  slug: "badge-category",
  navLabel: "Badge Category",
  component: BadgeCategory,
  description:
    "Hubzz category tag composed from the Button override for optional removal.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Use for category and filter labels, not general action buttons.",
    "onRemove adds an accessible remove action; omit it for a static tag.",
    "The explicit state prop exists for controlled preview/state surfaces; ordinary hover remains CSS-driven.",
  ],
}

export const Default: Example<BadgeCategoryProps> = {
  name: "Default",
  args: { children: "Networking", emoji: "🤝", onRemove: () => {} },
}

export const Active: Example<BadgeCategoryProps> = {
  name: "Active",
  args: {
    children: "Gaming",
    emoji: "🎮",
    state: "active",
    onRemove: () => {},
  },
}

export const DefaultSecond: Example<BadgeCategoryProps> = {
  name: "Default (Music)",
  args: { children: "Music", emoji: "🎵", onRemove: () => {} },
}

export const Hover: Example<BadgeCategoryProps> = {
  name: "Hover (controlled)",
  args: {
    children: "Fitness",
    emoji: "🏋️",
    state: "hover",
    onRemove: () => {},
  },
}

export const NoRemove: Example<BadgeCategoryProps> = {
  name: "Static",
  args: { children: "Technology", emoji: "💻" },
}

export const examples = [Default, Active, DefaultSecond, Hover, NoRemove]
