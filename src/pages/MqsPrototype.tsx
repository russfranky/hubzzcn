import * as React from "react"
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Headphones,
  Link2,
  MoreVertical,
  X,
  Pause,
  Play,
  Send,
  Shuffle,
  SkipForward,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  WifiOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

type QueueItem = {
  id: string
  title: string
  url: string
  platform: string
  addedBy: string
  durationSeconds?: number
  looping?: boolean
}

type SetlistSegment = {
  title?: unknown
  type?: unknown
  url?: unknown
  platform?: unknown
  duration?: unknown
}

type PendingSetlist = {
  data: unknown
  fileName: string
  count: number
  totalMinutes: number
  cappedCount: number
}

type DraggedMedia = {
  kind: "history" | "upcoming"
  index: number
  title: string
}

const HISTORY_LIMIT = 3
const SETLIST_LIMIT = 500
const LOOP_HOLD_MS = 600
const LOOP_MOVE_TOLERANCE_PX = 12

const INITIAL_PLAYED: QueueItem[] = [
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

const INITIAL_CURRENT: QueueItem = {
  id: "current-tomorrowland",
  title: "Tomorrowland 2026 Mainstage W1",
  url: "https://www.youtube.com/watch?v=tomorrowland-2026",
  platform: "YouTube",
  addedBy: "@dan",
  durationSeconds: 4542,
}

const INITIAL_UPCOMING: QueueItem[] = [
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

function normalizeMediaUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const candidate =
    trimmed.startsWith("https://") || trimmed.startsWith("http://")
      ? trimmed
      : /^[a-zA-Z0-9]/.test(trimmed) &&
          trimmed.includes(".") &&
          !trimmed.includes(" ")
        ? `https://${trimmed}`
        : null

  if (!candidate) return null

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null
    return parsed.href
  } catch {
    return null
  }
}

function providerFromUrl(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "")
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be"
    ) {
      return "YouTube"
    }
    if (host === "twitch.tv") return "Twitch"
    if (host === "kick.com") return "Kick"
    return "Website"
  } catch {
    return "Website"
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

function playRemovalPoof(target: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const rect = target.getBoundingClientRect()
  const origin = document.createElement("span")
  origin.dataset.mqsPoofOrigin = "true"
  Object.assign(origin.style, {
    position: "fixed",
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top + rect.height / 2}px`,
    width: "0px",
    height: "0px",
    pointerEvents: "none",
    zIndex: "9999",
  })
  document.body.appendChild(origin)

  const particles = [
    [-36, 0, 11],
    [-28, -25, 13],
    [0, -34, 15],
    [28, -25, 12],
    [36, 0, 16],
    [28, 25, 11],
    [0, 34, 14],
    [-28, 25, 13],
    [0, 0, 18],
  ] as const
  let remaining = particles.length

  particles.forEach(([x, y, size], index) => {
    const particle = document.createElement("span")
    particle.dataset.mqsPoof = "true"
    Object.assign(particle.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "9999px",
      background: "rgba(230, 230, 235, 0.42)",
      boxShadow: "0 0 10px rgba(230, 230, 235, 0.16)",
      pointerEvents: "none",
    })
    origin.appendChild(particle)

    const animation = particle.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(0.2)",
          opacity: 0.78,
          filter: "blur(0px)",
        },
        {
          offset: 0.32,
          transform: `translate(calc(-50% + ${x * 0.35}px), calc(-50% + ${y * 0.35}px)) scale(1)`,
          opacity: 0.58,
          filter: "blur(0.5px)",
        },
        {
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.55)`,
          opacity: 0,
          filter: "blur(2.5px)",
        },
      ],
      {
        duration: 420 + index * 12,
        easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
        fill: "forwards",
      }
    )

    const cleanup = () => {
      particle.remove()
      remaining -= 1
      if (remaining === 0) origin.remove()
    }
    animation.onfinish = cleanup
    animation.oncancel = cleanup
  })
}

function Contributor({ name }: { name: string }) {
  return (
    <a
      href={`#user-${encodeURIComponent(name.replace(/^@/, ""))}`}
      className="font-medium text-primary underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none"
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
      className="cursor-grab text-muted-foreground/70 hover:!bg-transparent hover:!text-muted-foreground/70 active:cursor-grabbing"
      aria-label={`Reorder ${title}`}
      title={`Reorder ${title}`}
      onKeyDown={onKeyDown}
    >
      <GripVertical />
    </Button>
  )
}

function QueueMeta({ item, dimmed }: { item: QueueItem; dimmed?: boolean }) {
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
  item: QueueItem
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
      <span className="justify-self-end text-base text-muted-foreground tabular-nums">
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
  item: QueueItem
  index: number
  onMove: (from: number, to: number) => void
  onDragStart: (event: React.DragEvent, source: string) => void
  onDropSource: (source: string, targetIndex: number) => void
}) {
  const [dragging, setDragging] = React.useState(false)
  const [dropInsertionIndex, setDropInsertionIndex] = React.useState<
    number | null
  >(null)

  return (
    <div
      data-testid="upcoming-row"
      data-queue-id={item.id}
      draggable
      onDragStart={(event) => {
        setDragging(true)
        onDragStart(event, `upcoming:${index}`)
      }}
      onDragEnd={() => {
        setDragging(false)
        setDropInsertionIndex(null)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        const rect = event.currentTarget.getBoundingClientRect()
        const after = event.clientY >= rect.top + rect.height / 2
        setDropInsertionIndex(index + (after ? 1 : 0))
      }}
      onDragLeave={(event) => {
        const nextTarget = event.relatedTarget as Node | null
        if (nextTarget && event.currentTarget.contains(nextTarget)) return
        setDropInsertionIndex(null)
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const targetIndex = dropInsertionIndex ?? index
        setDropInsertionIndex(null)
        onDropSource(event.dataTransfer.getData("text/plain"), targetIndex)
      }}
      className={cn(
        "relative grid min-h-16 grid-cols-[32px_minmax(0,1fr)_minmax(180px,280px)_96px] items-center gap-3 border-b border-border/60 px-3 py-2 transition-colors last:border-b-0 hover:bg-accent/25",
        dragging && "opacity-45"
      )}
    >
      {dropInsertionIndex !== null ? (
        <span
          data-testid="queue-drop-indicator"
          data-position={dropInsertionIndex === index ? "before" : "after"}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-3 left-3 z-20 h-0.5 rounded-full bg-primary",
            dropInsertionIndex === index ? "-top-px" : "-bottom-px"
          )}
        />
      ) : null}
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
      <span className="justify-self-end text-base text-muted-foreground tabular-nums">
        {formatTime(item.durationSeconds)}
      </span>
    </div>
  )
}

function CurrentCard({
  item,
  elapsed,
  isPlaying,
  onElapsedChange,
  onTogglePlaying,
  onToggleLooping,
  onSkipUp,
  onSkipDown,
  canSkipUp,
  swapSourceTitle,
  onSwapDragOver,
  onSwapDragLeave,
  onSwapDrop,
}: {
  item: QueueItem
  elapsed: number
  isPlaying: boolean
  onElapsedChange: (value: number) => void
  onTogglePlaying: () => void
  onToggleLooping: (itemId: string) => void
  onSkipUp: () => void
  onSkipDown: () => void
  canSkipUp: boolean
  swapSourceTitle: string | null
  onSwapDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onSwapDragLeave: (event: React.DragEvent<HTMLDivElement>) => void
  onSwapDrop: (event: React.DragEvent<HTMLDivElement>) => void
}) {
  const [scrubSeconds, setScrubSeconds] = React.useState<number | null>(null)
  const loopHoldTimerRef = React.useRef<number | null>(null)
  const loopHoldPointerRef = React.useRef<number | null>(null)
  const loopHoldOriginRef = React.useRef<{ x: number; y: number } | null>(null)
  const loopHoldItemRef = React.useRef<string | null>(null)
  const loopHoldTargetRef = React.useRef<HTMLButtonElement | null>(null)
  const loopHoldCanceledRef = React.useRef(false)
  const suppressPlaybackClickRef = React.useRef(false)
  const latestItemIdRef = React.useRef(item.id)
  const previousItemIdRef = React.useRef(item.id)
  const duration = item.durationSeconds ?? 0
  const hasDuration = duration > 0
  const displayedElapsed = scrubSeconds ?? elapsed
  const progress = hasDuration
    ? Math.min(100, Math.max(0, (displayedElapsed / duration) * 100))
    : 0

  latestItemIdRef.current = item.id

  function clearLoopHold(releasePointer = true) {
    if (loopHoldTimerRef.current !== null) {
      window.clearTimeout(loopHoldTimerRef.current)
      loopHoldTimerRef.current = null
    }

    const target = loopHoldTargetRef.current
    const pointerId = loopHoldPointerRef.current
    if (releasePointer && target && pointerId !== null) {
      try {
        if (target.hasPointerCapture(pointerId)) {
          target.releasePointerCapture(pointerId)
        }
      } catch {
        // Pointer capture can end before React receives the event.
      }
    }

    loopHoldPointerRef.current = null
    loopHoldOriginRef.current = null
    loopHoldItemRef.current = null
    loopHoldTargetRef.current = null
    loopHoldCanceledRef.current = false
  }

  function beginLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return

    clearLoopHold()
    suppressPlaybackClickRef.current = false
    loopHoldPointerRef.current = event.pointerId
    loopHoldOriginRef.current = { x: event.clientX, y: event.clientY }
    loopHoldItemRef.current = item.id
    loopHoldTargetRef.current = event.currentTarget
    loopHoldCanceledRef.current = false

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is optional.
    }

    const pressedItemId = item.id
    loopHoldTimerRef.current = window.setTimeout(() => {
      if (
        loopHoldPointerRef.current !== event.pointerId ||
        loopHoldItemRef.current !== pressedItemId ||
        latestItemIdRef.current !== pressedItemId
      ) {
        return
      }

      loopHoldTimerRef.current = null
      suppressPlaybackClickRef.current = true
      onToggleLooping(pressedItemId)
    }, LOOP_HOLD_MS)
  }

  function moveLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (loopHoldPointerRef.current !== event.pointerId) return
    if (loopHoldCanceledRef.current) return

    const origin = loopHoldOriginRef.current
    if (!origin) return

    const distance = Math.hypot(
      event.clientX - origin.x,
      event.clientY - origin.y
    )
    if (distance <= LOOP_MOVE_TOLERANCE_PX) return

    loopHoldCanceledRef.current = true
    suppressPlaybackClickRef.current = true
    if (loopHoldTimerRef.current !== null) {
      window.clearTimeout(loopHoldTimerRef.current)
      loopHoldTimerRef.current = null
    }
  }

  function endLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (loopHoldPointerRef.current !== event.pointerId) return

    const suppressClick = suppressPlaybackClickRef.current
    clearLoopHold()
    if (suppressClick) {
      window.setTimeout(() => {
        suppressPlaybackClickRef.current = false
      }, 0)
    }
  }

  function cancelLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (loopHoldPointerRef.current !== event.pointerId) return
    suppressPlaybackClickRef.current = false
    clearLoopHold(false)
  }

  function loseLoopPointerCapture(
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (loopHoldPointerRef.current !== event.pointerId) return
    suppressPlaybackClickRef.current = false
    clearLoopHold(false)
  }

  React.useEffect(() => {
    if (previousItemIdRef.current === item.id) return
    previousItemIdRef.current = item.id

    if (loopHoldPointerRef.current === null) return

    loopHoldCanceledRef.current = true
    suppressPlaybackClickRef.current = true
    if (loopHoldTimerRef.current !== null) {
      window.clearTimeout(loopHoldTimerRef.current)
      loopHoldTimerRef.current = null
    }
  }, [item.id])

  React.useEffect(() => {
    return () => {
      if (loopHoldTimerRef.current !== null) {
        window.clearTimeout(loopHoldTimerRef.current)
      }
    }
  }, [])

  function secondsFromPointer(clientX: number, element: HTMLElement) {
    if (!hasDuration) return null
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0) return null
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return Math.round(duration * ratio)
  }

  function beginScrub(event: React.PointerEvent<HTMLDivElement>) {
    const next = secondsFromPointer(event.clientX, event.currentTarget)
    if (next === null) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setScrubSeconds(next)
  }

  function moveScrub(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const next = secondsFromPointer(event.clientX, event.currentTarget)
    if (next !== null) setScrubSeconds(next)
  }

  function endScrub(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const next = secondsFromPointer(event.clientX, event.currentTarget)
    event.currentTarget.releasePointerCapture(event.pointerId)
    setScrubSeconds(null)
    if (next !== null) onElapsedChange(next)
  }

  function cancelScrub(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setScrubSeconds(null)
  }

  return (
    <Card
      data-testid="current-row"
      data-swap-target={swapSourceTitle ? "true" : undefined}
      onDragOver={onSwapDragOver}
      onDragLeave={onSwapDragLeave}
      onDrop={onSwapDrop}
      className={cn(
        "relative gap-0 overflow-hidden rounded-xl bg-card py-0 ring-1 ring-border transition-colors",
        swapSourceTitle && "ring-primary/60"
      )}
    >
      {swapSourceTitle ? (
        <div
          data-testid="current-swap-overlay"
          aria-live="polite"
          className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-card/75 px-8 text-center backdrop-blur-[1px]"
        >
          <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Swap with
          </span>
          <span className="mt-1 max-w-full truncate text-sm font-semibold text-foreground">
            {swapSourceTitle}
          </span>
        </div>
      ) : null}

      <CardContent className="grid min-h-44 grid-cols-[minmax(0,1fr)_104px] gap-0 p-0">
        <div className="min-w-0 px-5 py-6 pr-6">
          <div className="truncate text-xl font-semibold tracking-tight">
            {item.title}
          </div>
          <div className="mt-2">
            <QueueMeta item={item} />
          </div>

          <div data-testid="playback-progress" className="mt-8">
            {hasDuration ? (
              <div
                data-testid="playback-rail"
                className="relative h-10 cursor-ew-resize touch-none"
                role="slider"
                tabIndex={0}
                aria-label="Playback position"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={Math.min(duration, displayedElapsed)}
                aria-valuetext={formatTime(displayedElapsed)}
                onPointerDown={beginScrub}
                onPointerMove={moveScrub}
                onPointerUp={endScrub}
                onPointerCancel={cancelScrub}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault()
                    onElapsedChange(Math.max(0, elapsed - 5))
                  } else if (event.key === "ArrowRight") {
                    event.preventDefault()
                    onElapsedChange(Math.min(duration, elapsed + 5))
                  } else if (event.key === "Home") {
                    event.preventDefault()
                    onElapsedChange(0)
                  } else if (event.key === "End") {
                    event.preventDefault()
                    onElapsedChange(duration)
                  }
                }}
              >
                <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-4 ring-card"
                  style={{ left: `${progress}%` }}
                />
              </div>
            ) : (
              <div
                data-testid="playback-rail"
                className="relative h-10"
                aria-hidden="true"
              >
                <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full bg-muted" />
              </div>
            )}

            <div
              data-testid="playback-times"
              className="mt-1 flex items-center justify-between text-base text-muted-foreground tabular-nums"
            >
              <span data-testid="elapsed-time">
                {hasDuration ? formatTime(displayedElapsed) : "LIVE"}
              </span>
              {hasDuration ? (
                <span data-testid="total-time">{formatTime(duration)}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-l border-border/70 px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Skip up"
            title="Skip up"
            disabled={!canSkipUp}
            onClick={onSkipUp}
          >
            <ChevronUp />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="touch-manipulation rounded-full bg-card"
            data-looping={item.looping ? "true" : "false"}
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
            onPointerDown={beginLoopHold}
            onPointerMove={moveLoopHold}
            onPointerUp={endLoopHold}
            onPointerCancel={cancelLoopHold}
            onLostPointerCapture={loseLoopPointerCapture}
            onContextMenu={(event) => {
              if (loopHoldPointerRef.current !== null) event.preventDefault()
            }}
            onClick={() => {
              if (suppressPlaybackClickRef.current) {
                suppressPlaybackClickRef.current = false
                return
              }
              onTogglePlaying()
            }}
          >
            {isPlaying ? <Pause /> : <Play />}
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

function formatRuntimeMinutes(minutes: number) {
  const rounded = Math.round(minutes)
  if (rounded < 60) return `${rounded}m`
  const hours = Math.floor(rounded / 60)
  const rest = rounded % 60
  return `${hours}h${rest ? ` ${rest}m` : ""}`
}

function inspectSetlist(
  fileName: string,
  value: unknown
): PendingSetlist | null {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : null
  const segments = Array.isArray(record?.segments) ? record.segments : null
  if (!segments || segments.length === 0) return null

  const totalMinutes = segments.reduce((sum, segment) => {
    if (!segment || typeof segment !== "object") return sum
    const duration = Number((segment as Record<string, unknown>).duration)
    return sum + (Number.isFinite(duration) && duration > 0 ? duration : 0)
  }, 0)

  return {
    data: value,
    fileName,
    count: segments.length,
    totalMinutes,
    cappedCount: Math.min(segments.length, SETLIST_LIMIT),
  }
}

function materializeSetlist(value: unknown): QueueItem[] {
  const record =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : null
  if (!Array.isArray(record?.segments)) return []

  return record.segments
    .slice(0, SETLIST_LIMIT)
    .flatMap((rawSegment, index) => {
      if (!rawSegment || typeof rawSegment !== "object") return []
      const segment = rawSegment as SetlistSegment
      const type = typeof segment.type === "string" ? segment.type : ""
      const url = typeof segment.url === "string" ? segment.url : ""

      // Mirror the current engine boundary for this standalone simulation:
      // native rows may omit a URL; every other row needs safe http(s).
      if (type !== "native" && !isSafeHttpUrl(url)) return []

      const durationMinutes = Number(segment.duration)
      const durationSeconds =
        Number.isFinite(durationMinutes) && durationMinutes > 0
          ? Math.round(durationMinutes * 60)
          : undefined
      const platform =
        typeof segment.platform === "string" && segment.platform.trim()
          ? segment.platform.trim()
          : type === "native"
            ? "Native"
            : providerFromUrl(url)

      return [
        {
          id: `upload-${Date.now()}-${index}`,
          title:
            typeof segment.title === "string" && segment.title.trim()
              ? segment.title.trim()
              : "Untitled",
          url,
          platform,
          addedBy: "@you",
          durationSeconds,
        } satisfies QueueItem,
      ]
    })
}

export function MqsPrototype() {
  const connectionState = React.useMemo(() => {
    const state = new URLSearchParams(window.location.search).get(
      "mqsConnection"
    )
    return state === "reconnecting" ? "reconnecting" : "connected"
  }, [])
  const connectionBlocked = connectionState === "reconnecting"

  const [played, setPlayed] = React.useState(INITIAL_PLAYED)
  const [current, setCurrent] = React.useState<QueueItem | null>(
    INITIAL_CURRENT
  )
  const [upcoming, setUpcoming] = React.useState(INITIAL_UPCOMING)
  const [elapsed, setElapsed] = React.useState(1938)
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [windowOpen, setWindowOpen] = React.useState(true)
  const [url, setUrl] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [pendingSetlist, setPendingSetlist] =
    React.useState<PendingSetlist | null>(null)
  const [setlistOpen, setSetlistOpen] = React.useState(false)
  const [setlistError, setSetlistError] = React.useState<string | null>(null)
  const [stopOpen, setStopOpen] = React.useState(false)
  const [localMuted, setLocalMuted] = React.useState(false)
  const [localVolume, setLocalVolume] = React.useState(100)
  const [volumeOpen, setVolumeOpen] = React.useState(false)
  const [volumeDraft, setVolumeDraft] = React.useState(100)
  const [dragSource, setDragSource] = React.useState<string | null>(null)
  const [removeTargetActive, setRemoveTargetActive] = React.useState(false)
  const [inputFocused, setInputFocused] = React.useState(false)
  const [queueTailDropActive, setQueueTailDropActive] = React.useState(false)
  const [currentSwapSource, setCurrentSwapSource] =
    React.useState<DraggedMedia | null>(null)
  const [pendingRevealId, setPendingRevealId] = React.useState<string | null>(
    null
  )
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const removeTargetRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isPlaying || !current?.durationSeconds) return

    const timer = window.setInterval(() => {
      setElapsed((value) => {
        const duration = current.durationSeconds ?? value
        const next = value + 1
        if (current.looping && next >= duration) return 0
        return Math.min(duration, next)
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [current, isPlaying])

  React.useEffect(() => {
    function focusComposer(event: KeyboardEvent) {
      if (
        event.key !== "/" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        document.querySelector('[role="dialog"]')
      ) {
        return
      }

      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }

      const input = document.querySelector<HTMLInputElement>(
        'input[aria-label="Media URL"]'
      )
      if (!input) return

      event.preventDefault()
      input.focus()
    }

    window.addEventListener("keydown", focusComposer)
    return () => window.removeEventListener("keydown", focusComposer)
  }, [])

  React.useEffect(() => {
    if (!pendingRevealId) return

    const frame = window.requestAnimationFrame(() => {
      const row = Array.from(
        document.querySelectorAll<HTMLElement>("[data-queue-id]")
      ).find((element) => element.dataset.queueId === pendingRevealId)

      row?.scrollIntoView({ block: "nearest" })
      setPendingRevealId(null)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pendingRevealId, upcoming])

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

  function moveUpcomingToInsertion(from: number, insertionIndex: number) {
    setUpcoming((items) => {
      if (from < 0 || from >= items.length) return items

      const next = [...items]
      const [moved] = next.splice(from, 1)
      const adjustedIndex = Math.max(
        0,
        Math.min(insertionIndex - (from < insertionIndex ? 1 : 0), next.length)
      )
      next.splice(adjustedIndex, 0, moved)
      return next
    })
  }

  function insertHistory(index: number, targetIndex: number) {
    const item = played[index]
    if (!item) return

    setPendingRevealId(item.id)
    setPlayed((items) => items.filter((_, itemIndex) => itemIndex !== index))
    setUpcoming((items) => {
      const next = [...items]
      next.splice(Math.max(0, Math.min(targetIndex, next.length)), 0, item)
      return next
    })
  }

  function handleDragStart(event: React.DragEvent, source: string) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", source)
    setDragSource(source)
    setRemoveTargetActive(false)
    setQueueTailDropActive(false)
    setCurrentSwapSource(null)
  }

  function draggedMedia(source: string): DraggedMedia | null {
    const [kind, rawIndex] = source.split(":")
    const index = Number(rawIndex)
    if (!Number.isInteger(index)) return null

    if (kind === "history") {
      const item = played[index]
      return item ? { kind, index, title: item.title } : null
    }

    if (kind === "upcoming") {
      const item = upcoming[index]
      return item ? { kind, index, title: item.title } : null
    }

    return null
  }

  function swapDraggedMediaWithCurrent(source: string) {
    if (!current) return
    const dragged = draggedMedia(source)
    if (!dragged) return

    const target =
      dragged.kind === "history"
        ? played[dragged.index]
        : upcoming[dragged.index]
    if (!target) return

    if (dragged.kind === "history") {
      setPlayed((items) => {
        if (!items[dragged.index]) return items
        const next = [...items]
        next[dragged.index] = current
        return next
      })
    } else {
      setUpcoming((items) => {
        if (!items[dragged.index]) return items
        const next = [...items]
        next[dragged.index] = current
        return next
      })
    }

    setCurrent(target)
    setElapsed(0)
    setIsPlaying(true)
    setDragSource(null)
    setRemoveTargetActive(false)
    setQueueTailDropActive(false)
    setCurrentSwapSource(null)
  }

  function handleCurrentSwapDragOver(event: React.DragEvent<HTMLDivElement>) {
    const source = event.dataTransfer.getData("text/plain") || dragSource || ""
    const dragged = draggedMedia(source)
    if (!dragged) return

    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    setCurrentSwapSource(dragged)
  }

  function handleCurrentSwapDragLeave(event: React.DragEvent<HTMLDivElement>) {
    const next = event.relatedTarget as Node | null
    if (next && event.currentTarget.contains(next)) return
    setCurrentSwapSource(null)
  }

  function handleCurrentSwapDrop(event: React.DragEvent<HTMLDivElement>) {
    const source = event.dataTransfer.getData("text/plain") || dragSource || ""
    if (!draggedMedia(source)) return

    event.preventDefault()
    event.stopPropagation()
    swapDraggedMediaWithCurrent(source)
  }

  function removeDraggedSource(source: string) {
    const [kind, rawIndex] = source.split(":")
    const sourceIndex = Number(rawIndex)
    if (!Number.isInteger(sourceIndex)) return false

    if (
      kind === "upcoming" &&
      sourceIndex >= 0 &&
      sourceIndex < upcoming.length
    ) {
      setUpcoming((items) =>
        items.filter((_, itemIndex) => itemIndex !== sourceIndex)
      )
      return true
    }

    if (kind === "history" && sourceIndex >= 0 && sourceIndex < played.length) {
      setPlayed((items) =>
        items.filter((_, itemIndex) => itemIndex !== sourceIndex)
      )
      return true
    }

    return false
  }

  function handleRemoveDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()

    const source = event.dataTransfer.getData("text/plain") || dragSource || ""
    const target = removeTargetRef.current
    const removed = removeDraggedSource(source)

    if (removed && target) playRemovalPoof(target)

    setRemoveTargetActive(false)
    setQueueTailDropActive(false)
    setDragSource(null)
    setCurrentSwapSource(null)
  }

  function handleDropSource(source: string, targetIndex: number) {
    const [kind, rawIndex] = source.split(":")
    const sourceIndex = Number(rawIndex)
    if (!Number.isInteger(sourceIndex)) return

    let handled = false
    if (kind === "upcoming") {
      moveUpcomingToInsertion(sourceIndex, targetIndex)
      handled = true
    }
    if (kind === "history") {
      insertHistory(sourceIndex, targetIndex)
      handled = true
    }

    if (handled) {
      setDragSource(null)
      setRemoveTargetActive(false)
      setQueueTailDropActive(false)
      setCurrentSwapSource(null)
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
    if (current) setUpcoming((items) => [current, ...items])
    setCurrent(previous)
    setElapsed(0)
    setIsPlaying(true)
  }

  function toggleCurrentLoopForItem(itemId: string) {
    setCurrent((item) =>
      item?.id === itemId ? { ...item, looping: !item.looping } : item
    )
  }

  function addUrl(mode: "tail" | "next") {
    const trimmed = url.trim()
    if (!trimmed) {
      setError("Paste a media URL to add it to the queue.")
      return
    }

    const normalizedUrl = normalizeMediaUrl(trimmed)
    if (!normalizedUrl) {
      setError(
        "Invalid URL. Try YouTube, Twitch, Kick, or another http(s) URL."
      )
      return
    }

    const item: QueueItem = {
      id: `url-${Date.now()}`,
      title: normalizedUrl,
      url: normalizedUrl,
      platform: providerFromUrl(normalizedUrl),
      addedBy: "@you",
    }

    setUpcoming((items) =>
      mode === "next" ? [item, ...items] : [...items, item]
    )
    setPendingRevealId(item.id)
    setUrl("")
    setError(null)
    setInputFocused(false)
  }

  async function readSetlist(file: File) {
    let text: string
    try {
      text = await file.text()
    } catch {
      setPendingSetlist(null)
      setSetlistError("The setlist file could not be read.")
      setSetlistOpen(true)
      return
    }

    try {
      const data = JSON.parse(text) as unknown
      const preview = inspectSetlist(file.name, data)
      if (!preview) {
        setPendingSetlist(null)
        setSetlistError("This file does not contain any setlist segments.")
        setSetlistOpen(true)
        return
      }

      setPendingSetlist(preview)
      setSetlistError(null)
      setSetlistOpen(true)
    } catch {
      setPendingSetlist(null)
      setSetlistError("That file is not valid setlist JSON.")
      setSetlistOpen(true)
    }
  }

  function replaceWithSetlist() {
    if (!pendingSetlist) return
    const [nextCurrent, ...nextUpcoming] = materializeSetlist(
      pendingSetlist.data
    )
    setPlayed([])
    setCurrent(nextCurrent ?? null)
    setUpcoming(nextUpcoming)
    setElapsed(0)
    setIsPlaying(Boolean(nextCurrent))
    setPendingSetlist(null)
    setSetlistError(null)
    setSetlistOpen(false)
  }

  function stopAndClear() {
    setPlayed([])
    setCurrent(null)
    setUpcoming([])
    setElapsed(0)
    setIsPlaying(false)
    setStopOpen(false)
  }

  function openLocalVolume() {
    setVolumeDraft(localVolume)
    setVolumeOpen(true)
  }

  function applyLocalVolume() {
    const next = Math.max(0, Math.min(100, Math.round(volumeDraft)))
    setLocalVolume(next)
    setVolumeOpen(false)
  }

  if (!windowOpen) return null

  return (
    <main
      data-testid="mqs-container"
      className="dark flex h-dvh min-h-0 flex-col bg-background px-4 py-6 text-foreground sm:px-8 sm:py-10"
      onDragEnd={() => {
        setDragSource(null)
        setRemoveTargetActive(false)
        setQueueTailDropActive(false)
        setCurrentSwapSource(null)
      }}
    >
      <Card
        data-testid="mqs-modal"
        data-connection-state={connectionState}
        data-local-muted={localMuted ? "true" : "false"}
        data-local-volume={localVolume}
        aria-busy={connectionBlocked || undefined}
        className="relative mx-auto flex min-h-0 w-full max-w-[1028px] flex-1 flex-col gap-0 overflow-hidden rounded-3xl bg-card py-0 shadow-2xl ring-1 ring-border"
      >
        {connectionBlocked ? (
          <div
            data-testid="connection-overlay"
            role="alert"
            aria-live="assertive"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Tab") event.preventDefault()
            }}
            className="absolute inset-0 z-50 flex cursor-default flex-col items-center justify-center bg-background/80 px-6 text-center backdrop-blur-[2px] select-none focus-visible:outline-none"
          >
            <WifiOff
              className="mb-4 size-10 text-muted-foreground"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <p className="text-lg font-semibold text-foreground">
              Connection lost
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Attempting to reconnect…
            </p>
          </div>
        ) : null}

        <CardHeader className="flex min-h-24 flex-row items-center justify-between border-b px-8 py-6">
          <CardTitle className="text-3xl font-semibold tracking-tight">
            Rooftop
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="Close"
            title="Close"
            onClick={() => setWindowOpen(false)}
          >
            <X />
          </Button>
        </CardHeader>

        {played.length > 0 ? (
          <section
            data-testid="last-played-section"
            className="shrink-0 border-b px-8 py-7"
            aria-labelledby="last-played-title"
          >
            <h2
              id="last-played-title"
              className="mb-4 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase"
            >
              Last Played
            </h2>
            <Card className="gap-0 rounded-xl bg-card py-0 ring-1 ring-border">
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
        ) : null}

        <section
          className="shrink-0 border-b px-8 py-7"
          aria-labelledby="now-playing-title"
        >
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
              onElapsedChange={setElapsed}
              onTogglePlaying={() => setIsPlaying((value) => !value)}
              onToggleLooping={toggleCurrentLoopForItem}
              onSkipUp={skipUp}
              onSkipDown={skipDown}
              canSkipUp={played.length > 0}
              swapSourceTitle={currentSwapSource?.title ?? null}
              onSwapDragOver={handleCurrentSwapDragOver}
              onSwapDragLeave={handleCurrentSwapDragLeave}
              onSwapDrop={handleCurrentSwapDrop}
            />
          ) : (
            <Card
              data-testid="empty-current-state"
              className="rounded-xl bg-card py-0 ring-1 ring-border"
            >
              <CardContent className="flex min-h-36 flex-col items-center justify-center px-6 py-7 text-center">
                <span className="mb-3 flex size-12 items-center justify-center rounded-full border border-border bg-secondary">
                  <Headphones
                    className="size-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-base font-semibold text-foreground">
                  Nothing playing
                </span>
                <span className="mt-1 max-w-56 text-sm leading-5 text-muted-foreground">
                  Paste a link below or load a setlist to start.
                </span>
              </CardContent>
            </Card>
          )}
        </section>

        <section
          data-testid="up-next-section"
          className="flex min-h-0 flex-1 flex-col border-b px-8 py-7"
          aria-labelledby="up-next-title"
        >
          <h2
            id="up-next-title"
            className="mb-4 text-sm font-semibold tracking-[0.08em] uppercase"
          >
            Up Next
          </h2>
          <Card
            data-testid="up-next-scroll"
            className="relative min-h-0 flex-1 gap-0 overflow-y-auto rounded-xl bg-card py-0 ring-1 ring-border"
            onDragOver={(event) => {
              if (!dragSource) return

              const row = (event.target as HTMLElement).closest(
                '[data-testid="upcoming-row"]'
              )
              const rect = event.currentTarget.getBoundingClientRect()
              const edge = Math.min(48, rect.height * 0.2)

              if (event.clientY <= rect.top + edge) {
                event.currentTarget.scrollTop -= 24
              } else if (event.clientY >= rect.bottom - edge) {
                event.currentTarget.scrollTop += 24
              }

              event.preventDefault()
              event.dataTransfer.dropEffect = "move"
              setQueueTailDropActive(!row)
            }}
            onDragLeave={(event) => {
              const next = event.relatedTarget as Node | null
              if (next && event.currentTarget.contains(next)) return
              setQueueTailDropActive(false)
            }}
            onDrop={(event) => {
              if (
                (event.target as HTMLElement).closest(
                  '[data-testid="upcoming-row"]'
                )
              ) {
                return
              }

              event.preventDefault()
              const source =
                event.dataTransfer.getData("text/plain") || dragSource || ""
              handleDropSource(source, upcoming.length)
              setQueueTailDropActive(false)
            }}
          >
            {queueTailDropActive ? (
              <span
                data-testid="queue-tail-drop-indicator"
                aria-hidden="true"
                className={cn(
                  "pointer-events-none absolute right-2 left-2 z-30 h-0.5 rounded-full bg-primary",
                  upcoming.length === 0 ? "top-2" : "bottom-0"
                )}
              />
            ) : null}
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

        <div
          data-testid="queue-composer"
          className="flex shrink-0 items-center gap-2 px-4 py-3"
          onBlurCapture={(event) => {
            const next = event.relatedTarget as Node | null
            if (next && event.currentTarget.contains(next)) return
            setInputFocused(false)
          }}
        >
          <div className="relative h-9 min-w-0 flex-1">
            {dragSource ? (
              <div
                ref={removeTargetRef}
                data-testid="remove-drop-target"
                role="status"
                onDragEnter={(event) => {
                  event.preventDefault()
                  setRemoveTargetActive(true)
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = "move"
                  setRemoveTargetActive(true)
                }}
                onDragLeave={(event) => {
                  const relatedTarget = event.relatedTarget as Node | null
                  if (
                    relatedTarget &&
                    event.currentTarget.contains(relatedTarget)
                  )
                    return
                  setRemoveTargetActive(false)
                }}
                onDrop={handleRemoveDrop}
                className={cn(
                  "flex h-9 w-full items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors",
                  removeTargetActive &&
                    "border-destructive/70 bg-destructive/20 ring-1 ring-destructive/30"
                )}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span>
                  {removeTargetActive
                    ? "Drop here to remove"
                    : "Drop to remove"}
                </span>
              </div>
            ) : (
              <>
                <Link2
                  className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={url}
                  onFocus={() => setInputFocused(true)}
                  onChange={(event) => {
                    setUrl(event.target.value)
                    setError(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.preventDefault()
                      event.currentTarget.blur()
                      setInputFocused(false)
                      setError(null)
                      return
                    }

                    if (event.key === "Enter") {
                      event.preventDefault()
                      addUrl("tail")
                    }
                  }}
                  aria-label="Media URL"
                  aria-keyshortcuts="/"
                  placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ…"
                  className="h-9 rounded-md border-border bg-secondary pl-9 text-sm dark:bg-secondary"
                />
              </>
            )}
          </div>

          {inputFocused && !dragSource ? (
            <Button
              type="button"
              className="size-9 shrink-0 rounded-md"
              aria-label="Add media to queue"
              title="Add media to queue"
              disabled={!url.trim()}
              onClick={() => addUrl("tail")}
            >
              <Send />
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="size-9 shrink-0 rounded-md"
                  aria-label="Queue actions"
                >
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {url.trim() ? (
                  <>
                    <DropdownMenuItem onSelect={() => addUrl("next")}>
                      <SkipForward />
                      Play pasted URL next
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                ) : null}
                <DropdownMenuItem
                  onSelect={() => {
                    setPendingSetlist(null)
                    setSetlistError(null)
                    setSetlistOpen(true)
                  }}
                >
                  <Upload />
                  Load setlist
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={upcoming.length < 2}
                  onSelect={() =>
                    setUpcoming((items) =>
                      [...items].sort(() => Math.random() - 0.5)
                    )
                  }
                >
                  <Shuffle />
                  Shuffle upcoming
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setLocalMuted((value) => !value)}
                >
                  {localMuted ? <Volume2 /> : <VolumeX />}
                  {localMuted ? "Unmute local audio" : "Mute local audio"}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={openLocalVolume}>
                  <Volume2 />
                  Set local volume…
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  disabled={upcoming.length === 0}
                  onSelect={() => setUpcoming([])}
                >
                  <Trash2 />
                  Clear upcoming
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  disabled={
                    !current && upcoming.length === 0 && played.length === 0
                  }
                  onSelect={() => setStopOpen(true)}
                >
                  <Trash2 />
                  Stop & clear all
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
          <div
            data-testid="composer-error"
            role="alert"
            className="flex items-center gap-1.5 px-8 pb-6 text-xs font-medium text-destructive"
          >
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}
      </Card>

      <Dialog
        open={setlistOpen}
        onOpenChange={(open) => {
          setSetlistOpen(open)
          if (!open) {
            setPendingSetlist(null)
            setSetlistError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Load prepared setlist</DialogTitle>
            <DialogDescription>
              Choose a JSON export from Playlister, review how it joins the live
              queue, then commit it.
            </DialogDescription>
          </DialogHeader>

          {!pendingSetlist ? (
            <button
              data-testid="setlist-dropzone"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                const file = event.dataTransfer.files?.[0]
                if (file) void readSetlist(file)
              }}
              className={cn(
                "flex min-h-32 w-full flex-col items-center justify-center rounded-md border bg-muted/50 px-4 text-center transition-colors hover:bg-muted",
                setlistError && "border-destructive"
              )}
            >
              <Upload className="mb-2 size-5" aria-hidden="true" />
              <span className="text-sm font-medium">
                Drop a .json setlist here
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                or click to browse
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <div
                data-testid="setlist-preview"
                className="rounded-md border bg-muted/30 p-3"
              >
                <div className="text-sm font-medium">
                  {pendingSetlist.fileName}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {pendingSetlist.count} segment
                  {pendingSetlist.count === 1 ? "" : "s"}
                  {pendingSetlist.totalMinutes > 0
                    ? ` · ${formatRuntimeMinutes(pendingSetlist.totalMinutes)}`
                    : ""}
                </div>
                {pendingSetlist.count > pendingSetlist.cappedCount ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    The live import is capped at the first{" "}
                    {pendingSetlist.cappedCount} segments.
                  </div>
                ) : null}
              </div>

              <div className="text-xs text-muted-foreground">
                This setlist will replace the live queue and start from its
                first segment.
              </div>
            </div>
          )}

          {setlistError ? (
            <div role="alert" className="text-sm text-destructive">
              {setlistError}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSetlistOpen(false)}>
              Cancel
            </Button>
            {pendingSetlist ? (
              <Button onClick={replaceWithSetlist}>Load setlist</Button>
            ) : (
              <Button onClick={() => fileInputRef.current?.click()}>
                Browse file
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={volumeOpen}
        onOpenChange={(open) => {
          setVolumeOpen(open)
          if (open) setVolumeDraft(localVolume)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Local audio volume</DialogTitle>
            <DialogDescription>
              This changes MQS audio on this device only. It does not affect
              room volume.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 py-2">
            <Volume2
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              data-testid="local-volume-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={volumeDraft}
              aria-label="Local audio volume"
              onChange={(event) => setVolumeDraft(Number(event.target.value))}
              className="h-2 min-w-0 flex-1 cursor-pointer accent-primary"
            />
            <span
              data-testid="local-volume-value"
              className="w-10 text-right text-sm text-muted-foreground tabular-nums"
            >
              {volumeDraft}%
            </span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVolumeOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyLocalVolume}>Apply volume</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stopOpen} onOpenChange={setStopOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop and clear MQS?</DialogTitle>
            <DialogDescription>
              This stops playback and clears played, current, and upcoming
              items.
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
