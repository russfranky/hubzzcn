import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const DEFAULT_AVATAR_COLORS = ["#4c5663", "#6a584d", "#485a52"]
const CARD_PHOTO_LINE = "inset 0 0 0 0.5px rgba(252,253,254,0.14)"
const DEFAULT_GRADIENT =
  "linear-gradient(135deg, #3d4a5c 0%, #1a1f28 50%, #2a3540 100%)"

export type SpaceCardAttendance = "here" | "empty" | "construction"
export type SpaceCardAction = "join" | "here" | "none"

export type SpaceCardProps = {
  title: string
  gradient?: string
  attendance?: SpaceCardAttendance
  /** Stacked color-dot avatars shown when attendance is `"here"`. */
  avatarColors?: string[]
  browseLabel?: string
  onBrowse?: () => void
  browseAriaLabel?: string
  action?: SpaceCardAction
  onJoin?: () => void
  spaceId?: string
  className?: string
}

function HereAttendance({ colors }: { colors: string[] }) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="flex items-center">
        <div className="flex pr-[6px]">
          {colors.map((color, index) => {
            const gapMask =
              index < colors.length - 1
                ? "radial-gradient(circle 16px at 33px 13px, transparent 15.6px, black 16.4px)"
                : undefined

            return (
              <span
                key={`${color}-${index}`}
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

function SpaceAttendance({
  attendance,
  avatarColors,
}: {
  attendance: SpaceCardAttendance
  avatarColors: string[]
}) {
  if (attendance === "here") {
    return <HereAttendance colors={avatarColors} />
  }

  if (attendance === "construction") {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <p className="text-[13px] leading-[20px] font-medium text-foreground opacity-70">
          Under construction
        </p>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-2 opacity-60">
      <div className="relative flex size-[20px] items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-foreground opacity-50 [animation-duration:12s] motion-safe:animate-spin" />
        <svg
          width="14"
          height="14"
          viewBox="0 0 18 18"
          fill="none"
          className="relative opacity-50"
          aria-hidden="true"
        >
          <circle cx="6" cy="6.5" r="1.3" fill="currentColor" />
          <circle cx="12" cy="6.5" r="1.3" fill="currentColor" />
          <path
            d="M5.5 13.5C6.8 11.5 11.2 11.5 12.5 13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
      <p className="text-[13px] leading-[20px] font-medium text-foreground opacity-70">
        Nobody&apos;s here
      </p>
    </div>
  )
}

function resolveAction(
  attendance: SpaceCardAttendance,
  action: SpaceCardAction | undefined,
  onJoin: (() => void) | undefined
): SpaceCardAction {
  if (action) return action
  if (attendance === "here") return "here"
  if (attendance === "construction") return "none"
  return onJoin ? "join" : "none"
}

export function SpaceCard({
  title,
  gradient = DEFAULT_GRADIENT,
  attendance = "empty",
  avatarColors = DEFAULT_AVATAR_COLORS,
  browseLabel,
  onBrowse,
  browseAriaLabel,
  action,
  onJoin,
  spaceId,
  className,
}: SpaceCardProps) {
  const resolvedAction = resolveAction(attendance, action, onJoin)

  return (
    <div
      data-space-id={spaceId}
      className={cn(
        "relative aspect-[7/2] min-h-[5.75rem] w-full shrink-0 overflow-hidden rounded-[12px] bg-card",
        className
      )}
    >
      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute inset-0" style={{ background: gradient }} />
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
            <h2 className="min-w-0 overflow-hidden text-sm leading-5 font-bold text-ellipsis whitespace-nowrap text-foreground">
              {title}
            </h2>
          </div>

          {browseLabel && onBrowse ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={onBrowse}
              aria-label={browseAriaLabel ?? `Browse ${title}`}
              className="ml-3 h-auto shrink-0 p-0 text-[13px] leading-5 text-foreground hover:bg-transparent hover:text-foreground"
            >
              {browseLabel}
            </Button>
          ) : null}
        </div>

        <div className="flex w-full items-center justify-between px-3 pb-3">
          <SpaceAttendance
            attendance={attendance}
            avatarColors={avatarColors}
          />

          {resolvedAction === "here" ? (
            <span className="px-3.5 text-xs font-medium text-foreground">
              Here
            </span>
          ) : resolvedAction === "join" && onJoin ? (
            <Button
              size="xs"
              type="button"
              onClick={onJoin}
              className="shrink-0 rounded-full px-3.5 text-xs font-semibold"
            >
              Join
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
