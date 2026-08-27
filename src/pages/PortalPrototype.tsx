import * as React from "react"
import { ArrowLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

type PortalSpace = {
  id: string
  title: string
  gradient: string
  attachedCount?: number
  underConstruction?: boolean
  current?: boolean
}

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
      underConstruction: true,
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

function roomsForFloor(floor: number): PortalSpace[] {
  return Array.from({ length: 15 }, (_, index) => ({
    id: `${floor}-${String(index + 1).padStart(2, "0")}`,
    title: `${floor}-${String(index + 1).padStart(2, "0")}`,
    gradient: FLOOR_GRADIENTS[(floor + index) % FLOOR_GRADIENTS.length],
    underConstruction: true,
  }))
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
  const body = (
    <>
      <div className="absolute inset-0" style={{ background: space.gradient }} />
      <div className="absolute inset-0 bg-black/36 shadow-[0_0_0_1px_rgba(0,0,0,0.2),0_0_2px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.1)]" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between overflow-hidden">
        <div className="flex min-w-0 items-center gap-3 p-3">
          <h2 className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-bold leading-5 text-[#fcfdfe]">
            {space.title}
          </h2>
          {browseLabel ? (
            <span className="shrink-0 text-[13px] font-medium leading-5 text-[#a294fc]">
              {browseLabel}
            </span>
          ) : null}
        </div>

        <div className="flex w-full items-center justify-between px-3 pb-3">
          <div className="flex min-w-0 items-center gap-2">
            {space.current ? (
              <>
                <div className="flex shrink-0 items-center">
                  <span className="relative z-20 block size-[26px] rounded-full bg-[#4c5663] shadow-[0_0_0_2px_rgba(24,27,31,0.9)]" />
                  <span className="relative z-10 -ml-1.5 block size-[26px] rounded-full bg-[#6a584d] shadow-[0_0_0_2px_rgba(24,27,31,0.9)]" />
                </div>
                <span className="truncate text-[13px] font-medium leading-5 text-[#fcfdfe]/70">
                  Current location
                </span>
              </>
            ) : space.underConstruction ? (
              <span className="truncate text-[13px] font-medium leading-5 text-[#fcfdfe]/70">
                Under construction
              </span>
            ) : (
              <span className="truncate text-[13px] font-medium leading-5 text-[#fcfdfe]/70">
                Nobody&apos;s here
              </span>
            )}
          </div>

          {onBrowse ? (
            <span
              aria-hidden="true"
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-[#fcfdfe] transition-colors group-hover:bg-white/10"
            >
              <ChevronRight className="size-5" />
            </span>
          ) : !space.current && !space.underConstruction ? (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="shrink-0 rounded-full bg-gradient-to-b from-[#9a77ff] to-[#735ffa] px-3.5 text-[12px] font-semibold text-[#fcfdfe] hover:text-[#fcfdfe] hover:opacity-90"
            >
              Join
            </Button>
          ) : null}
        </div>
      </div>
    </>
  )

  if (onBrowse) {
    return (
      <button
        type="button"
        onClick={onBrowse}
        className="group relative aspect-[7/2] w-full cursor-pointer overflow-hidden rounded-[12px] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#a294fc] focus-visible:ring-offset-2 focus-visible:ring-offset-[#181b1f]"
        aria-label={`View ${space.title} and ${space.attachedCount ?? 0} attached spaces`}
      >
        {body}
      </button>
    )
  }

  return (
    <div className="relative aspect-[7/2] w-full overflow-hidden rounded-[12px]">
      {body}
    </div>
  )
}

function PortalOverview({ onOpenHallway }: { onOpenHallway: (floor: number) => void }) {
  return (
    <div className="space-y-4 p-4">
      {portalSpaces.map((space) => {
        const floorMatch = /^hallway-(\d+)$/.exec(space.id)
        const floor = floorMatch ? Number(floorMatch[1]) : null

        return (
          <SpaceCard
            key={space.id}
            space={space}
            browseLabel={floor ? `+ ${space.attachedCount} Spaces` : undefined}
            onBrowse={floor ? () => onOpenHallway(floor) : undefined}
          />
        )
      })}
    </div>
  )
}

function HallwayView({ floor }: { floor: number }) {
  const hallway = portalSpaces.find((space) => space.id === `hallway-${floor}`)
  const rooms = roomsForFloor(floor)

  if (!hallway) return null

  return (
    <div className="space-y-4 p-4">
      <SpaceCard space={hallway} />
      {rooms.map((room) => (
        <SpaceCard key={room.id} space={room} />
      ))}
    </div>
  )
}

export function PortalPrototype() {
  const [floor, setFloor] = React.useState<number | null>(null)

  return (
    <main className="min-h-screen bg-[#0f1115] text-[#fcfdfe]">
      <div className="min-h-screen bg-[radial-gradient(circle_at_72%_18%,rgba(86,78,128,0.16),transparent_32%),radial-gradient(circle_at_70%_78%,rgba(34,66,84,0.14),transparent_30%)]">
        <section
          className="min-h-screen w-full border-r border-white/6 bg-[#181b1f] sm:max-w-[390px]"
          aria-label="Hubzz Tower portal prototype"
        >
          <header className="sticky top-0 z-30 flex h-14 items-center border-b border-white/6 bg-[#181b1f]/95 px-3 backdrop-blur">
            {floor !== null ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setFloor(null)}
                className="mr-1 shrink-0 text-[#adbac5] hover:bg-white/5 hover:text-[#fcfdfe]"
                aria-label="Back to Hubzz Tower"
              >
                <ArrowLeft className="size-4" />
              </Button>
            ) : null}
            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-semibold leading-5 text-[#fcfdfe]">
                {floor === null ? "Hubzz Tower" : `Hallway ${floor}`}
              </h1>
              <p className="text-[11px] font-medium leading-4 text-[#7c878e]">
                {floor === null ? "Portal" : "15 attached spaces"}
              </p>
            </div>
          </header>

          <div className="pb-8">
            {floor === null ? (
              <PortalOverview onOpenHallway={setFloor} />
            ) : (
              <HallwayView floor={floor} />
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default PortalPrototype
