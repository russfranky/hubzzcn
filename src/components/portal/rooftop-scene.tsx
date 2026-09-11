import { Button } from "@/components/ui/button"
import { SheetTrigger } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HALL_DOOR_TARGET_ID } from "@/lib/portal/data"
import type { PortalSpace } from "@/lib/portal/types"
import { cn } from "@/lib/utils"

type RooftopSceneProps = {
  current: PortalSpace
  doorsOpen: boolean
  onEnterDoor: (spaceId: string) => void
}

export function RooftopScene({
  current,
  doorsOpen,
  onEnterDoor,
}: RooftopSceneProps) {
  const floorLabel = /^hallway-(\d+)$/.exec(current.id)?.[1] ?? current.title

  return (
    <div className="portal-rooftop-sky absolute inset-0 overflow-hidden">
      <div className="portal-starfield pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-[40%] h-[26%] overflow-hidden">
        <Skyline />
      </div>
      <div className="portal-terrace-grid pointer-events-none absolute inset-x-0 bottom-0 h-[42%]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-background to-transparent" />

      <div className="absolute inset-x-0 bottom-[7%] z-30 flex items-end justify-center gap-4 px-4 sm:gap-8">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              disabled={doorsOpen}
              aria-label="Enter Hallway 12"
              onClick={() => onEnterDoor(HALL_DOOR_TARGET_ID)}
              className="portal-elevator-frame relative h-40 w-20 overflow-hidden rounded-sm bg-card p-0 sm:h-48 sm:w-24"
            >
              <span
                aria-hidden="true"
                className="portal-elevator-door block h-full w-[70%]"
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Hallway 12</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                aria-label="Open elevator"
                className="portal-elevator-frame relative h-[220px] w-[180px] overflow-hidden rounded-lg bg-card p-0 sm:h-[252px] sm:w-[228px]"
              >
                <span className="absolute inset-x-0 top-0 z-10 flex h-9 items-center justify-center border-b border-border bg-card px-2 text-xs text-card-foreground">
                  {floorLabel}
                </span>
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-9 bottom-0 flex"
                >
                  <span
                    className={cn(
                      "portal-elevator-door h-full w-1/2 border-r border-border",
                      doorsOpen && "portal-door-left"
                    )}
                  />
                  <span
                    className={cn(
                      "portal-elevator-door h-full w-1/2 border-l border-border",
                      doorsOpen && "portal-door-right"
                    )}
                  />
                </span>
              </Button>
            </SheetTrigger>
          </TooltipTrigger>
          <TooltipContent>Browse spaces</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

function Skyline() {
  const heights = [42, 70, 38, 92, 48, 64, 110, 52, 78, 36, 88, 46, 96, 40, 60]

  return (
    <div
      className="flex h-full items-end justify-center gap-1 opacity-80"
      aria-hidden="true"
    >
      {heights.map((height, index) => (
        <span
          key={index}
          className="w-6 bg-card"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}
