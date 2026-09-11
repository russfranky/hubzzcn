import * as React from "react"

import { PortalHud } from "@/components/portal/portal-hud"
import { RooftopScene } from "@/components/portal/rooftop-scene"
import { SpaceCard } from "@/components/portal/space-card"
import {
  ScreenHeader,
  SpacesToolbar,
} from "@/components/portal/spaces-navigation"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  allSpaces,
  initialQuery,
  initialScope,
  spaceMatchesQuery,
  spacesForScope,
} from "@/lib/portal/data"
import type { SpaceScope } from "@/lib/portal/types"
import "./portal-prealpha.css"
import "./portal-scene.css"

export type PortalJoinSpace = (
  spaceId: string,
  title: string,
  path?: string
) => void

export interface PortalPrototypeProps {
  onJoinSpace: PortalJoinSpace
  currentSpaceId?: string
  onBack?: () => void
}

export function PortalPrototype({
  onJoinSpace,
  currentSpaceId = "rooftop",
  onBack,
}: PortalPrototypeProps) {
  const [scope, setScope] = React.useState<SpaceScope>(initialScope)
  const [query, setQuery] = React.useState(initialQuery)

  React.useEffect(() => {
    const currentParams = new URLSearchParams(window.location.search)
    const params = new URLSearchParams()

    if (currentParams.get("prototype") === "portal") {
      params.set("prototype", "portal")
    }

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
  const visibleSpaces = scopedSpaces
    .filter((space) => spaceMatchesQuery(space, query))
    .map((space) => ({ ...space, current: space.id === currentSpaceId }))

  const openHallway = (floor: number) => {
    setQuery("")
    setScope({ kind: "hallway", floor })
  }

  const handleBack = () => {
    if (scope.kind !== "portal") {
      setQuery("")
      setScope({ kind: "portal" })
      return
    }

    if (onBack) onBack()
    else window.history.back()
  }

  return (
    <section
      className="space-cards flex min-h-0 flex-1 flex-col overflow-hidden bg-sidebar text-sidebar-foreground"
      aria-label="Spaces"
    >
      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-0 overflow-auto">
        <ScreenHeader count={visibleSpaces.length} onBack={handleBack} />
        <SpacesToolbar
          query={query}
          scope={scope}
          onQueryChange={setQuery}
          onScopeChange={setScope}
        />

        <div className="flex flex-col gap-4 px-4 pt-1 pb-4">
          {visibleSpaces.length > 0 ? (
            visibleSpaces.map((space) => {
              const floorMatch = /^hallway-(\d+)$/.exec(space.id)
              const floor = floorMatch ? Number(floorMatch[1]) : null
              const canBrowse = scope.kind !== "hallway" && floor !== null

              return (
                <SpaceCard
                  key={space.id}
                  space={space}
                  browseLabel={
                    canBrowse ? `+${space.attachedCount} Spaces` : undefined
                  }
                  onBrowse={
                    canBrowse && floor ? () => openHallway(floor) : undefined
                  }
                  onJoin={
                    !space.current && !space.underConstruction
                      ? () => onJoinSpace(space.id, space.title, space.path)
                      : undefined
                  }
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
  )
}

export function PortalPrototypeDemo() {
  const [open, setOpen] = React.useState(true)
  const [currentSpaceId, setCurrentSpaceId] = React.useState("rooftop")
  const [lastJoin, setLastJoin] = React.useState("")
  const current = allSpaces.find((space) => space.id === currentSpaceId)!
  const joinSpace: PortalJoinSpace = (spaceId, title, path) => {
    setCurrentSpaceId(spaceId)
    setLastJoin(JSON.stringify({ spaceId, title, path: path ?? null }))
    setOpen(false)
  }

  return (
    <main className="hubzz-profile-panel-theme dark relative min-h-svh overflow-hidden bg-background text-foreground">
      <TooltipProvider>
        <Sheet open={open} onOpenChange={setOpen}>
          <RooftopScene
            current={current}
            doorsOpen={open}
            onEnterDoor={(spaceId) => {
              const destination = allSpaces.find(
                (space) => space.id === spaceId
              )
              if (destination) {
                joinSpace(destination.id, destination.title, destination.path)
              }
            }}
          />
          <SheetContent
            side="left"
            showCloseButton={false}
            className="hubzz-profile-panel-theme dark gap-0 overflow-hidden border-0 bg-sidebar text-sidebar-foreground data-[side=left]:w-[92vw] data-[side=left]:sm:w-[350px] data-[side=left]:sm:max-w-[calc(100vw-1rem)]"
          >
            <SheetTitle className="sr-only">Portal destinations</SheetTitle>
            <SheetDescription className="sr-only">
              Search spaces, browse attached rooms, or join a destination.
            </SheetDescription>
            <PortalPrototype
              currentSpaceId={currentSpaceId}
              onJoinSpace={joinSpace}
              onBack={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </TooltipProvider>
      <PortalHud current={current} />
      <span
        data-testid="last-portal-join"
        className="sr-only"
        aria-live="polite"
      >
        {lastJoin}
      </span>
    </main>
  )
}

export default PortalPrototypeDemo
