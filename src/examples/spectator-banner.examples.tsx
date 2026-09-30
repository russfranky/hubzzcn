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
    "Responsive Hubzz spectator-mode notice matched to the pre-alpha world SpectatorPanel.",
  category: "hubzz",
  layer: "pattern",
  notes: [
    "Visual surface matches pre-alpha SpectatorPanel.module.css (charcoal pill, white mark, gradient CTA).",
    "The inline placement is catalog-friendly; use placement=overlay for world positioning (bottom 10vh).",
    "Authentication and world-readiness timing stay in product code; the banner owns only the visual/action surface.",
    "Default mark is HubzzLogo without a light tile wrapper; the action is the product gradient pill.",
  ],
}

export const Default: Example<SpectatorBannerProps> = {
  name: "Default",
  args: {
    onAction: () => {},
  },
}

export const Overlay: Example<SpectatorBannerProps> = {
  name: "Overlay",
  args: {
    placement: "overlay",
    onAction: () => {},
  },
}

export const examples = [Default, Overlay]
