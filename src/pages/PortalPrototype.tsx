import * as React from "react"
import { Check, ListFilter, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import "./portal-prealpha.css"

type PortalSpace = {
  id: string
  title: string
  gradient: string
  attachedCount?: number
  underConstruction?: boolean
  current?: boolean
}

type SpaceScope =
  | { kind: "portal" }
  | { kind: "all" }
  | { kind: "hallway"; floor: number }

const PROFILE_PANEL_BUTTON_BASE =
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
const PROFILE_PANEL_BUTTON_GHOST =
  "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50"
const PROFILE_PANEL_BUTTON_XS =
  "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3"

function ProfilePanelButton({
  className,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="button"
      data-variant="ghost"
      data-size="xs"
      className={cn(
        PROFILE_PANEL_BUTTON_BASE,
        PROFILE_PANEL_BUTTON_GHOST,
        PROFILE_PANEL_BUTTON_XS,
        className
      )}
      {...props}
    />
  )
}

const FLOOR_GRADIENTS = [
  "linear-gradient(135deg, #1a1a2e 0%, #16213e 44%, #0f3460 100%)",
  "linear-gradient(135deg, #241b2f 0%, #32233f 48%, #181b23 100%)",
  "linear-gradient(135deg, #1b2b2e 0%, #23393b 48%, #151b22 100%)",
  "linear-gradient(135deg, #2a211d 0%, #3b2d25 48%, #181719 100%)",
]

const CURRENT_AVATAR_COLORS = ["#4c5663", "#6a584d", "#485a52"]
const CARD_PHOTO_LINE = "inset 0 0 0 0.5px rgba(252,253,254,0.14)"

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

const allSpaces = [...portalSpaces, ...exploreSpaces]

function roomsForFloor(floor: number): PortalSpace[] {
  return Array.from({ length: 15 }, (_, index) => ({
    id: `${floor}-${String(index + 1).padStart(2, "0")}`,
    title: `${floor}-${String(index + 1).padStart(2, "0")}`,
    gradient: FLOOR_GRADIENTS[(floor + index) % FLOOR_GRADIENTS.length],
    underConstruction: true,
  }))
}

function initialScope(): SpaceScope {
  if (typeof window === "undefined") return { kind: "portal" }

  const params = new URLSearchParams(window.location.search)
  const attachedTo = params.get("attachedTo")
  const hallwayMatch = attachedTo ? /^hallway-(\d+)$/.exec(attachedTo) : null

  if (hallwayMatch) {
    return { kind: "hallway", floor: Number(hallwayMatch[1]) }
  }

  if (params.get("scope") === "all") return { kind: "all" }
  return { kind: "portal" }
}

function initialQuery() {
  if (typeof window === "undefined") return ""
  return new URLSearchParams(window.location.search).get("q") ?? ""
}

function spacesForScope(scope: SpaceScope): PortalSpace[] {
  if (scope.kind === "all") return allSpaces
  if (scope.kind === "portal") return portalSpaces

  const hallway = portalSpaces.find((space) => space.id === `hallway-${scope.floor}`)
  return hallway ? [hallway, ...roomsForFloor(scope.floor)] : []
}

function scopeLabel(scope: SpaceScope) {
  if (scope.kind === "all") return "All spaces"
  if (scope.kind === "portal") return "Hubzz Tower Portal"
  return `Hallway ${scope.floor}`
}

function CurrentAttendance() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex items-center">
        <div className="flex pr-[6px]">
          {CURRENT_AVATAR_COLORS.map((color, index) => {
            const gapMask =
              index < CURRENT_AVATAR_COLORS.length - 1
                ? "radial-gradient(circle 16px at 33px 13px, transparent 15.6px, black 16.4px)"
                : undefined

            return (
              <span
                key={color}
                className="relative shrink-0 rounded-[32px]"
                style={{ height: 26, width: 26, marginRight: -6 }}
              >
                <div
                  className="relative size-full overflow-hidden rounded-full"
                  style={{
                    background: color,
                    WebkitMaskImage: gapMask,
                    maskImage: gapMask,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full"
                    style={{
                      boxShadow: "inset 0 0 0 1px rgba(252,253,254,0.42)",
                    }}
                  />
                </div>
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TimeInSpace() {
  return (
    <span className="flex shrink-0 items-center gap-1.5 self-end px-3.5 text-[13px] leading-[16px] font-medium text-[#7c878e] tabular-nums">
      <svg
        width="14"
        height="14"
        viewBox="0 0 12 12"
        fill="none"
        className="shrink-0 opacity-60"
        aria-hidden="true"
      >
        <circle cx="6" cy="6" r="5" fill="#7c878e" />
        <circle cx="6" cy="6" r="4" fill="#24262b" />
        <rect x="5.5" y="3" width="1" height="3.5" rx="0.5" fill="#7c878e" />
        <rect x="5.5" y="5.5" width="2.5" height="1" rx="0.5" fill="#7c878e" />
      </svg>
      00:42
    </span>
  )
}

function SpaceAttendance({ space }: { space: PortalSpace }) {
  if (space.current) return <CurrentAttendance />

  if (space.underConstruction) {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <p className="text-[13px] leading-[20px] font-medium text-[#fcfdfe] opacity-70">
          Under construction
        </p>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-2 opacity-60">
      <div className="relative flex size-[20px] items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-[#fcfdfe] opacity-50 [animation-duration:12s]" />
        <svg
          width="14"
          height="14"
          viewBox="0 0 18 18"
          fill="none"
          className="relative opacity-50"
          aria-hidden="true"
        >
          <circle cx="6" cy="6.5" r="1.3" fill="#fcfdfe" />
          <circle cx="12" cy="6.5" r="1.3" fill="#fcfdfe" />
          <path
            d="M5.5 13.5C6.8 11.5 11.2 11.5 12.5 13.5"
            stroke="#fcfdfe"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <p className="text-[13px] leading-[20px] font-medium text-[#fcfdfe] opacity-70">
        Nobody&apos;s here
      </p>
    </div>
  )
}

function SpaceCard({
  space,
  browseLabel,
  onBrowse,
}: {
  space: PortalSpace
  browseLabel?: string
  onBrowse?: () => void
}) {
  return (
    <div className="relative aspect-[7/2] w-full cursor-pointer overflow-hidden rounded-[12px] bg-card">
      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <div
          className="absolute inset-0"
          style={{ background: space.gradient }}
        />
        <div className="absolute inset-0 bg-[rgba(0,0,0,0.36)] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_0px_2px_0px_rgba(0,0,0,0.08),0px_2px_6px_0px_rgba(0,0,0,0.1)]" />
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ boxShadow: CARD_PHOTO_LINE }}
      />

      <div className="relative z-10 flex h-full w-full flex-col justify-between overflow-hidden">
        <div className="flex items-start justify-between p-3">
          <div className="flex min-w-0 flex-1 items-center justify-start">
            <h2 className="min-w-0 overflow-hidden text-sm leading-5 font-bold text-ellipsis whitespace-nowrap text-[#fcfdfe]">
              {space.title}
            </h2>
          </div>

          {browseLabel && onBrowse ? (
            <button
              type="button"
              onClick={onBrowse}
              aria-label={`View ${space.title} and ${space.attachedCount ?? 0} attached spaces`}
              className="ml-3 shrink-0 cursor-pointer border-none bg-transparent p-0 text-[13px] leading-[20px] font-medium text-[#fcfdfe] opacity-50 transition-opacity hover:opacity-80"
            >
              {browseLabel}
            </button>
          ) : null}
        </div>

        <div className="flex w-full items-center justify-between px-3 pb-3">
          <SpaceAttendance space={space} />

          {space.current ? (
            <TimeInSpace />
          ) : !space.underConstruction ? (
            <ProfilePanelButton
              type="button"
              className="shrink-0 rounded-full bg-gradient-to-b from-[#9a77ff] to-[#735ffa] px-3.5 text-[12px] font-semibold text-[#fcfdfe] hover:text-[#fcfdfe] hover:opacity-90"
            >
              Join
            </ProfilePanelButton>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function FilterOption({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-[13px] leading-[20px] font-medium text-[#fcfdfe] transition-colors hover:bg-muted"
    >
      <span>{children}</span>
      {active ? <Check className="size-4 text-[#a294fc]" /> : null}
    </button>
  )
}

function SpacesToolbar({
  query,
  scope,
  onQueryChange,
  onScopeChange,
}: {
  query: string
  scope: SpaceScope
  onQueryChange: (value: string) => void
  onScopeChange: (scope: SpaceScope) => void
}) {
  const [filterOpen, setFilterOpen] = React.useState(false)

  const chooseScope = (next: SpaceScope) => {
    onScopeChange(next)
    setFilterOpen(false)
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-10 pb-6">
      <h1 className="text-[24px] leading-[32px] font-bold text-[#fcfdfe]">Spaces</h1>

      <div className="flex items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-[60px] bg-card px-4 py-3">
          <Search className="size-5 shrink-0 text-[#fcfdfe]" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search spaces"
            aria-label="Search spaces"
            className="min-w-0 flex-1 border-none bg-transparent p-0 text-[14px] leading-[20px] font-normal text-[#fcfdfe] outline-none placeholder:text-[#adbac5]"
          />
        </label>

        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="Filter spaces"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((open) => !open)}
            className="flex size-11 items-center justify-center rounded-full border-none bg-card text-[#fcfdfe] shadow-[0px_16px_16px_-4px_rgba(0,0,0,0.1)] transition-colors hover:bg-muted"
          >
            <ListFilter className="size-5" />
          </button>

          {filterOpen ? (
            <div className="absolute top-full right-0 z-30 mt-2 w-[220px] rounded-[12px] border border-white/5 bg-card p-1 shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.45)]">
              {scope.kind === "hallway" ? (
                <FilterOption active onClick={() => chooseScope(scope)}>
                  Hallway {scope.floor}
                </FilterOption>
              ) : null}
              <FilterOption
                active={scope.kind === "portal"}
                onClick={() => chooseScope({ kind: "portal" })}
              >
                Hubzz Tower Portal
              </FilterOption>
              <FilterOption
                active={scope.kind === "all"}
                onClick={() => chooseScope({ kind: "all" })}
              >
                All spaces
              </FilterOption>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function PortalPrototype() {
  const [scope, setScope] = React.useState<SpaceScope>(initialScope)
  const [query, setQuery] = React.useState(initialQuery)

  React.useEffect(() => {
    const params = new URLSearchParams()

    if (scope.kind === "portal") {
      params.set("portal", "hubzz_tower_portal")
    } else if (scope.kind === "hallway") {
      params.set("attachedTo", `hallway-${scope.floor}`)
    } else {
      params.set("scope", "all")
    }

    if (query) params.set("q", query)

    const search = params.toString()
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${search ? `?${search}` : ""}`
    )
  }, [query, scope])

  const scopedSpaces = spacesForScope(scope)
  const normalizedQuery = query.trim().toLowerCase()
  const visibleSpaces = normalizedQuery
    ? scopedSpaces.filter((space) => space.title.toLowerCase().includes(normalizedQuery))
    : scopedSpaces

  const openHallway = (floor: number) => {
    setQuery("")
    setScope({ kind: "hallway", floor })
  }

  return (
    <main className="hubzz-profile-panel-theme min-h-svh bg-background text-foreground">
      <section
        className="space-cards dark fixed inset-y-0 left-0 z-[200010] flex w-[min(92vw,28rem)] max-w-none flex-col overflow-hidden rounded-none bg-sidebar bg-clip-padding text-sm text-sidebar-foreground shadow-lg duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:w-[350px] sm:max-w-[calc(100vw-1rem)] sm:shadow-[16px_0_32px_-16px_rgba(0,0,0,0.5)] data-open:animate-in data-open:slide-in-from-left-[100%] data-closed:animate-out data-closed:slide-out-to-left-[100%]"
        aria-label="Spaces filtered by Hubzz Tower Portal"
      >
        <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto">
          <SpacesToolbar
            query={query}
            scope={scope}
            onQueryChange={setQuery}
            onScopeChange={setScope}
          />

          <div className="flex flex-col gap-4 px-4 pb-4">
            <div className="flex w-full items-start gap-[10px] text-[14px] leading-[20px] font-medium">
              <p className="min-w-0 flex-1 text-[#adbac5]">{scopeLabel(scope)}</p>
              <span className="shrink-0 text-[#adbac5]">{visibleSpaces.length}</span>
            </div>

            {visibleSpaces.length > 0 ? (
              visibleSpaces.map((space) => {
                const floorMatch = /^hallway-(\d+)$/.exec(space.id)
                const floor = floorMatch ? Number(floorMatch[1]) : null
                const canBrowse = scope.kind !== "hallway" && floor !== null

                return (
                  <SpaceCard
                    key={space.id}
                    space={space}
                    browseLabel={canBrowse ? `+${space.attachedCount} Spaces` : undefined}
                    onBrowse={canBrowse && floor ? () => openHallway(floor) : undefined}
                  />
                )
              })
            ) : (
              <div className="rounded-[12px] bg-card px-4 py-6 text-center text-[13px] leading-[20px] font-medium text-muted-foreground">
                No spaces match this search.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default PortalPrototype
