import type { PortalSpace, SpaceScope } from "./types"

const FLOOR_GRADIENTS = [
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 44%, #0f3460 100%)",
  "linear-gradient(135deg, #241b2f 0%, #32233f 48%, #181b23 100%)",
  "linear-gradient(135deg, #1b2b2e 0%, #23393b 48%, #151b22 100%)",
  "linear-gradient(135deg, #2a211d 0%, #3b2d25 48%, #181719 100%)",
]

const portalSpaces: PortalSpace[] = [
  {
    id: "rooftop",
    title: "Hubzz Rooftop",
    gradient: "linear-gradient(145deg, #36251d 0%, #171c28 55%, #101216 100%)",
    current: true,
  },
  ...Array.from({ length: 11 }, (_, index) => {
    const floor = 12 - index
    return {
      id: `hallway-${floor}`,
      title: `Hallway ${floor}`,
      attachedCount: 15,
      gradient: FLOOR_GRADIENTS[index % FLOOR_GRADIENTS.length],
    }
  }),
  {
    id: "lobby",
    title: "Lobby",
    gradient: "linear-gradient(135deg, #252930 0%, #343841 52%, #17191e 100%)",
    underConstruction: true,
  },
]

const exploreSpaces: PortalSpace[] = [
  {
    id: "the-lounge",
    title: "The Lounge",
    gradient: "linear-gradient(135deg, #20283a 0%, #283650 48%, #171b25 100%)",
  },
  {
    id: "dev-workshop",
    title: "Dev Workshop",
    gradient: "linear-gradient(135deg, #1c2f2a 0%, #29463d 48%, #151d1b 100%)",
  },
  {
    id: "main-stage",
    title: "Main Stage",
    gradient: "linear-gradient(135deg, #342033 0%, #4a2b47 48%, #1d161d 100%)",
  },
  {
    id: "chill-zone",
    title: "Chill Zone",
    gradient: "linear-gradient(135deg, #202d38 0%, #284253 48%, #151b20 100%)",
  },
]

export const allSpaces = [...portalSpaces, ...exploreSpaces]

function roomsForFloor(floor: number): PortalSpace[] {
  return Array.from({ length: 15 }, (_, index) => ({
    id: `${floor}-${String(index + 1).padStart(2, "0")}`,
    title: `${floor}-${String(index + 1).padStart(2, "0")}`,
    gradient: FLOOR_GRADIENTS[(floor + index) % FLOOR_GRADIENTS.length],
    underConstruction: true,
  }))
}

export function isKnownHallwayFloor(floor: number) {
  return portalSpaces.some((space) => space.id === `hallway-${floor}`)
}

export function initialScope(): SpaceScope {
  if (typeof window === "undefined") return { kind: "portal" }

  const params = new URLSearchParams(window.location.search)
  const attachedTo = params.get("attachedTo")
  const hallwayMatch = attachedTo ? /^hallway-(\d+)$/.exec(attachedTo) : null

  if (hallwayMatch) {
    const floor = Number(hallwayMatch[1])
    if (isKnownHallwayFloor(floor)) {
      return { kind: "hallway", floor }
    }
  }

  if (params.get("scope") === "all") return { kind: "all" }
  return { kind: "portal" }
}

export function initialQuery() {
  if (typeof window === "undefined") return ""
  return new URLSearchParams(window.location.search).get("q") ?? ""
}

export function spacesForScope(scope: SpaceScope): PortalSpace[] {
  if (scope.kind === "all") return allSpaces
  if (scope.kind === "portal") return portalSpaces

  const hallway = portalSpaces.find(
    (space) => space.id === `hallway-${scope.floor}`
  )
  return hallway ? [hallway, ...roomsForFloor(scope.floor)] : []
}

export const HALL_DOOR_TARGET_ID = "hallway-12"

/** Match a whole floor number within the selected discovery scope. */
export function spaceMatchesQuery(space: PortalSpace, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  if (/^\d{1,2}$/.test(normalized)) {
    const floor = /^(?:hallway-)?(\d+)(?:-\d+)?$/.exec(space.id)?.[1]
    return floor !== undefined && Number(floor) === Number(normalized)
  }
  return space.title.toLowerCase().includes(normalized)
}
