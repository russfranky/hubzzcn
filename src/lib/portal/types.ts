export type PortalSpace = {
  id: string
  title: string
  gradient: string
  path?: string
  attachedCount?: number
  underConstruction?: boolean
  current?: boolean
}

export type SpaceScope =
  { kind: "portal" } | { kind: "all" } | { kind: "hallway"; floor: number }
