import {
  ProfileHeader,
  type ProfileHeaderProps,
} from "@/components/hubzz/profile-header"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof ProfileHeader> = {
  title: "ProfileHeader",
  slug: "profile-header",
  navLabel: "Profile Header",
  component: ProfileHeader,
  description:
    "Profile appearance pattern composed from upstream Avatar and the Hubzz Button override.",
  category: "hubzz",
  layer: "pattern",
  notes: [
    "Consumers own avatar data and selection state.",
    "No network-backed demo avatars are embedded in the component.",
    "Icon-only controls expose accessible labels and avatar choices expose pressed state.",
  ],
}

const AVATARS = [
  { id: "a", selected: true, fallback: "A", alt: "Avatar A" },
  { id: "b", fallback: "B", alt: "Avatar B" },
  { id: "c", fallback: "C", alt: "Avatar C" },
  { id: "d", fallback: "D", alt: "Avatar D" },
]

export const Default: Example<ProfileHeaderProps> = {
  name: "Default",
  args: {
    heroImage: "/favicon.svg",
    heroImageAlt: "Hubzz profile preview",
    avatars: AVATARS,
    onClose: () => {},
    onBack: () => {},
    onSave: () => {},
    onAddAvatar: () => {},
    onAvatarSelect: () => {},
  },
}

export const NoHeroImage: Example<ProfileHeaderProps> = {
  name: "No preview",
  args: {
    avatars: AVATARS.slice(0, 2),
    onClose: () => {},
    onBack: () => {},
    onSave: () => {},
    onAddAvatar: () => {},
  },
}

export const examples = [Default, NoHeroImage]
