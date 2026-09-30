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
    "Responsive Hubzz spectator-mode notice for the pre-alpha world spectator surface.",
  category: "hubzz",
  layer: "pattern",
  notes: [
    "Uses Hubzz theme tokens (bg-card, Button primary) — not hardcoded product hex colors.",
    "Catalog demos stay inline so the panel stays in document flow. Product code can pass placement=\"overlay\" for world positioning (bottom 10vh).",
    "Authentication and world-readiness timing stay in product code; the banner owns only the visual/action surface.",
  ],
}

export const Default: Example<SpectatorBannerProps> = {
  name: "Default",
  args: {
    onAction: () => {},
  },
}

export const examples = [Default]
