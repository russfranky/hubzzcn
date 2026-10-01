import { SpaceCard, type SpaceCardProps } from "@/components/hubzz/space-card"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof SpaceCard> = {
  title: "SpaceCard",
  slug: "space-card",
  navLabel: "Space card",
  component: SpaceCard,
  description:
    "Presentational Hubzz space card with attendance states, optional browse affordance, and Join action — matched to the Portal space list.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Portal keeps a thin adapter at src/components/portal/space-card.tsx that maps PortalSpace into these props.",
    "Default demo avatars use the stacked color-dot treatment from the portal card.",
    "Consumers own join/browse handlers and gradient assets.",
  ],
}

const ROOFTOP_GRADIENT =
  "linear-gradient(120deg, #5b6d82 0%, #2c3542 45%, #1a222c 100%)"
const HALLWAY_GRADIENT =
  "linear-gradient(135deg, #6a584d 0%, #3d342e 50%, #1f1a17 100%)"
const WORKSHOP_GRADIENT =
  "linear-gradient(140deg, #485a52 0%, #2a3631 55%, #141a18 100%)"
const LOUNGE_GRADIENT =
  "linear-gradient(125deg, #4c5663 0%, #2f3640 50%, #171b21 100%)"

export const Here: Example<SpaceCardProps> = {
  name: "Current / here",
  args: {
    title: "Rooftop",
    gradient: ROOFTOP_GRADIENT,
    attendance: "here",
    action: "here",
  },
}

export const Empty: Example<SpaceCardProps> = {
  name: "Empty",
  args: {
    title: "Lounge",
    gradient: LOUNGE_GRADIENT,
    attendance: "empty",
    action: "join",
    onJoin: () => {},
  },
}

export const UnderConstruction: Example<SpaceCardProps> = {
  name: "Under construction",
  args: {
    title: "Workshop",
    gradient: WORKSHOP_GRADIENT,
    attendance: "construction",
    action: "none",
  },
}

export const BrowseJoinable: Example<SpaceCardProps> = {
  name: "Browse + join",
  args: {
    title: "Hallway 3",
    gradient: HALLWAY_GRADIENT,
    attendance: "empty",
    action: "join",
    browseLabel: "+4 Spaces",
    browseAriaLabel: "View Hallway 3 and 4 attached spaces",
    onBrowse: () => {},
    onJoin: () => {},
  },
}

export const examples = [Here, Empty, UnderConstruction, BrowseJoinable]
