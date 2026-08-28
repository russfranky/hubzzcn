import * as React from "react"
import {
  GripVertical,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { cn } from "@/lib/utils"

export type MqsMediaType =
  | "youtube"
  | "twitch"
  | "kick"
  | "website"
  | "native"
  | "webcam"
  | "screenshare"

export interface MqsQueueItem {
  id: string
  type: MqsMediaType
  url: string
  title: string
  addedBy: string
  addedByName: string
  startedAt?: number
  duration?: number
  durationMode?: "fixed" | "percent" | "fill"
  platform?: string
  participants?: unknown[]
}

/**
 * Port-compatible with the current pre-alpha `MqsQueueWindowProps` contract.
 *
 * The host owns authoritative queue state. This component only renders snapshots
 * and emits command/import/close intents. It does not add a second queue state
 * machine beside the pre-alpha server engine.
 */
export interface MqsQueueWindowProps {
  items: MqsQueueItem[]
  currentIndex: number
  isPlaying: boolean
  elapsed?: number
  isMuted?: boolean
  title?: string
  onCommand: (command: string) => void
  onImportSetlist?: (file: unknown) => void
  onClose?: () => void
  style?: React.CSSProperties
  className?: string
}

function formatMinutes(minutes?: number) {
  if (!Number.isFinite(minutes) || minutes === undefined) return "LIVE"
  const seconds = Math.max(0, Math.round(minutes * 60))
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return `${mins}:${String(secs).padStart(2, "0")}`
}

function formatElapsed(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safe / 3600)
  const mins = Math.floor((safe % 3600) / 60)
  const secs = safe % 60

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return `${mins}:${String(secs).padStart(2, "0")}`
}

function itemMeta(item: MqsQueueItem) {
  return `${item.platform ?? item.type} · added by ${item.addedByName}`
}

function QueueRow({
  item,
  index,
  current,
  dragIndex,
  setDragIndex,
  onCommand,
}: {
  item: MqsQueueItem
  index: number
  current: boolean
  dragIndex: number | null
  setDragIndex: (value: number | null) => void
  onCommand: (command: string) => void
}) {
  return (
    <Item
      data-testid={current ? "current-row" : "queue-row"}
      data-queue-index={index}
      draggable
      variant={current ? "outline" : "default"}
      size="xs"
      onDragStart={(event) => {
        setDragIndex(index)
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData("text/plain", String(index))
      }}
      onDragEnd={() => setDragIndex(null)}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
      }}
      onDrop={(event) => {
        event.preventDefault()
        const fromText = event.dataTransfer.getData("text/plain")
        const from = Number(fromText || dragIndex)
        setDragIndex(null)
        if (!Number.isInteger(from) || from === index) return
        onCommand(`--move ${from + 1} ${index + 1}`)
      }}
      className={cn(
        "group/item flex-nowrap rounded-none border-x-0 border-t-0 border-b border-border/50 px-2.5 py-2.5 last:border-b-0",
        current && "bg-primary/[0.06] ring-1 ring-primary/30",
        dragIndex === index && "opacity-45"
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Reorder item ${index + 1}`}
        title={`Reorder item ${index + 1}`}
        className="cursor-grab text-muted-foreground active:cursor-grabbing"
        onKeyDown={(event) => {
          if (!event.altKey) return
          if (event.key === "ArrowUp" && index > 0) {
            event.preventDefault()
            onCommand(`--move ${index + 1} ${index}`)
          }
          if (event.key === "ArrowDown") {
            event.preventDefault()
            onCommand(`--move ${index + 1} ${index + 2}`)
          }
        }}
      >
        <GripVertical aria-hidden="true" />
      </Button>

      <ItemContent className="min-w-0">
        <ItemTitle className="max-w-full">{item.title}</ItemTitle>
        <ItemDescription className="line-clamp-1 text-xs">
          {itemMeta(item)}
        </ItemDescription>
      </ItemContent>

      <ItemActions className="shrink-0 gap-1">
        <span className="mr-1 text-xs text-muted-foreground tabular-nums">
          {formatMinutes(item.duration)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={`Remove item ${index + 1}`}
          title="Remove"
          onClick={() => onCommand(`--remove ${index + 1}`)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </ItemActions>
    </Item>
  )
}

export function MqsQueueWindow({
  items,
  currentIndex,
  isPlaying,
  elapsed = 0,
  isMuted = false,
  title = "Queue",
  onCommand,
  onImportSetlist,
  onClose,
  style,
  className,
}: MqsQueueWindowProps) {
  const [dragIndex, setDragIndex] = React.useState<number | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const current =
    currentIndex >= 0 && currentIndex < items.length
      ? items[currentIndex]
      : undefined
  const currentDurationSeconds = current?.duration
    ? Math.round(current.duration * 60)
    : 0
  const clampedElapsed = currentDurationSeconds
    ? Math.min(elapsed, currentDurationSeconds)
    : elapsed
  const progress = currentDurationSeconds
    ? (clampedElapsed / currentDurationSeconds) * 100
    : 0

  const knownMinutes = items.reduce(
    (total, item) =>
      total + (Number.isFinite(item.duration) ? (item.duration ?? 0) : 0),
    0
  )
  const hasOpenEnded = items.some((item) => !Number.isFinite(item.duration))
  const totalLabel = `${Math.round(knownMinutes)}m${hasOpenEnded ? "+" : ""} total`

  const onFile = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0]
      event.currentTarget.value = ""
      if (!file || !onImportSetlist) return

      try {
        onImportSetlist(JSON.parse(await file.text()) as unknown)
      } catch {
        // The production server validates setlists. Malformed local JSON is ignored.
      }
    },
    [onImportSetlist]
  )

  return (
    <section
      data-testid="mqs-window"
      aria-label={`${title} media queue`}
      className={cn(
        "flex max-h-[min(78svh,680px)] w-[340px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-2xl",
        className
      )}
      style={style}
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
          {title}
        </h2>
        <span className="text-[11px] text-muted-foreground tabular-nums">
          {totalLabel}
        </span>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close"
            onClick={onClose}
          >
            <X aria-hidden="true" />
          </Button>
        ) : null}
      </header>

      <div className="shrink-0 border-b border-border px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Previous"
            onClick={() => onCommand("--prev")}
            disabled={items.length === 0}
          >
            <SkipBack aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            aria-label={isPlaying ? "Pause" : "Play"}
            onClick={() => onCommand(isPlaying ? "--pause" : "--resume")}
            disabled={items.length === 0}
          >
            {isPlaying ? (
              <Pause aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Skip"
            onClick={() => onCommand("--skip")}
            disabled={items.length === 0}
          >
            <SkipForward aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={isMuted ? "Unmute" : "Mute"}
            onClick={() => onCommand(isMuted ? "--unmute" : "--mute")}
          >
            {isMuted ? (
              <VolumeX aria-hidden="true" />
            ) : (
              <Volume2 aria-hidden="true" />
            )}
          </Button>

          <div className="ml-1 min-w-0 flex-1">
            <div
              role={currentDurationSeconds > 0 ? "slider" : undefined}
              tabIndex={currentDurationSeconds > 0 ? 0 : undefined}
              aria-label={
                currentDurationSeconds > 0 ? "Playback position" : undefined
              }
              aria-valuemin={currentDurationSeconds > 0 ? 0 : undefined}
              aria-valuemax={
                currentDurationSeconds > 0 ? currentDurationSeconds : undefined
              }
              aria-valuenow={
                currentDurationSeconds > 0
                  ? Math.round(clampedElapsed)
                  : undefined
              }
              onClick={(event) => {
                if (!currentDurationSeconds) return
                const bounds = event.currentTarget.getBoundingClientRect()
                const ratio = Math.min(
                  1,
                  Math.max(0, (event.clientX - bounds.left) / bounds.width)
                )
                onCommand(
                  `--seek ${Math.round(currentDurationSeconds * ratio)}`
                )
              }}
              onKeyDown={(event) => {
                if (!currentDurationSeconds) return
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight")
                  return
                event.preventDefault()
                const delta = event.key === "ArrowLeft" ? -5 : 5
                const next = Math.min(
                  currentDurationSeconds,
                  Math.max(0, Math.round(clampedElapsed) + delta)
                )
                onCommand(`--seek ${next}`)
              }}
              className={cn(
                "relative h-7 outline-none",
                currentDurationSeconds > 0 &&
                  "cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-ring/50"
              )}
            >
              <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground tabular-nums">
              <span>{current ? formatElapsed(clampedElapsed) : "0:00"}</span>
              <span>{current ? formatMinutes(current.duration) : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        data-testid="queue-scroll-area"
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {items.length > 0 ? (
          <ItemGroup className="gap-0">
            {items.map((item, index) => (
              <QueueRow
                key={item.id}
                item={item}
                index={index}
                current={index === currentIndex}
                dragIndex={dragIndex}
                setDragIndex={setDragIndex}
                onCommand={onCommand}
              />
            ))}
          </ItemGroup>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Queue is empty.
          </div>
        )}
      </div>

      {(onImportSetlist || items.length > 0) && (
        <footer className="flex shrink-0 items-center gap-2 border-t border-border p-2">
          {onImportSetlist ? (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                aria-label="Setlist JSON file"
                className="sr-only"
                onChange={onFile}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Upload aria-hidden="true" />
                Load setlist
              </Button>
            </>
          ) : null}

          {items.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground"
              aria-label="Clear queue"
              title="Clear the upcoming queue"
              onClick={() => onCommand("--clearqueue")}
            >
              <Trash2 aria-hidden="true" />
              Clear
            </Button>
          ) : null}
        </footer>
      )}
    </section>
  )
}
