import {
  SpectatorBanner,
  type SpectatorBannerProps,
} from "@/components/hubzz/spectator-banner"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof SpectatorBanner> = {
  title: "SpectatorBanner",
  slug: "spectator-banner",
  navLabel: "Spectator Banner",
  component: SpectatorBanner,
  description:
    "Responsive Hubzz spectator-mode notice derived from the pre-alpha world overlay.",
  category: "hubzz",
  layer: "pattern",
  notes: [
    "The inline placement is catalog-friendly; use placement=overlay for the pre-alpha world positioning behavior.",
    "Authentication and world-readiness timing stay in product code; the banner owns only the visual/action surface.",
    "The action composes the Hubzz Button override and the default mark composes HubzzLogo.",
  ],
}

export const Default: Example<SpectatorBannerProps> = {
  name: "Default",
  args: {
    onAction: () => {},
  },
}

export const LongMessage: Example<SpectatorBannerProps> = {
  name: "Long message",
  args: {
    message:
      "You are exploring this space as a spectator. Log in or sign up to customize your avatar, interact with people, and save your progress.",
    actionLabel: "Join Hubzz",
    onAction: () => {},
  },
}

export const Informational: Example<SpectatorBannerProps> = {
  name: "Informational",
  args: {
    message: "Spectator mode is active for this session.",
  },
}

export const examples = [Default, LongMessage, Informational]
