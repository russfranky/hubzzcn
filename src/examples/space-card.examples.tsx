import { SpaceCard, type SpaceCardProps } from "@/components/hubzz/space-card"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof SpaceCard> = {
  title: "SpaceCard",
  slug: "space-card",
  navLabel: "Space card",
  component: SpaceCard,
  description:
    "Presentational Hubzz space card — 7:2 preview tile with attendance, Join/Leave/Here, and optional browse/info — matched to pre-alpha LabSpaceCard + SpaceCardHelpers.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Sources: packages/client/src/profile-panel/components/spaces/SpaceCard.tsx and space-cards/components/spaces/SpaceCardHelpers.tsx.",
    "Portal keeps a thin adapter at src/components/portal/space-card.tsx; do not change portal files from this kit leaf.",
    "Product owns join/browse/info handlers, elapsed ticking, preview assets, and path gating (joinDisabled).",
    "Demo images are 7:2 card-framed crops from live production space thumbs (R2), saved under /space-thumbs/ so object-cover shows ticker/signage/room — not empty floor.",
  ],
}

/**
 * Local 7:2 framed samples derived from live R2 space-preview captures
 * (hubzz-assets-worker …/space-thumbs/{0_0,1_0,cats-gallery}.jpg). Pre-cropped
 * so the catalog card (aspect-[7/2] + object-cover) shows space content rather
 * than a center floor strip from the tall live captures.
 */
const SPACE_THUMB = {
  rooftop: "/space-thumbs/rooftop.jpg",
  retrodoges: "/space-thumbs/retrodoges.jpg",
  catsGallery: "/space-thumbs/cats-gallery.jpg",
} as const

/** Gradient fallbacks when the thumb fails to load. */
const ROOFTOP_GRADIENT =
  "linear-gradient(120deg, #5b6d82 0%, #2c3542 45%, #1a222c 100%)"
const HALLWAY_GRADIENT =
  "linear-gradient(135deg, #6a584d 0%, #3d342e 50%, #1f1a17 100%)"
const WORKSHOP_GRADIENT =
  "linear-gradient(140deg, #485a52 0%, #2a3631 55%, #141a18 100%)"
const LOUNGE_GRADIENT =
  "linear-gradient(125deg, #4c5663 0%, #2f3640 50%, #171b21 100%)"
const STAGE_GRADIENT =
  "linear-gradient(135deg, #2d1b4e 0%, #4a1942 50%, #6b2737 100%)"

/** Catalog demo attendee stack — local face circles under /avatars/. */
const DEMO_USERS = [
  { id: 1, name: "rileyp", avatar: "/avatars/a1.png", color: "#6366f1" },
  { id: 2, name: "jamielee", avatar: "/avatars/a2.png", color: "#ec4899" },
  { id: 3, name: "qtaylor", avatar: "/avatars/a3.png", color: "#f59e0b" },
]

const DEMO_USERS_OVERFLOW = [
  ...DEMO_USERS,
  { id: 4, name: "avery_k", avatar: "/avatars/a4.png", color: "#10b981" },
  { id: 5, name: "dakotac", avatar: "/avatars/a5.png", color: "#3b82f6" },
]

export const HereWithAvatars: Example<SpaceCardProps> = {
  name: "Here + avatars + elapsed",
  args: {
    title: "Rooftop",
    gradient: ROOFTOP_GRADIENT,
    image: SPACE_THUMB.rooftop,
    imageAlt: "Hubzz Rooftop live preview",
    attendance: "here",
    action: "here",
    users: DEMO_USERS,
    elapsedLabel: "00:42",
    elapsedVerbose: "42 minutes",
  },
}

export const Empty: Example<SpaceCardProps> = {
  name: "Nobody's here + Join",
  args: {
    title: "Lounge",
    gradient: LOUNGE_GRADIENT,
    image: SPACE_THUMB.retrodoges,
    imageAlt: "Retrodoges lounge live preview",
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
    image: SPACE_THUMB.catsGallery,
    imageAlt: "Cats' Gallery live preview",
    attendance: "construction",
    action: "none",
  },
}

export const OccupiedJoinable: Example<SpaceCardProps> = {
  name: "Occupied + overflow + Join",
  args: {
    title: "Stage",
    gradient: STAGE_GRADIENT,
    image: SPACE_THUMB.catsGallery,
    imageAlt: "Cats' Gallery live preview",
    attendance: "here",
    action: "join",
    users: DEMO_USERS_OVERFLOW,
    onJoin: () => {},
  },
}

export const Leave: Example<SpaceCardProps> = {
  name: "Leave (space-cards SpaceButton)",
  args: {
    title: "Hallway 3",
    gradient: HALLWAY_GRADIENT,
    image: SPACE_THUMB.retrodoges,
    imageAlt: "Retrodoges lounge live preview",
    attendance: "here",
    action: "leave",
    users: DEMO_USERS.slice(0, 2),
    showTicket: true,
    onLeave: () => {},
    onInfo: () => {},
  },
}

export const JoinDisabled: Example<SpaceCardProps> = {
  name: "Join disabled (DEF-017)",
  args: {
    title: "Closed wing",
    gradient: LOUNGE_GRADIENT,
    image: SPACE_THUMB.rooftop,
    imageAlt: "Hubzz Rooftop live preview",
    attendance: "empty",
    action: "join",
    joinDisabled: true,
    onJoin: () => {},
  },
}

export const BrowseJoinable: Example<SpaceCardProps> = {
  name: "Browse + join (portal adapter)",
  args: {
    title: "Hallway 3",
    gradient: HALLWAY_GRADIENT,
    image: SPACE_THUMB.retrodoges,
    imageAlt: "Retrodoges lounge live preview",
    attendance: "empty",
    action: "join",
    browseLabel: "+4 Spaces",
    browseAriaLabel: "View Hallway 3 and 4 attached spaces",
    onBrowse: () => {},
    onJoin: () => {},
  },
}

export const examples = [
  HereWithAvatars,
  Empty,
  UnderConstruction,
  OccupiedJoinable,
  Leave,
  JoinDisabled,
  BrowseJoinable,
]
