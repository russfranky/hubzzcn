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
import { toast } from "sonner"

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
import { clampMqsElapsed, mqsDurationSeconds } from "./mqs-timing"

const QUEUE_DRAG_TYPE = "application/x-hubzz-mqs-reorder"
const SETLIST_FILE_LIMIT = 2 * 1024 * 1024

type QueueDrag = {
  itemId: string
  token: string
}

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

function formatMinutes(item?: MqsQueueItem) {
  const seconds = mqsDurationSeconds(item)
  return seconds === null ? "LIVE" : formatElapsed(seconds)
}

function formatElapsed(seconds: number) {
  const safe = clampMqsElapsed(seconds, null)
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
  items,
  current,
  drag,
  setDrag,
  onCommand,
}: {
  item: MqsQueueItem
  index: number
  items: MqsQueueItem[]
  current: boolean
  drag: QueueDrag | null
  setDrag: (value: QueueDrag | null) => void
  onCommand: (command: string) => void
}) {
  return (
    <Item
      role="listitem"
      data-testid={current ? "current-row" : "queue-row"}
      data-queue-index={index}
      draggable
      variant={current ? "outline" : "default"}
      size="xs"
      onDragStart={(event) => {
        // A nested draggable or text selection is not a queue-row drag.
        if (event.target !== event.currentTarget) return
        const token = crypto.randomUUID()
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData(QUEUE_DRAG_TYPE, token)
        setDrag({ itemId: item.id, token })
      }}
      onDragEnd={() => setDrag(null)}
      onDragOver={(event) => {
        event.preventDefault()
        // The browser exposes types, not payloads, during dragover.
        const accepts =
          drag !== null &&
          drag.itemId !== item.id &&
          items.some((candidate) => candidate.id === drag.itemId) &&
          event.dataTransfer.types.includes(QUEUE_DRAG_TYPE)
        event.dataTransfer.dropEffect = accepts ? "move" : "none"
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        setDrag(null)
        if (
          !drag ||
          event.dataTransfer.getData(QUEUE_DRAG_TYPE) !== drag.token
        ) {
          return
        }

        // Resolve the stable ID against the latest host snapshot, not an
        // index captured before another client changed the queue.
        const from = items.findIndex((entry) => entry.id === drag.itemId)
        if (from < 0 || from === index) return
        onCommand(`--move ${from + 1} ${index + 1}`)
      }}
      className={cn(
        "group/item flex-nowrap rounded-none border-x-0 border-t-0 border-b border-border/50 px-2.5 py-2.5 last:border-b-0",
        current && "bg-primary/[0.06] ring-1 ring-primary/30",
        drag?.itemId === item.id && "opacity-45"
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
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
          event.preventDefault()
          const to = index + (event.key === "ArrowUp" ? -1 : 1)
          if (to < 0 || to >= items.length) return
          onCommand(`--move ${index + 1} ${to + 1}`)
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
          {formatMinutes(item)}
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
  const [drag, setDrag] = React.useState<QueueDrag | null>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const importRequestRef = React.useRef(0)
  const importToastId = React.useId()

  React.useEffect(
    () => () => {
      importRequestRef.current += 1
      toast.dismiss(importToastId)
    },
    [importToastId, onImportSetlist]
  )

  const current =
    Number.isSafeInteger(currentIndex) &&
    currentIndex >= 0 &&
    currentIndex < items.length
      ? items[currentIndex]
      : undefined
  const playing = Boolean(current) && isPlaying
  const currentDurationSeconds = mqsDurationSeconds(current) ?? 0
  const clampedElapsed = current
    ? clampMqsElapsed(elapsed, currentDurationSeconds || null)
    : 0
  const progress = currentDurationSeconds
    ? (clampedElapsed / currentDurationSeconds) * 100
    : 0

  const knownMinutes = items.reduce(
    (total, item) => total + (mqsDurationSeconds(item) ?? 0) / 60,
    0
  )
  const hasOpenEnded = items.some((item) => mqsDurationSeconds(item) === null)
  const totalLabel = `${Math.round(knownMinutes)}m${hasOpenEnded ? "+" : ""} total`

  const onFile = React.useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.currentTarget.files?.[0]
      event.currentTarget.value = ""
      const request = ++importRequestRef.current
      if (!file || !onImportSetlist) return
      setDrag(null)
      toast.dismiss(importToastId)
      if (file.size > SETLIST_FILE_LIMIT) {
        toast.error("Could not load setlist", {
          id: importToastId,
          description: "Choose a JSON file no larger than 2 MiB.",
        })
        return
      }

      try {
        const text = await file.text()
        if (request !== importRequestRef.current) return
        const value: unknown = JSON.parse(text)
        onImportSetlist(value)
      } catch {
        if (request !== importRequestRef.current) return
        toast.error("Could not load setlist", {
          id: importToastId,
          description:
            "The file could not be loaded. Check the JSON file and try again.",
        })
      }
    },
    [onImportSetlist, importToastId]
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
            disabled={!current || currentIndex === 0}
          >
            <SkipBack aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon-sm"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => onCommand(playing ? "--pause" : "--resume")}
            disabled={!current}
          >
            {playing ? (
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
            disabled={!current || currentIndex === items.length - 1}
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
                currentDurationSeconds > 0 ? clampedElapsed : undefined
              }
              aria-valuetext={
                currentDurationSeconds > 0
                  ? formatElapsed(clampedElapsed)
                  : undefined
              }
              onClick={(event) => {
                if (!currentDurationSeconds) return
                const bounds = event.currentTarget.getBoundingClientRect()
                if (bounds.width <= 0 || !Number.isFinite(event.clientX)) return
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
                let next: number
                if (event.key === "Home") next = 0
                else if (event.key === "End") next = currentDurationSeconds
                else if (event.key === "ArrowLeft")
                  next = Math.max(0, clampedElapsed - 5)
                else if (event.key === "ArrowRight")
                  next = Math.min(currentDurationSeconds, clampedElapsed + 5)
                else return
                event.preventDefault()
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
              <span>{current ? formatMinutes(current) : "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        data-testid="queue-scroll-area"
        className="min-h-0 flex-1 overflow-y-auto"
      >
        {items.length > 0 ? (
          <ItemGroup aria-label="Media queue items" className="gap-0">
            {items.map((item, index) => (
              <QueueRow
                key={item.id}
                item={item}
                index={index}
                items={items}
                current={index === currentIndex}
                drag={drag}
                setDrag={setDrag}
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
