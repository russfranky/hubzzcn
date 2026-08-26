import * as React from "react"
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Link2,
  Maximize2,
  MoreVertical,
  Pause,
  Play,
  Shuffle,
  Trash2,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PrototypeQueueItem = {
  id: string
  title: string
  url: string
  platform: string
  addedBy: string
  durationSeconds?: number
}

type SetlistSegment = {
  title?: unknown
  url?: unknown
  platform?: unknown
  duration?: unknown
}

type PendingSetlist = {
  name: string
  items: PrototypeQueueItem[]
  dropped: number
}

const HISTORY_LIMIT = 3
const SETLIST_LIMIT = 500

const INITIAL_PLAYED: PrototypeQueueItem[] = [
  {
    id: "played-sunset-drive",
    title: "Sunset Drive 2025 – Live Set",
    url: "https://www.youtube.com/watch?v=sunset-drive",
    platform: "YouTube",
    addedBy: "@john",
    durationSeconds: 3504,
  },
  {
    id: "played-chillhop",
    title: "Chillhop Essentials – Spring 2025",
    url: "https://www.youtube.com/watch?v=chillhop-spring",
    platform: "YouTube",
    addedBy: "@john",
    durationSeconds: 3731,
  },
  {
    id: "played-tokyo",
    title: "Tokyo Nights – LoFi Mix",
    url: "https://www.youtube.com/watch?v=tokyo-lofi",
    platform: "YouTube",
    addedBy: "@john",
    durationSeconds: 2707,
  },
]

const INITIAL_CURRENT: PrototypeQueueItem = {
  id: "current-tomorrowland",
  title: "Tomorrowland 2026 Mainstage W1",
  url: "https://www.youtube.com/watch?v=tomorrowland-2026",
  platform: "YouTube",
  addedBy: "@dan",
  durationSeconds: 4542,
}

const INITIAL_UPCOMING: PrototypeQueueItem[] = [
  {
    id: "upcoming-afterlife",
    title: "Afterlife Tulum 2025",
    url: "https://www.youtube.com/watch?v=afterlife-tulum",
    platform: "YouTube",
    addedBy: "@john",
    durationSeconds: 4353,
  },
  {
    id: "upcoming-calvin",
    title: "Calvin Harris – Live at Ushuaïa",
    url: "https://www.youtube.com/watch?v=calvin-ushuaia",
    platform: "YouTube",
    addedBy: "@john",
    durationSeconds: 3550,
  },
  {
    id: "upcoming-anjuna",
    title: "Anjunadeep Open Air 2025",
    url: "https://www.youtube.com/watch?v=anjunadeep-open-air",
    platform: "YouTube",
    addedBy: "@john",
    durationSeconds: 3942,
  },
  {
    id: "upcoming-keinemusik",
    title: "Keinemusik Radio Show",
    url: "https://www.youtube.com/watch?v=keinemusik-radio",
    platform: "YouTube",
    addedBy: "@john",
    durationSeconds: 3618,
  },
  {
    id: "upcoming-rufus",
    title: "Rüfüs Du Sol – Live from LA",
    url: "https://www.youtube.com/watch?v=rufus-live-la",
    platform: "YouTube",
    addedBy: "@john",
    durationSeconds: 4075,
  },
]

function formatTime(seconds?: number) {
  if (!Number.isFinite(seconds) || seconds === undefined) return "LIVE"
  const safe = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safe / 3600)
  const minutes = Math.floor((safe % 3600) / 60)
  const secs = safe % 60

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return `${minutes}:${String(secs).padStart(2, "0")}`
}

function providerFromUrl(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "")
    if (host.includes("youtube") || host === "youtu.be") return "YouTube"
    if (host.includes("twitch")) return "Twitch"
    return host
  } catch {
    return "Web"
  }
}

function isSafeHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
  }
}

function Contributor({ name }: { name: string }) {
  return (
    <a
      href={`#user-${encodeURIComponent(name.replace(/^@/, ""))}`}
      className="font-medium text-indigo-400 underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
    >
      {name}
    </a>
  )
}

function DragHandle({
  title,
  onKeyDown,
}: {
  title: string
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className="cursor-grab text-muted-foreground/70 hover:bg-transparent hover:text-foreground active:cursor-grabbing"
      aria-label={`Reorder ${title}`}
      title={`Reorder ${title}`}
      onKeyDown={onKeyDown}
    >
      <GripVertical />
    </Button>
  )
}

function QueueMeta({
  item,
  dimmed = false,
}: {
  item: PrototypeQueueItem
  dimmed?: boolean
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 text-sm text-muted-foreground",
        dimmed && "opacity-70"
      )}
    >
      <span>{item.platform}</span>
      <span aria-hidden="true">•</span>
      <Contributor name={item.addedBy} />
    </div>
  )
}

function HistoryRow({
  item,
  index,
  onDragStart,
}: {
  item: PrototypeQueueItem
  index: number
  onDragStart: (event: React.DragEvent, source: string) => void
}) {
  return (
    <div
      data-testid="history-row"
      draggable
      onDragStart={(event) => onDragStart(event, `history:${index}`)}
      className="grid min-h-16 grid-cols-[32px_minmax(0,1fr)_minmax(180px,280px)_96px] items-center gap-3 border-b border-border/60 px-3 py-2 opacity-55 last:border-b-0"
    >
      <DragHandle title={item.title} />
      <div className="min-w-0 truncate text-base font-medium">{item.title}</div>
      <QueueMeta item={item} dimmed />
      <span className="justify-self-end text-base tabular-nums text-muted-foreground">
        {formatTime(item.durationSeconds)}
      </span>
    </div>
  )
}

function UpcomingRow({
  item,
  index,
  onMove,
  onDragStart,
  onDropSource,
}: {
  item: PrototypeQueueItem
  index: number
  onMove: (from: number, to: number) => void
  onDragStart: (event: React.DragEvent, source: string) => void
  onDropSource: (source: string, targetIndex: number) => void
}) {
  const [dragging, setDragging] = React.useState(false)

  return (
    <div
      data-testid="upcoming-row"
      draggable
      onDragStart={(event) => {
        setDragging(true)
        onDragStart(event, `upcoming:${index}`)
      }}
      onDragEnd={() => setDragging(false)}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
      }}
      onDrop={(event) => {
        event.preventDefault()
        onDropSource(event.dataTransfer.getData("text/plain"), index)
      }}
      className={cn(
        "grid min-h-16 grid-cols-[32px_minmax(0,1fr)_minmax(180px,280px)_96px] items-center gap-3 border-b border-border/60 px-3 py-2 transition-colors hover:bg-accent/25 last:border-b-0",
        dragging && "opacity-45"
      )}
    >
      <DragHandle
        title={item.title}
        onKeyDown={(event) => {
          if (!event.altKey) return
          if (event.key === "ArrowUp") {
            event.preventDefault()
            onMove(index, index - 1)
          }
          if (event.key === "ArrowDown") {
            event.preventDefault()
            onMove(index, index + 1)
          }
        }}
      />
      <div className="min-w-0 truncate text-base font-medium">{item.title}</div>
      <QueueMeta item={item} />
      <span className="justify-self-end text-base tabular-nums text-muted-foreground">
        {formatTime(item.durationSeconds)}
      </span>
    </div>
  )
}

function CurrentCard({
  item,
  elapsed,
  isPlaying,
  onTogglePlaying,
  onSkipUp,
  onSkipDown,
}: {
  item: PrototypeQueueItem
  elapsed: number
  isPlaying: boolean
  onTogglePlaying: () => void
  onSkipUp: () => void
  onSkipDown: () => void
}) {
  const duration = item.durationSeconds ?? 0
  const hasDuration = duration > 0
  const progress = hasDuration
    ? Math.min(100, Math.max(0, (elapsed / duration) * 100))
    : 0

  return (
    <Card
      data-testid="current-row"
      className="gap-0 rounded-xl bg-card py-0 ring-1 ring-foreground/15"
    >
      <CardContent className="grid min-h-44 grid-cols-[44px_minmax(0,1fr)_104px] gap-0 p-0">
        <div className="flex items-start justify-center pt-6">
          <DragHandle title={item.title} />
        </div>

        <div className="min-w-0 px-1 py-6 pr-6">
          <div className="truncate text-xl font-semibold tracking-tight">
            {item.title}
          </div>
          <div className="mt-2">
            <QueueMeta item={item} />
          </div>

          <div className="mt-8 grid grid-cols-[64px_minmax(0,1fr)_84px] items-center gap-3">
            <span className="text-base tabular-nums text-muted-foreground">
              {hasDuration ? formatTime(elapsed) : "LIVE"}
            </span>

            <div
              className="relative h-10"
              role="slider"
              tabIndex={hasDuration ? 0 : -1}
              aria-label="Playback position"
              aria-valuemin={0}
              aria-valuemax={hasDuration ? duration : 0}
              aria-valuenow={hasDuration ? Math.min(duration, elapsed) : 0}
            >
              <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-muted">
                {hasDuration ? (
                  <div
                    className="h-full rounded-full bg-indigo-400"
                    style={{ width: `${progress}%` }}
                  />
                ) : null}
              </div>

              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-ring bg-card shadow-sm hover:bg-accent"
                style={{ left: hasDuration ? `${progress}%` : "50%" }}
                aria-label={isPlaying ? "Pause" : "Play"}
                title={isPlaying ? "Pause" : "Play"}
                onClick={onTogglePlaying}
              >
                {isPlaying ? <Pause /> : <Play />}
              </Button>
            </div>

            <span className="justify-self-end text-base tabular-nums text-muted-foreground">
              {hasDuration ? formatTime(duration) : "LIVE"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-l border-border/70 px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Skip up"
            title="Skip up"
            onClick={onSkipUp}
          >
            <ChevronUp />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Skip down"
            title="Skip down"
            onClick={onSkipDown}
          >
            <ChevronDown />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function normalizeSetlist(fileName: string, value: unknown): PendingSetlist {
  if (!value || typeof value !== "object") {
    throw new Error("That file is not a setlist object.")
  }

  const record = value as { name?: unknown; segments?: unknown }
  if (!Array.isArray(record.segments) || record.segments.length === 0) {
    throw new Error("A setlist needs at least one segment.")
  }

  const sourceSegments = record.segments.slice(0, SETLIST_LIMIT) as SetlistSegment[]
  const items = sourceSegments.flatMap((segment, index) => {
    if (typeof segment.url !== "string" || !isSafeHttpUrl(segment.url)) return []

    const durationMinutes =
      typeof segment.duration === "number" && Number.isFinite(segment.duration)
        ? Math.max(1, Math.min(segment.duration, 480))
        : 30

    return [
      {
        id: `upload-${Date.now()}-${index}`,
        title:
          typeof segment.title === "string" && segment.title.trim()
            ? segment.title.trim()
            : "Untitled",
        url: segment.url,
        platform:
          typeof segment.platform === "string" && segment.platform.trim()
            ? segment.platform.trim()
            : providerFromUrl(segment.url),
        addedBy: "@you",
        durationSeconds: Math.round(durationMinutes * 60),
      } satisfies PrototypeQueueItem,
    ]
  })

  if (items.length === 0) {
    throw new Error("No safe http(s) segments were found in that setlist.")
  }

  return {
    name:
      typeof record.name === "string" && record.name.trim()
        ? record.name.trim()
        : fileName,
    items,
    dropped: record.segments.length - items.length,
  }
}

export function MqsPrototype() {
  const [played, setPlayed] = React.useState(INITIAL_PLAYED)
  const [current, setCurrent] = React.useState<PrototypeQueueItem | null>(
    INITIAL_CURRENT
  )
  const [upcoming, setUpcoming] = React.useState(INITIAL_UPCOMING)
  const [elapsed, setElapsed] = React.useState(1938)
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [url, setUrl] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pendingSetlist, setPendingSetlist] = React.useState<PendingSetlist | null>(
    null
  )
  const [stopOpen, setStopOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!isPlaying || !current?.durationSeconds) return

    const timer = window.setInterval(() => {
      setElapsed((value) =>
        Math.min(current.durationSeconds ?? value, value + 1)
      )
    }, 1000)

    return () => window.clearInterval(timer)
  }, [current, isPlaying])

  function moveUpcoming(from: number, to: number) {
    if (
      from < 0 ||
      to < 0 ||
      from >= upcoming.length ||
      to >= upcoming.length ||
      from === to
    ) {
      return
    }

    setUpcoming((items) => {
      const next = [...items]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  function insertHistory(index: number, targetIndex: number) {
    const item = played[index]
    if (!item) return

    setPlayed((items) => items.filter((_, itemIndex) => itemIndex !== index))
    setUpcoming((items) => {
      const next = [...items]
      const safeTarget = Math.max(0, Math.min(targetIndex, next.length))
      next.splice(safeTarget, 0, item)
      return next
    })
  }

  function handleDragStart(event: React.DragEvent, source: string) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", source)
  }

  function handleDropSource(source: string, targetIndex: number) {
    const [kind, rawIndex] = source.split(":")
    const sourceIndex = Number(rawIndex)
    if (!Number.isInteger(sourceIndex)) return

    if (kind === "upcoming") {
      moveUpcoming(sourceIndex, targetIndex)
      return
    }

    if (kind === "history") {
      insertHistory(sourceIndex, targetIndex)
    }
  }

  function skipDown() {
    if (!current || upcoming.length === 0) return
    const [next, ...rest] = upcoming
    setPlayed((items) => [...items, current].slice(-HISTORY_LIMIT))
    setCurrent(next)
    setUpcoming(rest)
    setElapsed(0)
    setIsPlaying(true)
  }

  function skipUp() {
    const previous = played.at(-1)
    if (!previous) return

    setPlayed((items) => items.slice(0, -1))
    if (current) {
      setUpcoming((items) => [current, ...items])
    }
    setCurrent(previous)
    setElapsed(0)
    setIsPlaying(true)
  }

  function addUrl(mode: "tail" | "next") {
    const trimmed = url.trim()
    if (!trimmed) return
    if (!isSafeHttpUrl(trimmed)) {
      setError("Use a valid http(s) media URL.")
      return
    }

    const item: PrototypeQueueItem = {
      id: `url-${Date.now()}`,
      title: trimmed,
      url: trimmed,
      platform: providerFromUrl(trimmed),
      addedBy: "@you",
    }

    setUpcoming((items) => (mode === "next" ? [item, ...items] : [...items, item]))
    setUrl("")
    setError(null)
  }

  async function readSetlist(file: File) {
    try {
      const value = JSON.parse(await file.text()) as unknown
      setPendingSetlist(normalizeSetlist(file.name, value))
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read setlist.")
    }
  }

  function replaceWithSetlist() {
    if (!pendingSetlist || pendingSetlist.items.length === 0) return
    const [nextCurrent, ...nextUpcoming] = pendingSetlist.items
    setPlayed([])
    setCurrent(nextCurrent)
    setUpcoming(nextUpcoming)
    setElapsed(0)
    setIsPlaying(false)
    setPendingSetlist(null)
  }

  function stopAndClear() {
    setPlayed([])
    setCurrent(null)
    setUpcoming([])
    setElapsed(0)
    setIsPlaying(false)
    setStopOpen(false)
  }

  return (
    <main className="dark min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-10">
      <Card className="mx-auto w-full max-w-[1028px] gap-0 overflow-hidden rounded-3xl bg-card py-0 shadow-2xl ring-1 ring-foreground/15">
        <CardHeader className="flex min-h-24 flex-row items-center justify-between border-b px-8 py-6">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Rooftop
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Expand queue"
            title="Expand queue"
          >
            <Maximize2 />
          </Button>
        </CardHeader>

        <section className="border-b px-8 py-7" aria-labelledby="last-played-title">
          <h2
            id="last-played-title"
            className="mb-4 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase"
          >
            Last Played
          </h2>
          <Card className="gap-0 rounded-xl bg-card py-0 ring-1 ring-foreground/10">
            {played.map((item, index) => (
              <HistoryRow
                key={item.id}
                item={item}
                index={index}
                onDragStart={handleDragStart}
              />
            ))}
          </Card>
        </section>

        <section className="border-b px-8 py-7" aria-labelledby="now-playing-title">
          <h2
            id="now-playing-title"
            className="mb-4 text-sm font-semibold tracking-[0.08em] uppercase"
          >
            Now Playing
          </h2>
          {current ? (
            <CurrentCard
              item={current}
              elapsed={elapsed}
              isPlaying={isPlaying}
              onTogglePlaying={() => setIsPlaying((value) => !value)}
              onSkipUp={skipUp}
              onSkipDown={skipDown}
            />
          ) : (
            <Card className="rounded-xl bg-card py-8 text-center text-muted-foreground ring-1 ring-foreground/10">
              Nothing is playing.
            </Card>
          )}
        </section>

        <section className="border-b px-8 py-7" aria-labelledby="up-next-title">
          <h2
            id="up-next-title"
            className="mb-4 text-sm font-semibold tracking-[0.08em] uppercase"
          >
            Up Next
          </h2>
          <Card className="gap-0 rounded-xl bg-card py-0 ring-1 ring-foreground/10">
            {upcoming.length > 0 ? (
              upcoming.map((item, index) => (
                <UpcomingRow
                  key={item.id}
                  item={item}
                  index={index}
                  onMove={moveUpcoming}
                  onDragStart={handleDragStart}
                  onDropSource={handleDropSource}
                />
              ))
            ) : (
              <CardContent className="py-7 text-center text-sm text-muted-foreground">
                Nothing queued.
              </CardContent>
            )}
          </Card>
        </section>

        <div className="flex items-center gap-4 px-8 py-7">
          <div className="relative min-w-0 flex-1">
            <Link2
              className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={url}
              onChange={(event) => {
                setUrl(event.target.value)
                setError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  addUrl("tail")
                }
              }}
              aria-label="Media URL"
              placeholder="Paste YouTube or Twitch URL"
              className="h-14 rounded-lg bg-transparent pl-12 text-base"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="size-14 rounded-lg"
                aria-label="Queue actions"
              >
                <MoreVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                disabled={!url.trim()}
                onSelect={() => addUrl("tail")}
              >
                Add pasted URL
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!url.trim()}
                onSelect={() => addUrl("next")}
              >
                Play pasted URL next
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => fileInputRef.current?.click()}>
                <Upload />
                Upload setlist
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={upcoming.length < 2}
                onSelect={() =>
                  setUpcoming((items) => [...items].sort(() => Math.random() - 0.5))
                }
              >
                <Shuffle />
                Shuffle upcoming
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={upcoming.length === 0}
                onSelect={() => setUpcoming([])}
              >
                <Trash2 />
                Clear upcoming
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={!current && upcoming.length === 0 && played.length === 0}
                onSelect={() => setStopOpen(true)}
              >
                <Trash2 />
                Stop & clear all
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Setlist JSON file"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void readSetlist(file)
              event.currentTarget.value = ""
            }}
          />
        </div>

        {error ? (
          <p role="alert" className="px-8 pb-6 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </Card>

      <Dialog
        open={Boolean(pendingSetlist)}
        onOpenChange={(open) => {
          if (!open) setPendingSetlist(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load setlist</DialogTitle>
            <DialogDescription>
              {pendingSetlist
                ? `${pendingSetlist.items.length} valid segments · ${pendingSetlist.dropped} invalid or capped`
                : "Review the setlist before replacing the queue."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingSetlist(null)}>
              Cancel
            </Button>
            <Button onClick={replaceWithSetlist}>Replace queue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stopOpen} onOpenChange={setStopOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop and clear MQS?</DialogTitle>
            <DialogDescription>
              This stops playback and clears played, current, and upcoming items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStopOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={stopAndClear}>
              Stop & clear all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default MqsPrototype
