import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export type EventTicketState = "upcoming" | "ready" | "joined" | "past"

export interface EventTicketProps {
  /** Required unless `loading` is true */
  state?: EventTicketState
  title?: string
  date?: string
  time?: string
  host?: string
  hostHref?: string
  space?: string
  spaceHref?: string
  ticketNumber?: string
  countdown?: { days: number; hours: number; minutes: number }
  imageSrc?: string
  className?: string
  testId?: string
  loading?: boolean
  onJoin?: () => void
  onLeave?: () => void
  onSeeDetail?: () => void
}

// Ticket shape paths (SVG export)
// With stub (ready / joined / upcoming / hover):
const PATH_STUB =
  "M9.98831 0H259.012C259.273 5.56682 263.869 10 269.5 10C275.131 10 279.727 5.56682 279.988 0H333.012C333.273 5.56682 337.869 10 343.5 10C343.668 10 343.834 9.99607 344 9.98831V172.012C343.834 172.004 343.668 172 343.5 172C337.701 172 333 176.701 333 182.5C333 182.668 333.004 182.834 333.012 183H279.988C279.996 182.834 280 182.668 280 182.5C280 176.701 275.299 172 269.5 172C263.701 172 259 176.701 259 182.5C259 182.668 259.004 182.834 259.012 183H9.98831C9.99607 182.834 10 182.668 10 182.5C10 176.869 5.56682 172.273 0 172.012V9.98831C5.40113 9.7351 9.7351 5.40113 9.98831 0Z"

// Perforations along the stub divider at x=269–271 .
// Combined with PATH_STUB via evenodd fill rule → punches transparent holes at the divider.
const PATH_STUB_PERFORATIONS =
  "M269 13.963L269 10L271 10L271 13.963L269 13.963ZM269 21.8643L269 17.9136L271 17.9136L271 21.8643L269 21.8643ZM269 29.7655L269 25.8149L271 25.8149L271 29.7655L269 29.7655ZM269 37.6667L269 33.7161L271 33.7161L271 37.6667L269 37.6667ZM269 45.5679L269 41.6173L271 41.6173L271 45.5679L269 45.5679ZM269 53.4692L269 49.5186L271 49.5186L271 53.4692L269 53.4692ZM269 61.3704L269 57.4198L271 57.4198L271 61.3704L269 61.3704ZM269 69.2716L269 65.321L271 65.321L271 69.2716L269 69.2716ZM269 77.1728L269 73.2222L271 73.2222L271 77.1728L269 77.1728ZM269 85.0741L269 81.1235L271 81.1235L271 85.0741L269 85.0741ZM269 92.9753L269 89.0247L271 89.0247L271 92.9753L269 92.9753ZM269 100.877L269 96.9259L271 96.9259L271 100.877L269 100.877ZM269 108.778L269 104.827L271 104.827L271 108.778L269 108.778ZM269 116.679L269 112.728L271 112.728L271 116.679L269 116.679ZM269 124.58L269 120.63L271 120.63L271 124.58L269 124.58ZM269 132.481L269 128.531L271 128.531L271 132.481L269 132.481ZM269 140.383L269 136.432L271 136.432L271 140.383L269 140.383ZM269 148.284L269 144.333L271 144.333L271 148.284L269 148.284ZM269 156.185L269 152.234L271 152.234L271 156.185L269 156.185ZM269 164.086L269 160.136L271 160.136L271 164.086L269 164.086ZM269 172L269 168.037L271 168.037L271 172L269 172Z"

// Past state — no stub, perforated right edge at x=342/344 
const PATH_PAST =
  "M9.98831 0H333.012C333.249 5.06337 337.073 9.18888 342 9.89367V13.1343H344V17.2556H342V21.3769H344V25.4982H342V29.6196H344V33.7409H342V37.8622H344V41.9835H342V46.1048H344V50.2262H342V54.3475H344V58.4688H342V62.5901H344V66.7114L342 66.7114V70.8327H344V74.9541H342V79.0754H344V83.1967H342V87.318H344V91.4393H342V95.5606H344V99.682H342V103.803H344V107.925H342V112.046H344V116.167H342V120.289H344V124.41H342V128.531L344 128.531V132.652H342V136.774H344V140.895H342V145.016H344V149.138H342V153.259H344V157.38H342V161.502H344V165.623H342V169.744H344V173.012C343.834 173.004 343.668 173 343.5 173C337.701 173 333 177.701 333 183.5C333 183.668 333.004 183.834 333.012 184H9.98831C9.99607 183.834 10 183.668 10 183.5C10 177.869 5.56682 173.273 0 173.012V9.98831C5.40113 9.7351 9.7351 5.40113 9.98831 0Z"

// Barcode bars — exact y/h values from SVG export (x=289-326 in ticket space → 0-37 local)
// All bars are full width (37px), y positions relative to barcode top (ticket y=22 → local y=0)
const BARCODE_BARS: [number, number][] = [
  [0,     4.63],
  [8.93,  1.82],
  [15.44, 1.54],
  [20.08, 1.54],
  [26.04, 7.26],
  [37.07, 3.09],
  [44.79, 3.09],
  [53.03, 3.63],
  [61.79, 1.82],
  [67.96, 3.09],
  [74.13, 1.54],
  [80.48, 3.63],
  [88.03, 3.09],
  [94.21, 3.09],
  [100.39, 1.54],
  [105.02, 4.63],
  [115.83, 3.09],
  [125.10, 4.63],
  [134.07, 1.09],
  [137.91, 1.09],
]

export function EventTicket({
  state,
  title,
  date,
  time,
  host,
  hostHref,
  space,
  spaceHref,
  ticketNumber,
  countdown,
  imageSrc,
  className,
  testId,
  loading = false,
  onJoin,
  onLeave,
  onSeeDetail,
}: EventTicketProps) {
  const uid = React.useId().replace(/:/g, "")
  const clipId = `tc-${uid}`
  const isPast = state === "past"

  // layout spec (all px, relative to 344×184 component):
  // content zone paddingLeft=26, paddingRight=26, paddingTop=16, paddingBottom=16
  // date y=16 h=18   title y=42 h=56   host y=102 h=20   action y=136 h=32
  // marginTop: date→title=8, title→host=4, host→action=14
  // date & time gap (space between the two spans) = 16px
  // divider: x=269, y=10-172, 2px wide, color #464F55, dash 4px / gap 4px
  // stub content (centered in 73px wide stub): barcode 37×139 at x=289-326, y=22-161
  // countdown frame: x=295, y=39, w=24, h=105; values Inter 16px 600 white, sep 14px 600 white

  return (
    <div
      data-ticket-state={loading ? "loading" : state}
      data-testid={testId}
      className={cn("relative shrink-0 select-none group", className)}
      style={{ width: 344, height: 184 }}
    >
      {/* Clip path — exact boolean subtract shape */}
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path
              clipRule="evenodd"
              d={isPast ? PATH_PAST : `${PATH_STUB} ${PATH_STUB_PERFORATIONS}`}
            />
          </clipPath>
        </defs>
      </svg>

      {/* Clipped ticket body */}
      <div
        className="absolute inset-0 bg-[#0A0C0F]"
        style={{ clipPath: `url(#${clipId})` }}
      >
        {/* Background image —  full-bleed cover */}
        {imageSrc && (
          <img
            src={imageSrc}
            alt=""
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover select-none"
          />
        )}

        {/* Overlay — base flat layer ( 60% base, 54% on hover) keeps mid-card on spec.
             Gradient layer darkens top + bottom so text stays legible on any venue photo. */}
        <div className="absolute inset-0 bg-black/[0.60] transition-[background-color] duration-200 group-hover:bg-black/[0.54]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 transition-opacity duration-200 group-hover:opacity-80" />

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="relative flex h-full">
            <div style={{ paddingLeft: 26, paddingRight: 26, paddingTop: 16, paddingBottom: 16, width: isPast ? 344 : 269, flexShrink: 0, display: "flex", flexDirection: "column", gap: 0 }}>
              <Skeleton className="h-[18px] w-[120px] bg-white/10" />
              <Skeleton className="mt-2 h-[28px] w-[180px] bg-white/10" />
              <Skeleton className="mt-1 h-[28px] w-[130px] bg-white/10" />
              <Skeleton className="mt-1 h-[20px] w-[160px] bg-white/10" />
              <div className="mt-auto flex items-center justify-between">
                <Skeleton className="h-[18px] w-[80px] bg-white/10" />
                <Skeleton className="h-8 w-[86px] rounded-full bg-white/10" />
              </div>
            </div>
            {!isPast && (
              <div style={{ width: 73, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Skeleton className="h-[139px] w-[37px] bg-white/10" />
              </div>
            )}
          </div>
        )}

        {/* ── Content layout ── */}
        {!loading && <div className="relative flex h-full">

          {/* Main content zone —  paddingLeft=26, right=26, top=16, bottom=16 */}
          {/* Width: 269px for stub states (to the divider), full for past */}
          <div
            style={{
              paddingLeft: 26,
              paddingRight: 26,
              paddingTop: 16,
              paddingBottom: 16,
              width: isPast ? 344 : 269,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Date & time — stub: gap 16px; past: justify-between + date flex-1 */}
            <div
              className={cn(
                "flex text-[12px] font-medium text-[#ACB9C4]",
                isPast ? "justify-between" : "gap-4"
              )}
              style={{ lineHeight: "18px" }}
            >
              <span className={isPast ? "flex-1" : ""}>{date}</span>
              <span>{time}</span>
            </div>

            {/* Title —  y=42, marginTop=8 from date. Inter 20px w=600 #FCFDFE, 2 lines h=56 */}
            {/* max-w-[217px] locks wrap point to stub-state width (269 content − 52 padding) across all states */}
            <p
              className="line-clamp-2 max-w-[217px] text-[20px] font-semibold text-[#FCFDFE]"
              style={{ marginTop: 8, lineHeight: "28px" }}
            >
              {title}
            </p>

            {/* Host —  stub y=102 gap=4, past y=78 gap=8. Inter 12px w=500 #FCFDFE ls=-0.12 */}
            <p
              className="break-words text-[12px] font-medium text-[#FCFDFE]"
              style={{ marginTop: isPast ? 8 : 4, lineHeight: "20px", letterSpacing: -0.12 }}
            >
              Hosted by{" "}
              {hostHref ? (
                <a href={hostHref} className="underline underline-offset-2 transition-opacity hover:opacity-70" onClick={e => e.stopPropagation()}>{host}</a>
              ) : host}
              {" "}at{" "}
              {spaceHref ? (
                <a href={spaceHref} className="underline underline-offset-2 transition-opacity hover:opacity-70" onClick={e => e.stopPropagation()}>{space}</a>
              ) : space}
            </p>

            {/* Action row —  y=136 always. marginTop=auto pins it regardless of title height */}
            <div className="flex items-center justify-between" style={{ marginTop: "auto" }}>
              {/*  12px/500 lh=18 #FCFDFE */}
              <span className="min-w-0 truncate text-[12px] font-medium leading-[18px] text-[#FCFDFE]">
                {ticketNumber}
              </span>

              {/*  h=32, paddingLeft=14, paddingRight=14, 12px/600 */}
              {state === "ready" && (
                <Button
                  size="sm"
                  className="h-8 shrink-0 cursor-pointer rounded-full px-[14px] text-[12px] font-semibold"
                  onClick={onJoin}
                >
                  Join event
                </Button>
              )}
              {state === "upcoming" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 shrink-0 cursor-pointer rounded-full bg-background px-[14px] text-[12px] font-semibold text-white hover:bg-hubzz-hover"
                  onClick={onJoin}
                >
                  Join event
                </Button>
              )}
              {state === "joined" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 shrink-0 cursor-pointer rounded-full bg-background px-[14px] text-[12px] font-semibold text-white hover:bg-hubzz-hover"
                  onClick={onLeave}
                >
                  Leave
                </Button>
              )}
              {state === "past" && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 shrink-0 cursor-pointer rounded-full bg-background px-[14px] text-[12px] font-semibold text-white hover:bg-hubzz-hover"
                  onClick={onSeeDetail}
                >
                  See detail
                </Button>
              )}
            </div>
          </div>

          {/* ── Stub ── */}
          {!isPast && (
            <>
              {/* Stub content — exactly 73px wide (344 - 269 divider x - 2 divider w) */}
              <div
                style={{
                  width: 73,
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {/* Barcode — always present; faded (#24262B) under countdown, normal (#5A6267) otherwise */}
                <svg width="37" height="139" viewBox="0 0 37 139" fill="none">
                  {BARCODE_BARS.map(([y, h], i) => (
                    <rect key={i} x="0" y={y} width="37" height={h}
                      fill={state === "upcoming" ? "#24262B" : "#5A6267"} />
                  ))}
                </svg>

                {/* Countdown — overlaid on top of faded barcode for upcoming state */}
                {state === "upcoming" && countdown && (
                  //  layoutMode=HORIZONTAL, itemSpacing=4, rotation=π/2 (90° CW)
                  // Pre-rotation: 105px wide × 24px tall; post-rotation: 24×105, centered in stub
                  <div
                    className="flex items-center text-[#FCFDFE] absolute"
                    style={{
                      transform: "rotate(90deg)",
                      gap: 4,
                      whiteSpace: "nowrap",
                      height: 24,
                    }}
                  >
                    <span className="text-[16px] font-semibold leading-none">{countdown.days}d</span>
                    <span className="text-[14px] font-semibold leading-none">:</span>
                    <span className="text-[16px] font-semibold leading-none">{countdown.hours}h</span>
                    <span className="text-[14px] font-semibold leading-none">:</span>
                    <span className="text-[16px] font-semibold leading-none">{countdown.minutes}m</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>}
      </div>
    </div>
  )
}
