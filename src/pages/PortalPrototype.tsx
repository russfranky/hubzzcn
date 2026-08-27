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

const CURRENT_AVATAR_COLORS = ["#4c5663", "#6a584d", "#485a52"]

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

function CurrentAttendance() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex items-center">
        <div className="flex pr-[6px]">
          {CURRENT_AVATAR_COLORS.map((color, index) => (
            <span
              key={color}
              className="relative shrink-0 rounded-[32px]"
              style={{ height: 26, width: 26, marginRight: -6 }}
            >
              <span
                className="block size-full rounded-full"
                style={{ background: color }}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[-3px] rounded-[35px] border-3 border-solid border-[#24262b]"
                style={{ opacity: index === CURRENT_AVATAR_COLORS.length - 1 ? 0 : 1 }}
              />
            </span>
          ))}
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
    <div className="relative aspect-[7/2] w-full overflow-hidden rounded-[12px]">
      <div
        className="absolute inset-0"
        style={{ background: space.gradient }}
      />
      <div className="absolute inset-0 bg-[rgba(0,0,0,0.36)] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2),0px_0px_2px_0px_rgba(0,0,0,0.08),0px_2px_6px_0px_rgba(0,0,0,0.1)]" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between overflow-hidden">
        <div className="flex items-start justify-between p-3">
          <div className="flex min-w-0 flex-1 items-center justify-start">
            <h2 className="min-w-0 flex-1 overflow-hidden text-sm leading-5 font-bold text-ellipsis whitespace-nowrap text-[#fcfdfe]">
              {space.title}
            </h2>
            {browseLabel ? (
              <span className="ml-2 shrink-0 text-[13px] leading-[20px] font-medium text-[#a294fc]">
                {browseLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex w-full items-center justify-between px-3 pb-3">
          <SpaceAttendance space={space} />

          {onBrowse ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={onBrowse}
              aria-label={`View ${space.title} and ${space.attachedCount ?? 0} attached spaces`}
              className="shrink-0 rounded-full bg-white/5 text-[#fcfdfe] hover:bg-white/10 hover:text-[#fcfdfe]"
            >
              <ChevronRight className="size-4" />
            </Button>
          ) : space.current ? (
            <TimeInSpace />
          ) : !space.underConstruction ? (
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
    </div>
  )
}

function ScreenHeader({
  title,
  count,
  onBack,
}: {
  title: string
  count: number
  onBack?: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-5 pb-4 max-[400px]:pr-12">
      {onBack ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Back"
          onClick={onBack}
          className="shrink-0 rounded-full bg-white/5 text-foreground hover:bg-white/10 hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Button>
      ) : null}
      <span className="text-lg font-bold text-foreground">{title}</span>
      <span className="ml-auto text-[15px] font-semibold text-muted-foreground">
        {count}
      </span>
    </div>
  )
}

function PortalOverview({
  onOpenHallway,
}: {
  onOpenHallway: (floor: number) => void
}) {
  return (
    <div className="flex flex-col gap-4 px-4 pt-1 pb-4">
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
    <div className="flex flex-col gap-4 px-4 pt-1 pb-4">
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
    <main className="dark min-h-svh bg-background text-foreground">
      <section
        className="h-svh w-[min(92vw,28rem)] max-w-none overflow-hidden bg-sidebar text-sidebar-foreground shadow-[16px_0_32px_-16px_rgba(0,0,0,0.5)] sm:w-[350px] sm:max-w-[calc(100vw-1rem)]"
        aria-label="Hubzz Tower portal prototype"
      >
        <div className="flex h-full min-h-0 flex-col overflow-y-auto">
          <ScreenHeader
            title={floor === null ? "Hubzz Tower" : `Hallway ${floor}`}
            count={floor === null ? portalSpaces.length : 15}
            onBack={floor === null ? undefined : () => setFloor(null)}
          />

          {floor === null ? (
            <PortalOverview onOpenHallway={setFloor} />
          ) : (
            <HallwayView floor={floor} />
          )}
        </div>
      </section>
    </main>
  )
}

export default PortalPrototype
