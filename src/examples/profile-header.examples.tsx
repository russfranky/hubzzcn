import { ProfileHeader, type ProfileHeaderProps } from "@/components/profile-header"
import type { Meta, Example } from "./types"

export const meta: Meta<typeof ProfileHeader> = {
  title: "ProfileHeader",
  slug: "profile-header",
  navLabel: "Profile Header",
  component: ProfileHeader,
  description:
    "Profile customizer card with hero image, avatar picker, and save action.",
  category: "hubzz",
  notes: [
    "Used in the profile settings or customizer flow.",
    "Expects an array of objects for avatars."
  ],
}

export const Default: Example<ProfileHeaderProps> = {
  name: "Default Profile Header",
  args: {
    heroImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80",
    avatars: [
      { id: "1", selected: true },
      { id: "2" },
      { id: "3" },
      { id: "4" },
    ],
    onClose: () => console.log("close"),
    onBack: () => console.log("back"),
    onSave: () => console.log("save"),
    onAddAvatar: () => console.log("add avatar"),
  } as ProfileHeaderProps,
}

export const NoHeroImage: Example<ProfileHeaderProps> = {
  name: "No Hero Image",
  args: {
    avatars: [
      { id: "1", selected: true },
      { id: "2" },
    ],
    onClose: () => console.log("close"),
    onBack: () => console.log("back"),
    onSave: () => console.log("save"),
    onAddAvatar: () => console.log("add avatar"),
  } as ProfileHeaderProps,
}

export const examples = [Default, NoHeroImage]
