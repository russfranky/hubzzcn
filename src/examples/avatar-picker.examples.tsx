import * as React from "react"

import {
  AvatarPicker,
  type AvatarPickerItem,
  type AvatarPickerProps,
} from "@/components/hubzz/avatar-picker"
import type { Example, Meta } from "./types"

function avatarImage(label: string, color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="${color}"/><circle cx="100" cy="78" r="38" fill="rgba(255,255,255,.24)"/><path d="M44 178c8-42 32-64 56-64s48 22 56 64" fill="rgba(255,255,255,.24)"/><text x="100" y="194" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="white">${label}</text></svg>`
  )}`
}

const walletAvatars: AvatarPickerItem[] = [
  {
    id: "nova",
    name: "Nova",
    imageSrc: avatarImage("Nova", "#735FFA"),
  },
  {
    id: "orbit",
    name: "Orbit",
    imageSrc: avatarImage("Orbit", "#236BFE"),
  },
  {
    id: "ember",
    name: "Ember",
    imageSrc: avatarImage("Ember", "#D65A4A"),
  },
]

const collectionColors = [
  "#735FFA",
  "#236BFE",
  "#D65A4A",
  "#4E9B73",
  "#AE6BC7",
  "#B78743",
]

const collectionAvatars: AvatarPickerItem[] = Array.from(
  { length: 12 },
  (_, index) => ({
    id: `avatar-${index + 1}`,
    name: `Avatar ${index + 1}`,
    imageSrc: avatarImage(
      `${index + 1}`,
      collectionColors[index % collectionColors.length]
    ),
  })
)

function AvatarPickerDemo(args: AvatarPickerProps) {
  const [value, setValue] = React.useState(args.value ?? args.items[0]?.id)

  return (
    <AvatarPicker
      {...args}
      value={value}
      onValueChange={(next, item) => {
        setValue(next)
        args.onValueChange?.(next, item)
      }}
    />
  )
}

export const meta: Meta<typeof AvatarPicker> = {
  title: "AvatarPicker",
  slug: "avatar-picker",
  navLabel: "Avatar Picker",
  component: AvatarPicker,
  description:
    "Hubzz avatar selection surface derived from the pre-alpha wallet avatar picker.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Pass avatar data and selection callbacks; wallet and session orchestration stay in product code.",
    "Auto density follows the pre-alpha collection thresholds: large through 3 items, medium through 10, then small.",
    "Selection is exposed with radiogroup semantics for keyboard and assistive-technology compatibility.",
  ],
}

export const WalletSelection: Example<AvatarPickerProps> = {
  name: "Wallet selection",
  args: {
    items: walletAvatars,
    value: "nova",
  },
  render: (args) => <AvatarPickerDemo {...args} />,
}

export const Collection: Example<AvatarPickerProps> = {
  name: "Large collection",
  args: {
    items: collectionAvatars,
    value: "avatar-3",
  },
  render: (args) => <AvatarPickerDemo {...args} />,
}

export const Loading: Example<AvatarPickerProps> = {
  name: "Loading",
  args: {
    items: [],
    loading: true,
    density: "medium",
  },
}

export const Empty: Example<AvatarPickerProps> = {
  name: "Empty",
  args: {
    items: [],
    emptyMessage: "No avatars found in connected wallets.",
  },
}

export const examples = [WalletSelection, Collection, Loading, Empty]
