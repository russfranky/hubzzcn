import * as React from "react"

import {
  AvatarCarousel,
  type AvatarCarouselItem,
  type AvatarCarouselProps,
} from "@/components/hubzz/avatar-carousel"
import type { Example, Meta } from "./types"

function avatarImage(label: string, color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" rx="24" fill="${color}"/><circle cx="100" cy="78" r="38" fill="rgba(255,255,255,.24)"/><path d="M44 178c8-42 32-64 56-64s48 22 56 64" fill="rgba(255,255,255,.24)"/><text x="100" y="194" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="white">${label}</text></svg>`
  )}`
}

const avatars: AvatarCarouselItem[] = [
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
  {
    id: "moss",
    name: "Moss",
    imageSrc: avatarImage("Moss", "#4E9B73"),
  },
  {
    id: "violet",
    name: "Violet",
    imageSrc: avatarImage("Violet", "#AE6BC7"),
  },
]

function AvatarCarouselDemo(args: AvatarCarouselProps) {
  const [value, setValue] = React.useState(args.value ?? args.items[0]?.id)

  return (
    <AvatarCarousel
      {...args}
      value={value}
      onValueChange={(next, item) => {
        setValue(next)
        args.onValueChange?.(next, item)
      }}
    />
  )
}

export const meta: Meta<typeof AvatarCarousel> = {
  title: "AvatarCarousel",
  slug: "avatar-carousel",
  navLabel: "Avatar Carousel",
  component: AvatarCarousel,
  description:
    "Controlled three-up Hubzz avatar carousel derived from the pre-alpha onboarding chooser.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Product code owns avatar loading, prefetching, validation, and onboarding state.",
    "The component owns only cyclic previous/current/next navigation and the three-up Hubzz geometry.",
    "The selected avatar is announced as a carousel slide; side avatars are decorative context.",
  ],
}

export const Default: Example<AvatarCarouselProps> = {
  name: "Default",
  args: {
    items: avatars,
    value: "nova",
  },
  render: (args) => <AvatarCarouselDemo {...args} />,
}

export const SingleAvatar: Example<AvatarCarouselProps> = {
  name: "Single avatar",
  args: {
    items: [avatars[0]],
    value: "nova",
  },
}

export const examples = [Default, SingleAvatar]
