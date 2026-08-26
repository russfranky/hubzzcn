import * as React from "react"
import {
  GripVertical,
  HelpCircle,
  Link2,
  Maximize2,
  MoreVertical,
  Pause,
  Play,
  Plus,
  Shuffle,
  SkipBack,
  SkipForward,
  Trash2,
  Upload,
  Video,
  MonitorUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
import { cn } from "@/lib/utils"

const HISTORY_LIMIT = 3
const HISTORY_DRAG_TYPE = "application/x-hubzz-mqs-history"
const QUEUE_DRAG_TYPE = "application/x-hubzz-mqs-upcoming"

export interface MqsQueuePanelItem {
  id: string
  title: string
  url: string
  platform?: string
  addedBy?: string
  addedByName?: string
  durationMinutes?: number
}

export interface MqsQueuePanelActions {
  add?: (url: string, durationMinutes?: number) => void
  addNext?: (url: string, durationMinutes?: number) => void
  previous?: () => void
  pause?: () => void
  resume?: () => void
  seek?: (seconds: number) => void
  skip?: () => void
  move?: (fromIndex: number, toIndex: number) => void
  remove?: (index: number) => void
  shuffle?: () => void
  clearUpcoming?: () => void
  stop?: () => void
  toggleWebcam?: () => void
  toggleScreenshare?: () => void
  showHelp?: () => void
  loadSetlist?: () => void
}

export interface MqsQueuePanelProps {
  items: MqsQueuePanelItem[]
  currentIndex: number
  isPlaying: boolean
  elapsed?: number
  title?: string
  expanded?: boolean
  className?: string
  actions?: MqsQueuePanelActions
  onToggleExpand?: () => void
  onContributorClick?: (item: MqsQueuePanelItem) => void
}

function formatDuration(minutes?: number) {
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

function formatElapsed(seconds?: number) {
  if (!Number.isFinite(seconds) || seconds === undefined) return "0:00"
  const safe = Math.max(0, Math.floor(seconds))
  const hours = Math.floor(safe / 3600)
  const mins = Math.floor((safe % 3600) / 60)
  const secs = safe % 60

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
  }

  return `${mins}:${String(secs).padStart(2, "0")}`
}

function Contributor({
  item,
  onClick,
}: {
  item: MqsQueuePanelItem
  onClick?: (item: MqsQueuePanelItem) => void
}) {
  const name = item.addedByName?.trim()
  if (!name) return null

  const display = name.startsWith("@") ? name : `@${name}`

  if (!onClick) {
    return (
      <span className="underline decoration-border underline-offset-4">
        {display}
      </span>
    )
  }

  return (
    <button
      type="button"
      className="rounded-sm underline decoration-border underline-offset-4 outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      onClick={() => onClick(item)}
    >
      {display}
    </button>
  )
}

function Meta({
  item,
  onContributorClick,
}: {
  item: MqsQueuePanelItem
  onContributorClick?: (item: MqsQueuePanelItem) => void
}) {
  return (
    <ItemDescription className="line-clamp-1 text-xs">
      {item.platform ?? "Media"}
      {item.addedByName ? (
        <>
          {" "}· added by{" "}
          <Contributor item={item} onClick={onContributorClick} />
        </>
      ) : null}
    </ItemDescription>
  )
}

function ReorderHandle({
  label,
  onClick,
  onKeyDown,
}: {
  label: string
  onClick?: () => void
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className="cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover/item:opacity-100 group-focus-within/item:opacity-100 active:cursor-grabbing"
    >
      <GripVertical aria-hidden="true" />
    </Button>
  )
}

function HistoryItem({
  item,
  actions,
  onContributorClick,
}: {
  item: MqsQueuePanelItem
  actions?: MqsQueuePanelActions
  onContributorClick?: (item: MqsQueuePanelItem) => void
}) {
  const requeue = () => actions?.add?.(item.url, item.durationMinutes)

  return (
    <Item
      data-testid="history-row"
      size="xs"
      draggable={Boolean(actions?.add)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "copy"
        event.dataTransfer.setData(HISTORY_DRAG_TYPE, item.id)
      }}
      className="rounded-none border-x-0 border-t-0 border-b border-border/50 opacity-60 last:border-b-0 hover:opacity-80"
    >
      <ReorderHandle label={`Add ${item.title} to Up Next`} onClick={requeue} />
      <ItemContent>
        <ItemTitle>{item.title}</ItemTitle>
        <Meta item={item} onContributorClick={onContributorClick} />
      </ItemContent>
      <ItemActions>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatDuration(item.durationMinutes)}
        </span>
      </ItemActions>
    </Item>
  )
}

function ProgressPlayhead({
  item,
  elapsed,
  isPlaying,
  actions,
}: {
  item: MqsQueuePanelItem
  elapsed: number
  isPlaying: boolean
  actions?: MqsQueuePanelActions
}) {
  const durationSeconds = item.durationMinutes ? item.durationMinutes * 60 : 0
  const finite = durationSeconds > 0
  const safeElapsed = finite ? Math.min(durationSeconds, Math.max(0, elapsed)) : elapsed
  const progress = finite ? (safeElapsed / durationSeconds) * 100 : 50

  const togglePlayback = () => {
    if (isPlaying) actions?.pause?.()
    else actions?.resume?.()
  }

  const seekFromPointer = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!finite || !actions?.seek) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
    actions.seek(Math.round(durationSeconds * ratio))
  }

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
      <span className="text-xs tabular-nums text-muted-foreground">
        {finite ? formatElapsed(safeElapsed) : "LIVE"}
      </span>

      <div
        role={finite && actions?.seek ? "slider" : undefined}
        tabIndex={finite && actions?.seek ? 0 : undefined}
        aria-label={finite && actions?.seek ? "Playback position" : undefined}
        aria-valuemin={finite && actions?.seek ? 0 : undefined}
        aria-valuemax={finite && actions?.seek ? Math.round(durationSeconds) : undefined}
        aria-valuenow={finite && actions?.seek ? Math.round(safeElapsed) : undefined}
        onClick={seekFromPointer}
        onKeyDown={(event) => {
          if (!finite || !actions?.seek) return
          if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
          event.preventDefault()
          const delta = event.key === "ArrowLeft" ? -10 : 10
          actions.seek(Math.min(durationSeconds, Math.max(0, safeElapsed + delta)))
        }}
        className={cn(
          "relative h-8 min-w-0 outline-none",
          finite && actions?.seek &&
            "cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-muted">
          {finite ? (
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          ) : null}
        </div>

        <Button
          type="button"
          size="icon-xs"
          aria-label={isPlaying ? "Pause" : "Play"}
          title={isPlaying ? "Pause" : "Play"}
          onClick={(event) => {
            event.stopPropagation()
            togglePlayback()
          }}
          className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm"
          style={{ left: `${progress}%` }}
        >
          {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </Button>
      </div>

      <span className="text-xs tabular-nums text-muted-foreground">
        {finite ? formatDuration(item.durationMinutes) : "LIVE"}
      </span>
    </div>
  )
}

function CurrentItem({
  item,
  elapsed,
  isPlaying,
  actions,
  onContributorClick,
}: {
  item: MqsQueuePanelItem
  elapsed: number
  isPlaying: boolean
  actions?: MqsQueuePanelActions
  onContributorClick?: (item: MqsQueuePanelItem) => void
}) {
  return (
    <Item
      data-testid="current-row"
      variant="outline"
      size="sm"
      className="flex-nowrap items-stretch gap-3 bg-muted/20 px-3 py-3"
    >
      <ItemContent className="min-w-0 justify-center gap-2">
        <div>
          <ItemTitle className="text-sm">{item.title}</ItemTitle>
          <Meta item={item} onContributorClick={onContributorClick} />
        </div>
        <ProgressPlayhead item={item} elapsed={elapsed} isPlaying={isPlaying} actions={actions} />
      </ItemContent>

      <ItemActions className="flex-col justify-between border-l border-border pl-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Skip up"
          title="Previous item"
          onClick={actions?.previous}
          disabled={!actions?.previous}
        >
          <SkipBack className="rotate-90" aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Skip down"
          title="Next item"
          onClick={actions?.skip}
          disabled={!actions?.skip}
        >
          <SkipForward className="rotate-90" aria-hidden="true" />
        </Button>
      </ItemActions>
    </Item>
  )
}

function UpcomingItem({
  item,
  absoluteIndex,
  upcomingIndex,
  actions,
  onContributorClick,
}: {
  item: MqsQueuePanelItem
  absoluteIndex: number
  upcomingIndex: number
  actions?: MqsQueuePanelActions
  onContributorClick?: (item: MqsQueuePanelItem) => void
}) {
  const move = (delta: number) => {
    actions?.move?.(absoluteIndex, absoluteIndex + delta)
  }

  return (
    <Item
      data-testid="upcoming-row"
      size="xs"
      draggable={Boolean(actions?.move)}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "move"
        event.dataTransfer.setData(QUEUE_DRAG_TYPE, String(absoluteIndex))
      }}
      onDragOver={(event) => {
        if (!actions?.move) return
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
      }}
      onDrop={(event) => {
        if (!actions?.move) return
        event.preventDefault()
        const from = Number(event.dataTransfer.getData(QUEUE_DRAG_TYPE))
        if (Number.isInteger(from) && from !== absoluteIndex) actions.move(from, absoluteIndex)
      }}
      className="rounded-none border-x-0 border-t-0 border-b border-border/50 last:border-b-0 hover:bg-accent/35"
    >
      <ReorderHandle
        label={`Reorder ${item.title}`}
        onKeyDown={(event) => {
          if (event.key === "Delete" && actions?.remove) {
            event.preventDefault()
            actions.remove(absoluteIndex)
            return
          }
          if (!event.altKey) return
          if (event.key === "ArrowUp" && upcomingIndex > 0) {
            event.preventDefault()
            move(-1)
          }
          if (event.key === "ArrowDown") {
            event.preventDefault()
            move(1)
          }
        }}
      />
      <ItemContent>
        <ItemTitle>{item.title}</ItemTitle>
        <Meta item={item} onContributorClick={onContributorClick} />
      </ItemContent>
      <ItemActions>
        <span className="text-xs tabular-nums text-muted-foreground">
          {formatDuration(item.durationMinutes)}
        </span>
      </ItemActions>
    </Item>
  )
}

export function MqsQueuePanel({
  items,
  currentIndex,
  isPlaying,
  elapsed = 0,
  title = "MQS",
  expanded = false,
  className,
  actions,
  onToggleExpand,
  onContributorClick,
}: MqsQueuePanelProps) {
  const [url, setUrl] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const currentSectionRef = React.useRef<HTMLElement>(null)

  const hasCurrent = currentIndex >= 0 && currentIndex < items.length
  const current = hasCurrent ? items[currentIndex] : null
  const history = hasCurrent
    ? items.slice(Math.max(0, currentIndex - HISTORY_LIMIT), currentIndex)
    : []
  const upcoming = hasCurrent ? items.slice(currentIndex + 1) : items

  React.useLayoutEffect(() => {
    const viewport = scrollRef.current
    const anchor = currentSectionRef.current
    if (!viewport || !anchor || history.length === 0) return
    viewport.scrollTop = Math.max(0, anchor.offsetTop - 8)
  }, [current?.id, history.length])

  const submitAdd = (mode: "add" | "next") => {
    const value = url.trim()
    if (!value) return
    if (mode === "next") actions?.addNext?.(value)
    else actions?.add?.(value)
    setUrl("")
  }

  return (
    <section
      aria-label={`${title} media queue`}
      className={cn(
        "flex max-h-[70vh] w-[320px] max-w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xl transition-[width]",
        expanded && "w-[440px] max-h-[88vh]",
        className
      )}
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <h2 className="min-w-0 flex-1 truncate text-base font-semibold">{title}</h2>
        {onToggleExpand ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={expanded ? "Restore queue size" : "Expand queue"}
            title={expanded ? "Restore" : "Expand"}
            onClick={onToggleExpand}
          >
            <Maximize2 aria-hidden="true" />
          </Button>
        ) : null}
      </header>

      <div
        ref={scrollRef}
        data-testid="queue-scroll-area"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
      >
        {history.length > 0 ? (
          <section aria-labelledby="last-played-heading" className="border-b px-2 py-2">
            <h3
              id="last-played-heading"
              className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
            >
              Last Played
            </h3>
            <ItemGroup className="gap-0">
              {history.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  actions={actions}
                  onContributorClick={onContributorClick}
                />
              ))}
            </ItemGroup>
          </section>
        ) : null}

        <section
          ref={currentSectionRef}
          aria-labelledby="now-playing-heading"
          className="border-b px-2 py-2"
        >
          <h3
            id="now-playing-heading"
            className="px-2 pb-1 text-[11px] font-medium tracking-wide text-foreground uppercase"
          >
            Now Playing
          </h3>
          {current ? (
            <CurrentItem
              item={current}
              elapsed={elapsed}
              isPlaying={isPlaying}
              actions={actions}
              onContributorClick={onContributorClick}
            />
          ) : (
            <div className="px-3 py-4 text-sm text-muted-foreground">Nothing is playing.</div>
          )}
        </section>

        <section
          aria-labelledby="up-next-heading"
          className="px-2 py-2"
          onDragOver={(event) => {
            if (!actions?.add) return
            if (!Array.from(event.dataTransfer.types).includes(HISTORY_DRAG_TYPE)) return
            event.preventDefault()
            event.dataTransfer.dropEffect = "copy"
          }}
          onDrop={(event) => {
            if (!actions?.add) return
            const id = event.dataTransfer.getData(HISTORY_DRAG_TYPE)
            const item = history.find((candidate) => candidate.id === id)
            if (!item) return
            event.preventDefault()
            actions.add(item.url, item.durationMinutes)
          }}
        >
          <h3
            id="up-next-heading"
            className="px-2 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
          >
            Up Next
          </h3>
          {upcoming.length > 0 ? (
            <ItemGroup className="gap-0">
              {upcoming.map((item, upcomingIndex) => (
                <UpcomingItem
                  key={item.id}
                  item={item}
                  absoluteIndex={(hasCurrent ? currentIndex + 1 : 0) + upcomingIndex}
                  upcomingIndex={upcomingIndex}
                  actions={actions}
                  onContributorClick={onContributorClick}
                />
              ))}
            </ItemGroup>
          ) : (
            <div className="px-3 py-4 text-sm text-muted-foreground">End of queue.</div>
          )}
        </section>
      </div>

      <form
        className="flex shrink-0 items-center gap-2 border-t p-2"
        onSubmit={(event) => {
          event.preventDefault()
          submitAdd("add")
        }}
      >
        <div className="relative min-w-0 flex-1">
          <Link2
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            aria-label="Media URL"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="Paste YouTube or Twitch URL"
            className="h-9 pl-8"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          aria-label="Add to queue"
          title="Add to queue"
          disabled={!url.trim() || !actions?.add}
        >
          <Plus aria-hidden="true" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Queue actions"
              title="Queue actions"
            >
              <MoreVertical aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {url.trim() && actions?.addNext ? (
              <DropdownMenuItem onSelect={() => submitAdd("next")}>
                <SkipForward aria-hidden="true" />
                Play pasted URL next
              </DropdownMenuItem>
            ) : null}
            {actions?.loadSetlist ? (
              <DropdownMenuItem onSelect={actions.loadSetlist}>
                <Upload aria-hidden="true" />
                Load setlist
              </DropdownMenuItem>
            ) : null}
            {actions?.shuffle ? (
              <DropdownMenuItem onSelect={actions.shuffle} disabled={upcoming.length < 2}>
                <Shuffle aria-hidden="true" />
                Shuffle Up Next
              </DropdownMenuItem>
            ) : null}
            {actions?.toggleWebcam ? (
              <DropdownMenuItem onSelect={actions.toggleWebcam}>
                <Video aria-hidden="true" />
                Toggle webcam
              </DropdownMenuItem>
            ) : null}
            {actions?.toggleScreenshare ? (
              <DropdownMenuItem onSelect={actions.toggleScreenshare}>
                <MonitorUp aria-hidden="true" />
                Toggle screenshare
              </DropdownMenuItem>
            ) : null}
            {actions?.showHelp ? (
              <DropdownMenuItem onSelect={actions.showHelp}>
                <HelpCircle aria-hidden="true" />
                Help & commands
              </DropdownMenuItem>
            ) : null}

            {actions?.clearUpcoming || actions?.stop ? <DropdownMenuSeparator /> : null}

            {actions?.clearUpcoming ? (
              <DropdownMenuItem onSelect={actions.clearUpcoming} disabled={upcoming.length === 0}>
                <Trash2 aria-hidden="true" />
                Clear Up Next
              </DropdownMenuItem>
            ) : null}
            {actions?.stop ? (
              <DropdownMenuItem variant="destructive" onSelect={actions.stop}>
                <Trash2 aria-hidden="true" />
                Stop & clear all
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </form>
    </section>
  )
}
