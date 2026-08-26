import * as React from "react"
import {
  GripVertical,
  MoreHorizontal,
  Pause,
  Play,
  Shuffle,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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
  thumbnail?: string
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
    id: "played-wake-me-up",
    title: "Wake Me Up When September Ends",
    url: "https://www.youtube.com/watch?v=NU9JoFKlaZ0",
    platform: "YouTube",
    addedBy: "@Vic",
    durationSeconds: 286,
    thumbnail: "https://i.ytimg.com/vi/NU9JoFKlaZ0/mqdefault.jpg",
  },
  {
    id: "played-smells-like-teen-spirit",
    title: "Smells Like Teen Spirit",
    url: "https://www.youtube.com/watch?v=hTWKbfoikeg",
    platform: "YouTube",
    addedBy: "@Mira",
    durationSeconds: 301,
    thumbnail: "https://i.ytimg.com/vi/hTWKbfoikeg/mqdefault.jpg",
  },
  {
    id: "played-numb",
    title: "Numb",
    url: "https://www.youtube.com/watch?v=kXYiU_JCYtU",
    platform: "YouTube",
    addedBy: "@DJ Kai",
    durationSeconds: 187,
    thumbnail: "https://i.ytimg.com/vi/kXYiU_JCYtU/mqdefault.jpg",
  },
]

const INITIAL_CURRENT: PrototypeQueueItem = {
  id: "current-everlong",
  title: "Everlong (Live at the Fuji Rock Festival)",
  url: "https://www.youtube.com/watch?v=eBG7P-K-r1Y",
  platform: "YouTube",
  addedBy: "@DJ Kai",
  durationSeconds: 250,
  thumbnail: "https://i.ytimg.com/vi/eBG7P-K-r1Y/mqdefault.jpg",
}

const INITIAL_UPCOMING: PrototypeQueueItem[] = [
  {
    id: "upcoming-pretender",
    title: "The Pretender",
    url: "https://www.youtube.com/watch?v=SBjQ9tuuTJQ",
    platform: "YouTube",
    addedBy: "@DJ Kai",
    durationSeconds: 269,
    thumbnail: "https://i.ytimg.com/vi/SBjQ9tuuTJQ/mqdefault.jpg",
  },
  {
    id: "upcoming-sabotage",
    title: "Sabotage",
    url: "https://www.youtube.com/watch?v=z5rRZdiu1UE",
    platform: "YouTube",
    addedBy: "@Mira",
    durationSeconds: 178,
    thumbnail: "https://i.ytimg.com/vi/z5rRZdiu1UE/mqdefault.jpg",
  },
  {
    id: "upcoming-byob",
    title: "B.Y.O.B.",
    url: "https://www.youtube.com/watch?v=zUzd9KyIDrM",
    platform: "YouTube",
    addedBy: "@Vic",
    durationSeconds: 255,
    thumbnail: "https://i.ytimg.com/vi/zUzd9KyIDrM/mqdefault.jpg",
  },
  {
    id: "upcoming-killing",
    title: "Killing In The Name",
    url: "https://www.youtube.com/watch?v=bWXazVhlyxQ",
    platform: "YouTube",
    addedBy: "@DJ Kai",
    durationSeconds: 313,
    thumbnail: "https://i.ytimg.com/vi/bWXazVhlyxQ/mqdefault.jpg",
  },
  {
    id: "upcoming-uprising",
    title: "Uprising",
    url: "https://www.youtube.com/watch?v=w8KQmps-Sog",
    platform: "YouTube",
    addedBy: "@Mira",
    durationSeconds: 303,
    thumbnail: "https://i.ytimg.com/vi/w8KQmps-Sog/mqdefault.jpg",
  },
]

function formatTime(seconds?: number) {
  if (!Number.isFinite(seconds) || seconds === undefined) return "LIVE"
  const safe = Math.max(0, Math.floor(seconds))
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`
}

function providerFromUrl(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "")
    if (host.includes("youtube") || host === "youtu.be") return "YouTube"
    if (host.includes("twitch")) return "Twitch"
    if (host.includes("kick")) return "Kick"
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

function Thumbnail({
  item,
  size = "row",
  dimmed = false,
}: {
  item: PrototypeQueueItem
  size?: "row" | "current"
  dimmed?: boolean
}) {
  const [failed, setFailed] = React.useState(false)
  const dimensions = size === "current" ? "size-12" : "size-9"

  if (!item.thumbnail || failed) {
    return (
      <div
        className={cn(
          dimensions,
          "grid shrink-0 place-items-center rounded-md border border-border bg-muted text-[10px] font-semibold text-muted-foreground",
          dimmed && "opacity-50"
        )}
        aria-hidden="true"
      >
        {item.platform.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={item.thumbnail}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn(
        dimensions,
        "shrink-0 rounded-md border border-border object-cover",
        dimmed && "opacity-45 grayscale"
      )}
    />
  )
}

function HistoryRow({ item }: { item: PrototypeQueueItem }) {
  return (
    <div
      data-testid="history-row"
      className="flex min-h-12 items-center gap-2 border-b border-border/50 px-2.5 py-1.5 opacity-45"
    >
      <div className="w-4 shrink-0" aria-hidden="true" />
      <Thumbnail item={item} dimmed />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium">{item.title}</div>
        <div className="mt-0.5 truncate text-[10px] leading-3.5 text-muted-foreground">
          {item.platform} · added by {item.addedBy}
        </div>
      </div>
      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
        {formatTime(item.durationSeconds)}
      </span>
    </div>
  )
}

function CurrentRow({
  item,
  elapsed,
  isPlaying,
  isMuted,
  onTogglePlaying,
  onToggleMute,
  currentRef,
}: {
  item: PrototypeQueueItem
  elapsed: number
  isPlaying: boolean
  isMuted: boolean
  onTogglePlaying: () => void
  onToggleMute: () => void
  currentRef: React.RefObject<HTMLDivElement | null>
}) {
  const hasDuration = Boolean(item.durationSeconds && item.durationSeconds > 0)
  const duration = item.durationSeconds ?? 0
  const progress = hasDuration
    ? Math.min(100, Math.max(0, (elapsed / duration) * 100))
    : 0

  return (
    <div
      ref={currentRef}
      data-testid="current-row"
      className="mx-2 my-1.5 rounded-lg border border-primary/55 bg-primary/[0.07] p-2 shadow-[0_0_0_1px_hsl(var(--primary)/0.06)]"
    >
      <div className="flex min-w-0 items-center gap-2">
        <Thumbnail item={item} size="current" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-semibold">{item.title}</div>
          <div className="mt-0.5 truncate text-[10px] leading-3.5 text-muted-foreground">
            {item.platform} · added by {item.addedBy}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="w-7 shrink-0 text-right text-[9px] tabular-nums text-muted-foreground">
          {hasDuration ? formatTime(elapsed) : "LIVE"}
        </span>
        <div
          className="relative h-7 min-w-0 flex-1"
          aria-label={
            hasDuration
              ? `${formatTime(elapsed)} elapsed of ${formatTime(duration)}`
              : "Live playback"
          }
        >
          <div className="absolute top-1/2 right-0 left-0 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-muted">
            {hasDuration ? (
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${progress}%` }}
              />
            ) : null}
          </div>
          <Button
            type="button"
            size="icon-xs"
            className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm"
            style={{ left: hasDuration ? `${progress}%` : "50%" }}
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlaying}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
        </div>
        <span className="w-7 shrink-0 text-[9px] tabular-nums text-muted-foreground">
          {hasDuration ? formatTime(duration) : "LIVE"}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute" : "Mute"}
          onClick={onToggleMute}
        >
          {isMuted ? <VolumeX /> : <Volume2 />}
        </Button>
      </div>
    </div>
  )
}

function UpcomingRow({
  item,
  index,
  onMove,
}: {
  item: PrototypeQueueItem
  index: number
  onMove: (from: number, to: number) => void
}) {
  const [dragging, setDragging] = React.useState(false)

  return (
    <div
      data-testid="upcoming-row"
      draggable
      onDragStart={(event) => {
        setDragging(true)
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", String(index))
      }}
      onDragEnd={() => setDragging(false)}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
      }}
      onDrop={(event) => {
        event.preventDefault()
        const from = Number(event.dataTransfer.getData("text/plain"))
        if (Number.isInteger(from)) onMove(from, index)
      }}
      className={cn(
        "flex min-h-12 items-center gap-2 border-b border-border/50 px-2.5 py-1.5 transition-colors hover:bg-accent/35",
        dragging && "opacity-45"
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        aria-label={`Reorder ${item.title}. Hold Alt and use arrow keys for keyboard reordering.`}
        title="Drag to reorder · Alt+↑/↓ on keyboard"
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
      >
        <GripVertical />
      </Button>
      <Thumbnail item={item} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium">{item.title}</div>
        <div className="mt-0.5 truncate text-[10px] leading-3.5 text-muted-foreground">
          {item.platform} · added by {item.addedBy}
        </div>
      </div>
      <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
        {formatTime(item.durationSeconds)}
      </span>
    </div>
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
        addedBy: "@You",
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
  const [elapsed, setElapsed] = React.useState(72)
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [isMuted, setIsMuted] = React.useState(false)
  const [url, setUrl] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [stopOpen, setStopOpen] = React.useState(false)
  const [pendingSetlist, setPendingSetlist] = React.useState<PendingSetlist | null>(
    null
  )
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const currentRef = React.useRef<HTMLDivElement>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  React.useLayoutEffect(() => {
    const viewport = viewportRef.current
    const currentElement = currentRef.current
    if (!viewport || !currentElement) return

    const frame = window.requestAnimationFrame(() => {
      viewport.scrollTop = Math.max(0, currentElement.offsetTop - 6)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [current?.id])

  React.useEffect(() => {
    if (!current || !isPlaying) return

    const timer = window.setInterval(() => {
      setElapsed((value) => {
        if (!current.durationSeconds) return value + 1
        return Math.min(current.durationSeconds, value + 1)
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [current, isPlaying])

  const moveUpcoming = React.useCallback((from: number, to: number) => {
    setUpcoming((items) => {
      if (
        from === to ||
        from < 0 ||
        to < 0 ||
        from >= items.length ||
        to >= items.length
      ) {
        return items
      }
      const next = [...items]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }, [])

  const addUrl = React.useCallback(() => {
    const value = url.trim()
    if (!value) return
    if (!isSafeHttpUrl(value)) {
      setMessage("Use a valid http(s) media URL.")
      return
    }

    const nextItem: PrototypeQueueItem = {
      id: `manual-${Date.now()}`,
      title: value,
      url: value,
      platform: providerFromUrl(value),
      addedBy: "@You",
    }

    if (!current) {
      setCurrent(nextItem)
      setElapsed(0)
      setIsPlaying(true)
    } else {
      setUpcoming((items) => [...items, nextItem])
    }

    setUrl("")
    setMessage("Added to queue.")
  }, [current, url])

  const applySetlist = React.useCallback(() => {
    if (!pendingSetlist) return
    const [first, ...rest] = pendingSetlist.items
    setPlayed([])
    setCurrent(first ?? null)
    setUpcoming(rest)
    setElapsed(0)
    setIsPlaying(false)
    setPendingSetlist(null)
    setMessage(
      `Loaded ${pendingSetlist.items.length} segment${pendingSetlist.items.length === 1 ? "" : "s"}. Playback is paused.`
    )
  }, [pendingSetlist])

  return (
    <main className="grid min-h-svh place-items-center bg-[#181a1f] p-3 text-foreground">
      <section
        aria-label="MQS queue prototype"
        className="flex h-[min(430px,calc(100svh-24px))] w-[300px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-xl border border-border bg-[#24262b] shadow-2xl"
      >
        <header className="flex h-11 shrink-0 items-center border-b border-border px-2.5">
          <span className="text-sm font-semibold tracking-tight">MQS</span>
          <div className="ml-auto flex items-center gap-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Queue actions"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  disabled={upcoming.length < 2}
                  onSelect={() => {
                    setUpcoming((items) => [...items].sort(() => Math.random() - 0.5))
                    setMessage("Upcoming queue shuffled.")
                  }}
                >
                  <Shuffle /> Shuffle upcoming
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={upcoming.length === 0}
                  onSelect={() => {
                    setUpcoming([])
                    setMessage("Upcoming queue cleared. Current media is unchanged.")
                  }}
                >
                  <Trash2 /> Clear upcoming
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={!current && upcoming.length === 0}
                  onSelect={() => setStopOpen(true)}
                >
                  <Trash2 /> Stop & clear all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Close prototype"
              title="Back to Hubzz UI"
              onClick={() => {
                window.location.href = window.location.pathname
              }}
            >
              <X />
            </Button>
          </div>
        </header>

        <div
          ref={viewportRef}
          data-testid="queue-scroll-area"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="relative min-h-full">
            {played.slice(-HISTORY_LIMIT).map((item) => (
              <HistoryRow key={item.id} item={item} />
            ))}

            {current ? (
              <CurrentRow
                item={current}
                elapsed={elapsed}
                isPlaying={isPlaying}
                isMuted={isMuted}
                onTogglePlaying={() => setIsPlaying((value) => !value)}
                onToggleMute={() => setIsMuted((value) => !value)}
                currentRef={currentRef}
              />
            ) : (
              <div
                ref={currentRef}
                data-testid="empty-current"
                className="flex min-h-28 items-center justify-center px-5 text-center text-xs text-muted-foreground"
              >
                Nothing is playing. Add a URL or load a setlist below.
              </div>
            )}

            {upcoming.map((item, index) => (
              <UpcomingRow
                key={item.id}
                item={item}
                index={index}
                onMove={moveUpcoming}
              />
            ))}

            {current && upcoming.length === 0 ? (
              <div className="px-4 py-5 text-center text-[11px] text-muted-foreground">
                End of queue
              </div>
            ) : null}
          </div>
        </div>

        <form
          className="shrink-0 border-t border-border p-2"
          onSubmit={(event) => {
            event.preventDefault()
            addUrl()
          }}
        >
          <div className="flex items-center gap-1.5">
            <Input
              aria-label="Media URL"
              type="url"
              inputMode="url"
              placeholder="Paste media URL…"
              value={url}
              onChange={(event) => {
                setUrl(event.target.value)
                if (message) setMessage("")
              }}
              aria-invalid={Boolean(url.trim()) && !isSafeHttpUrl(url.trim())}
              className="min-w-0 flex-1"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Add to queue"
              title="Add to queue"
              disabled={!url.trim()}
            >
              <span className="text-xl leading-none" aria-hidden="true">
                +
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Upload setlist"
              title="Upload setlist"
              onClick={() => fileRef.current?.click()}
            >
              <Upload />
            </Button>
            <input
              ref={fileRef}
              className="sr-only"
              type="file"
              accept="application/json,.json"
              aria-label="Setlist JSON file"
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0]
                event.currentTarget.value = ""
                if (!file) return
                try {
                  const parsed = JSON.parse(await file.text()) as unknown
                  const next = normalizeSetlist(file.name, parsed)
                  setPendingSetlist(next)
                  setMessage("")
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "That file could not be read."
                  )
                }
              }}
            />
          </div>
          <p
            className={cn(
              "mt-1 min-h-3 truncate px-0.5 text-[9px]",
              message.includes("valid") || message.includes("not") || message.includes("needs")
                ? "text-destructive"
                : "text-muted-foreground"
            )}
            aria-live="polite"
          >
            {message}
          </p>
        </form>
      </section>

      <Dialog open={Boolean(pendingSetlist)} onOpenChange={(open) => !open && setPendingSetlist(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load setlist</DialogTitle>
            <DialogDescription>
              This prototype mirrors the current replace-only handoff: loading a setlist replaces the queue and leaves playback paused on its first valid segment.
            </DialogDescription>
          </DialogHeader>
          {pendingSetlist ? (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <div className="font-medium">{pendingSetlist.name}</div>
              <div className="mt-1 text-muted-foreground">
                {pendingSetlist.items.length} valid segment{pendingSetlist.items.length === 1 ? "" : "s"}
                {pendingSetlist.dropped > 0
                  ? ` · ${pendingSetlist.dropped} invalid or capped`
                  : ""}
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingSetlist(null)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={applySetlist}>
              Replace queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stopOpen} onOpenChange={setStopOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop and clear MQS?</DialogTitle>
            <DialogDescription>
              This clears the current item, the last three played items, and everything upcoming.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setStopOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setPlayed([])
                setCurrent(null)
                setUpcoming([])
                setElapsed(0)
                setIsPlaying(false)
                setStopOpen(false)
                setMessage("Queue stopped and cleared.")
              }}
            >
              Stop & clear all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

export default MqsPrototype
