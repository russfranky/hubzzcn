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
    "Demo `image` URLs are live space-preview thumbs from production /api/spaces (R2 via hubzz-assets-worker).",
  ],
}

/**
 * Live space-preview JPEGs from production `GET /api/spaces`
 * (`previewImageUrl` / `worlds["0,0"].previewImageUrl`). Cache-buster `?v=`
 * omitted so catalog demos stay stable; paths match SpacePreview.previewKeyFor.
 */
const SPACE_THUMB = {
  rooftop:
    "https://hubzz-assets-worker.hubzzhq.workers.dev/files/space-thumbs/0_0.jpg",
  retrodoges:
    "https://hubzz-assets-worker.hubzzhq.workers.dev/files/space-thumbs/1_0.jpg",
  catsGallery:
    "https://hubzz-assets-worker.hubzzhq.workers.dev/files/space-thumbs/cats-gallery.jpg",
} as const

/** Gradient fallbacks when the remote thumb fails to load. */
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

const DEMO_USERS = [
  { id: 1, name: "rileyp", color: "#6366f1" },
  { id: 2, name: "jamielee", color: "#ec4899" },
  { id: 3, name: "qtaylor", color: "#f59e0b" },
]

const DEMO_USERS_OVERFLOW = [
  ...DEMO_USERS,
  { id: 4, name: "avery_k", color: "#10b981" },
  { id: 5, name: "dakotac", color: "#3b82f6" },
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
    // Matches PublicSpaces framing for path 1,0 (Retrodoges).
    previewConfig: { scale: 1.15 },
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
    previewConfig: { scale: 1.15 },
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
    previewConfig: { scale: 1.15 },
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
