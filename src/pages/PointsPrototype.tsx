import * as React from "react"
import { useEffect, useMemo, useState } from "react"
import {
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Target,
  ChevronDown,
  Activity,
  Moon,
  MapPin,
} from "lucide-react"

type Tab = "earned" | "spent"

type Row = {
  id: number
  source: string
  points: string
  detail: string
  when: string
  type: string
  season: number
}

const earnedRowsAll: Row[] = [
  {
    id: 101,
    source: "Presence in Neon Plaza",
    points: "+40",
    detail: "Active + AFK combined",
    when: "Today",
    type: "Presence",
    season: 2,
  },
  {
    id: 102,
    source: "Rooftop Cache · TILE-A4-07",
    points: "+25",
    detail: "Dropbox discovered",
    when: "Today",
    type: "Discovery",
    season: 2,
  },
  {
    id: 103,
    source: "Visited all spaces in 48h",
    points: "+35",
    detail: "6 of 6 spaces",
    when: "Today",
    type: "Check-in",
    season: 2,
  },
  {
    id: 104,
    source: "Set vanity URL",
    points: "+50",
    detail: "hubzz.me/jules",
    when: "2d ago",
    type: "One-off task",
    season: 2,
  },
  {
    id: 105,
    source: "Visited all spaces in 48h",
    points: "+35",
    detail: "6 of 6 spaces",
    when: "3d ago",
    type: "Check-in",
    season: 2,
  },
  {
    id: 106,
    source: "Presence in Atrium",
    points: "+28",
    detail: "Active session",
    when: "4d ago",
    type: "Presence",
    season: 2,
  },
  {
    id: 107,
    source: "Greenhouse Drop · TILE-B2-11",
    points: "+20",
    detail: "Dropbox discovered",
    when: "5d ago",
    type: "Discovery",
    season: 2,
  },
  {
    id: 201,
    source: "Skylines launch quest",
    points: "+120",
    detail: "Completed",
    when: "Mar 1",
    type: "One-off task",
    season: 1,
  },
  {
    id: 202,
    source: "Presence in Skydeck",
    points: "+85",
    detail: "Active sessions ×4",
    when: "Mar 8",
    type: "Presence",
    season: 1,
  },
  {
    id: 203,
    source: "Visited all spaces in 48h",
    points: "+35",
    detail: "5 of 5 spaces",
    when: "Mar 14",
    type: "Check-in",
    season: 1,
  },
  {
    id: 301,
    source: "Genesis welcome task",
    points: "+200",
    detail: "Profile setup",
    when: "Jan 6",
    type: "One-off task",
    season: 0,
  },
  {
    id: 302,
    source: "Presence in The Lobby",
    points: "+60",
    detail: "Active sessions ×2",
    when: "Jan 14",
    type: "Presence",
    season: 0,
  },
]

const spentRowsAll: Row[] = [
  {
    id: 11,
    source: "Emote pack: Wave v2",
    points: "−80",
    detail: "Equipped",
    when: "Today",
    type: "Emote",
    season: 2,
  },
  {
    id: 12,
    source: "Custom nameplate color",
    points: "−150",
    detail: "Applied",
    when: "2d ago",
    type: "Profile",
    season: 2,
  },
  {
    id: 13,
    source: "Spotlight boost in Plaza",
    points: "−200",
    detail: "Active",
    when: "Today",
    type: "Boost",
    season: 2,
  },
]

const PAGE_SIZE = 5

const seasons = [
  {
    label: "Season 1 · Genesis",
    range: "Jan 5 – Feb 18",
    days: ["Jan 5", "Jan 25", "Feb 14"],
    data: [
      10, 25, 40, 55, 30, 70, 45, 60, 35, 50, 65, 80, 40, 55, 25, 70, 45, 30,
      60, 50, 75, 35, 55,
    ],
    stats: {
      active: { pts: 420, spaces: 3 },
      afk: { pts: 130, spaces: 2 },
      checkins: { count: 5, best: 5 },
    },
  },
  {
    label: "Season 2 · Skylines",
    range: "Feb 22 – Apr 6",
    days: ["Feb 22", "Mar 12", "Apr 1"],
    data: [
      30, 45, 60, 25, 50, 75, 40, 55, 30, 65, 80, 45, 25, 60, 35, 70, 50, 40,
      85, 30, 55, 65, 45,
    ],
    stats: {
      active: { pts: 740, spaces: 6 },
      afk: { pts: 220, spaces: 3 },
      checkins: { count: 6, best: 6 },
    },
  },
  {
    label: "Current season",
    range: "Apr 20 – May 31",
    days: ["Apr 20", "May 5", "May 20"],
    data: [
      45, 20, 30, 85, 60, 15, 70, 40, 95, 25, 55, 35, 80, 50, 20, 65, 30, 75,
      45, 40, 60, 90, 25,
    ],
    stats: {
      active: { pts: 180, spaces: 5 },
      afk: { pts: 60, spaces: 2 },
      checkins: { count: 4, best: 6 },
    },
  },
]

const WAYS_TO_EARN = [
  {
    type: "Presence",
    bg: "#735FFA",
    fg: "#fcfdfe",
    icon: Activity,
    label: "Active time in spaces",
    desc: "Earn points for time spent actively present in a Hubzz space.",
  },
  {
    type: "AFK",
    bg: "#2D3039",
    fg: "#c7d2da",
    icon: Moon,
    label: "AFK presence",
    desc: "Lower-rate points for time spent idle inside a space.",
  },
  {
    type: "Check-in",
    bg: "#E5B849",
    fg: "#0E0F12",
    icon: MapPin,
    label: "Check-ins",
    desc: "Visit every space at least once within a 48-hour cycle.",
  },
  {
    type: "Discovery",
    bg: "#4CC38A",
    fg: "#0E0F12",
    icon: Target,
    label: "Discovering dropboxes",
    desc: "Find hidden dropboxes scattered across spaces.",
  },
  {
    type: "One-off task",
    bg: "#FF5A5A",
    fg: "#fcfdfe",
    icon: Sparkles,
    label: "One-off tasks",
    desc: "Special prompts like setting your vanity URL.",
  },
]

function EngagementPoints() {
  const [tab, setTab] = useState<Tab>("earned")
  const [seasonIdx, setSeasonIdx] = useState(2)
  const [seasonDir, setSeasonDir] = useState(0)
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(0)

  const goSeason = (delta: number) => {
    setSeasonDir(delta)
    setSeasonIdx((i) => Math.max(0, Math.min(seasons.length - 1, i + delta)))
    setPage(0)
  }

  const isCurrent = seasonIdx === seasons.length - 1
  const currentBalance = 1240
  const pendingDrop = 185
  const seasonEarnedTotal = useMemo(
    () =>
      earnedRowsAll
        .filter((r) => r.season === seasonIdx)
        .reduce((sum, r) => sum + parseInt(r.points.replace("+", ""), 10), 0),
    [seasonIdx]
  )

  const filteredRows = useMemo(() => {
    const all = tab === "earned" ? earnedRowsAll : spentRowsAll
    return all
      .filter((r) => r.season === seasonIdx)
      .filter((r) => (typeFilter ? r.type === typeFilter : true))
      .filter((r) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          r.source.toLowerCase().includes(q) ||
          r.detail.toLowerCase().includes(q)
        )
      })
  }, [tab, seasonIdx, typeFilter, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pagedRows = filteredRows.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  )

  return (
    <div className="mx-auto max-w-[960px] px-10 py-14">
      <header className="mb-8 flex items-end justify-between gap-8">
        <div className="flex-1">
          <h1 className="text-[26px] font-semibold tracking-tight text-[#fcfdfe]">
            Engagement points
          </h1>
          <p className="mt-1 max-w-[420px] text-[13px] leading-relaxed text-[#5A6268]">
            Passive rewards earned for spending time in Hubzz spaces. Points can
            be redeemed for emotes, profile flair, and boosts.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10.5px] tracking-[0.08em] text-[#5A6268] uppercase">
            Available balance
          </div>
          <div className="mt-0.5 flex items-baseline justify-end gap-1.5">
            <span className="text-[32px] leading-[1.1] font-semibold tracking-[-0.01em] text-[#fcfdfe] tabular-nums">
              {currentBalance.toLocaleString()}
            </span>
            <span className="text-[13px] font-medium text-[#5A6268]">pts</span>
          </div>
          <div className="mt-1 text-[11.5px] text-[#5A6268] tabular-nums">
            <DisbursementCaption pending={pendingDrop} />
          </div>
        </div>
      </header>

      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[13px] font-medium text-[#c7d2da]">
              {seasons[seasonIdx].label}
            </h2>
            <span className="text-[12px] text-[#5A6268]">
              {seasons[seasonIdx].range}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[#5A6268]">
            <span className="text-[12px] tabular-nums">
              <span className="text-[#c7d2da]">
                {seasonEarnedTotal.toLocaleString()}
              </span>{" "}
              pts earned
            </span>
            <div className="flex items-center gap-1">
              <button
                title="Previous season"
                onClick={() => goSeason(-1)}
                disabled={seasonIdx === 0}
                className="rounded p-1 hover:bg-[#2D3039] hover:text-[#c7d2da] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5A6268]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                title="Next season"
                onClick={() => goSeason(1)}
                disabled={seasonIdx === seasons.length - 1}
                className="rounded p-1 hover:bg-[#2D3039] hover:text-[#c7d2da] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5A6268]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <SeasonChart
          data={seasons[seasonIdx].data}
          dayLabels={seasons[seasonIdx].days}
          isCurrent={isCurrent}
          seasonKey={seasonIdx}
          dir={seasonDir}
          startLabel={seasons[seasonIdx].days[0]}
        />
      </section>

      <div className="flex items-center justify-between border-b border-[#2D3039]">
        <div className="flex items-center gap-1">
          <TabBtn
            active={tab === "earned"}
            onClick={() => {
              setTab("earned")
              setPage(0)
            }}
          >
            Earned
          </TabBtn>
          <TabBtn
            active={tab === "spent"}
            onClick={() => {
              setTab("spent")
              setPage(0)
            }}
          >
            Spent
          </TabBtn>
        </div>
        <div className="mb-1 flex items-center gap-1.5">
          {tab === "earned" && (
            <div className="flex items-center gap-1">
              {WAYS_TO_EARN.map((w) => {
                const Icon = w.icon
                const active = typeFilter === w.type
                return (
                  <button
                    key={w.type}
                    onClick={() => {
                      setTypeFilter(active ? null : w.type)
                      setPage(0)
                    }}
                    title={`${w.label} — ${w.desc}`}
                    className={`flex h-6 items-center justify-center rounded-full border transition ${
                      active
                        ? "gap-1.5 border-transparent px-2 text-[11.5px]"
                        : "w-6 border-[#2D3039] text-[#c7d2da]/80 hover:border-[#5A6268] hover:text-[#fcfdfe]"
                    }`}
                    style={
                      active
                        ? { backgroundColor: w.bg, color: w.fg }
                        : undefined
                    }
                  >
                    <Icon className="h-3 w-3" />
                    {active && w.type}
                  </button>
                )
              })}
              {typeFilter && (
                <button
                  onClick={() => {
                    setTypeFilter(null)
                    setPage(0)
                  }}
                  title="Clear filter"
                  className="ml-0.5 rounded p-1 text-[#5A6268] hover:text-[#fcfdfe]"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <div className="mx-1 h-4 w-px bg-[#2D3039]" />
            </div>
          )}
          {searchOpen ? (
            <div className="flex items-center gap-1 rounded border border-[#2D3039] bg-[#1C1E23] px-2">
              <Search className="h-3.5 w-3.5 text-[#5A6268]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(0)
                }}
                placeholder="Search activity"
                className="w-[160px] bg-transparent py-1 text-[12.5px] text-[#c7d2da] placeholder:text-[#5A6268] focus:outline-none"
              />
              <button
                onClick={() => {
                  setSearchOpen(false)
                  setSearchQuery("")
                  setPage(0)
                }}
                className="text-[#5A6268] hover:text-[#fcfdfe]"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded p-1.5 text-[#5A6268] hover:bg-[#2D3039] hover:text-[#c7d2da]"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3 mb-6">
        <div className="grid grid-cols-[2.4fr_0.7fr_1.4fr_0.9fr] items-center gap-4 border-b border-[#1C1E23] px-1 py-2 text-[12px] text-[#5A6268]">
          <ColHead>Activity</ColHead>
          <ColHead>Points</ColHead>
          <ColHead>Detail</ColHead>
          <ColHead>When</ColHead>
        </div>

        {pagedRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-[#2D3039] py-10 text-center">
            <div className="text-[13px] text-[#c7d2da]">
              {tab === "spent"
                ? "Nothing spent here yet"
                : "No activity matches"}
            </div>
            <div className="max-w-[320px] text-[12px] text-[#5A6268]">
              {tab === "spent"
                ? "You haven't spent any points this season yet."
                : searchQuery || typeFilter
                  ? "Try clearing the search or filter to see all activity."
                  : "Activity for this season will appear here once you start earning."}
            </div>
          </div>
        ) : (
          pagedRows.map((r) => (
            <div
              key={r.id}
              className="grid grid-cols-[2.4fr_0.7fr_1.4fr_0.9fr] items-center gap-4 border-b border-[#1C1E23] px-1 py-2.5 text-[13px] transition hover:bg-[#20232A]"
            >
              <div className="text-[#c7d2da]">{r.source}</div>
              <div
                className="tabular-nums"
                style={{
                  color: r.points.startsWith("+") ? "#4CC38A" : "#FF5A5A",
                }}
              >
                {r.points}
              </div>
              <div className="text-[#5A6268]">{r.detail}</div>
              <div className="text-[#5A6268]">{r.when}</div>
            </div>
          ))
        )}
      </div>

      {filteredRows.length > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-2 text-[12.5px] text-[#5A6268]">
          <span className="tabular-nums">
            Page {safePage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="rounded p-1 hover:bg-[#2D3039] hover:text-[#c7d2da] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5A6268]"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
            className="rounded p-1 hover:bg-[#2D3039] hover:text-[#c7d2da] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#5A6268]"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function DisbursementCaption({ pending }: { pending: number }) {
  const [target] = useState(() => Date.now() + 23 * 3600_000 + 39 * 60_000)
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const remaining = Math.max(0, target - now)
  const h = Math.floor(remaining / 3_600_000)
  const m = Math.floor((remaining % 3_600_000) / 60_000)
  return (
    <span className="tabular-nums">
      <span className="text-[#4CC38A]">+{pending}</span> disbursing in {h}h{" "}
      {String(m).padStart(2, "0")}m
    </span>
  )
}

function SeasonChart({
  data,
  dayLabels,
  isCurrent = true,
  seasonKey,
  dir = 0,
  startLabel,
}: {
  data: number[]
  dayLabels: string[]
  isCurrent?: boolean
  seasonKey: string | number
  dir?: number
  startLabel: string
}) {
  const todayIdx = isCurrent ? data.length - 1 : -1
  const totalDays = 31
  const chartH = 140
  const maxVal = 100
  const [hover, setHover] = useState<number | null>(null)

  const animClass =
    dir > 0 ? "ep-slide-in-right" : dir < 0 ? "ep-slide-in-left" : ""

  return (
    <div className="relative mb-2 overflow-hidden">
      <style>{`
        @keyframes ep-slide-in-right { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes ep-slide-in-left  { from { transform: translateX(-24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .ep-slide-in-right { animation: ep-slide-in-right 280ms cubic-bezier(0.22, 0.61, 0.36, 1); }
        .ep-slide-in-left  { animation: ep-slide-in-left  280ms cubic-bezier(0.22, 0.61, 0.36, 1); }
      `}</style>
      <div className="relative" style={{ height: chartH + 28 }}>
        <div key={seasonKey} className={`relative h-full w-full ${animClass}`}>
          <div className="relative w-full" style={{ height: chartH }}>
            {[0.33, 0.66].map((g) => (
              <div
                key={g}
                className="absolute right-0 left-0 h-px bg-[#1C1E23]"
                style={{ top: `${g * 100}%` }}
              />
            ))}

            {Array.from({ length: totalDays }).map((_, i) => {
              const leftPct = (i / (totalDays - 1)) * 100
              const v = data[i]
              const isToday = i === todayIdx
              const isFuture = isCurrent && i > todayIdx

              if (isFuture) {
                return (
                  <div
                    key={i}
                    className="absolute h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1C1E23]"
                    style={{ left: `${leftPct}%`, bottom: -1 }}
                  />
                )
              }

              if (v === undefined || v === 0) return null

              const topPct = (1 - v / maxVal) * 100
              const stemHeightPct = (v / maxVal) * 100
              const isHover = hover === i
              const dayDate = new Date(`${startLabel}, 2026`)
              dayDate.setDate(dayDate.getDate() + i)
              const dayStr = dayDate.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              })

              return (
                <div
                  key={i}
                  className="absolute"
                  style={{ left: `${leftPct}%`, top: 0, bottom: 0 }}
                >
                  <div
                    className={`absolute w-px -translate-x-1/2 ${isToday ? "bg-[#E5B849]/80" : "bg-[#2D3039]"}`}
                    style={{ top: `${topPct}%`, height: `${stemHeightPct}%` }}
                  />
                  <div
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-default rounded-full transition-transform duration-150 ${
                      isToday
                        ? "h-[10px] w-[10px] bg-[#E5B849] shadow-[0_0_0_3px_#0E0F12]"
                        : "h-[5px] w-[5px] bg-[#c7d2da]/70 shadow-[0_0_0_3px_transparent]"
                    } ${isHover ? "scale-[1.6]" : "scale-100"}`}
                    style={{ top: `${topPct}%` }}
                  />
                  {isHover && (
                    <div
                      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md border border-[#2D3039] bg-[#1C1E23] px-2 py-1 text-[11.5px] whitespace-nowrap text-[#c7d2da] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]"
                      style={{ top: `calc(${topPct}% - 14px)` }}
                    >
                      <div className="text-[10px] tracking-wider text-[#5A6268] uppercase">
                        {dayStr}
                        {isToday && " · today"}
                      </div>
                      <div className="tabular-nums">
                        <span className="text-[#fcfdfe]">{v}</span>
                        <span className="text-[#5A6268]"> pts</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div
            className="absolute right-0 left-0 h-px bg-[#2D3039]"
            style={{ top: chartH }}
          />

          <div
            className="absolute right-0 left-0 flex justify-between text-[12px] text-[#5A6268]"
            style={{ top: chartH + 8 }}
          >
            {dayLabels.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ColHead({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 text-[#5A6268]">
      {children}
      <ChevronDown className="h-3 w-3 opacity-60" />
    </div>
  )
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-2 pt-1 pb-2 text-[13px] transition ${
        active
          ? "border-[#735FFA] text-[#fcfdfe]"
          : "border-transparent text-[#5A6268] hover:text-[#c7d2da]"
      }`}
    >
      {children}
    </button>
  )
}

export function PointsPrototype() {
  return (
    <div className="dark min-h-screen w-full bg-[#0E0F12] text-[#c7d2da]">
      <EngagementPoints />
    </div>
  )
}

export default PointsPrototype
