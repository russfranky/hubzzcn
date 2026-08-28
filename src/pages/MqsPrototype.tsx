import * as React from "react"

import {
  MqsQueueWindow,
  type MqsQueueItem,
} from "@/components/hubzz/mqs-queue-window"
import { Button } from "@/components/ui/button"

const INITIAL_ITEMS: MqsQueueItem[] = [
  {
    id: "sunset-drive",
    type: "youtube",
    title: "Sunset Drive 2025 – Live Set",
    url: "https://www.youtube.com/watch?v=sunset-drive",
    platform: "YouTube",
    addedBy: "john",
    addedByName: "John",
    duration: 58.4,
  },
  {
    id: "tomorrowland",
    type: "youtube",
    title: "Tomorrowland 2026 Mainstage W1",
    url: "https://www.youtube.com/watch?v=tomorrowland-2026",
    platform: "YouTube",
    addedBy: "dan",
    addedByName: "Dan",
    duration: 75.7,
  },
  {
    id: "afterlife",
    type: "youtube",
    title: "Afterlife Tulum 2025",
    url: "https://www.youtube.com/watch?v=afterlife-tulum",
    platform: "YouTube",
    addedBy: "nina",
    addedByName: "Nina",
    duration: 72.55,
  },
  {
    id: "calvin",
    type: "youtube",
    title: "Calvin Harris – Live at Ushuaïa",
    url: "https://www.youtube.com/watch?v=calvin-ushuaia",
    platform: "YouTube",
    addedBy: "jordan",
    addedByName: "Jordan",
    duration: 59.1667,
  },
  {
    id: "open-stream",
    type: "twitch",
    title: "Rooftop Live Stream",
    url: "https://twitch.tv/example",
    platform: "Twitch",
    addedBy: "kai",
    addedByName: "Kai",
  },
]

type Snapshot = {
  items: MqsQueueItem[]
  currentIndex: number
  isPlaying: boolean
  elapsed: number
  isMuted: boolean
}

function moveItem<T>(values: T[], from: number, to: number) {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= values.length ||
    to >= values.length
  ) {
    return values
  }

  const next = [...values]
  const [moved] = next.splice(from, 1)
  if (moved === undefined) return values
  next.splice(to, 0, moved)
  return next
}

function setlistItems(value: unknown): MqsQueueItem[] | null {
  if (!value || typeof value !== "object") return null
  const segments = (value as { segments?: unknown }).segments
  if (!Array.isArray(segments) || segments.length === 0) return null

  const items = segments.flatMap((segment, index) => {
    if (!segment || typeof segment !== "object") return []
    const candidate = segment as {
      type?: unknown
      url?: unknown
      title?: unknown
      platform?: unknown
      duration?: unknown
    }
    if (typeof candidate.url !== "string") return []

    const type =
      candidate.type === "youtube" ||
      candidate.type === "twitch" ||
      candidate.type === "kick" ||
      candidate.type === "website" ||
      candidate.type === "native" ||
      candidate.type === "webcam" ||
      candidate.type === "screenshare"
        ? candidate.type
        : "website"

    return [
      {
        id: `setlist-${index}`,
        type,
        url: candidate.url,
        title:
          typeof candidate.title === "string" && candidate.title.trim()
            ? candidate.title.trim()
            : candidate.url,
        platform:
          typeof candidate.platform === "string"
            ? candidate.platform
            : type.toUpperCase(),
        duration:
          typeof candidate.duration === "number" &&
          Number.isFinite(candidate.duration)
            ? candidate.duration
            : undefined,
        addedBy: "setlist",
        addedByName: "Setlist",
      } satisfies MqsQueueItem,
    ]
  })

  return items.length > 0 ? items : null
}

/**
 * Demo host for the pre-alpha-compatible MQS view.
 *
 * Production pre-alpha replaces this local adapter with SpaceHUD:
 * `onCommand` -> `connection.send("chat", command)` and
 * `onImportSetlist` -> `connection.send("mqs:import", file, "replace")`.
 * The queue window itself remains a stateless view over server snapshots.
 */
export function MqsPrototype() {
  const [open, setOpen] = React.useState(true)
  const [lastCommand, setLastCommand] = React.useState("")
  const [snapshot, setSnapshot] = React.useState<Snapshot>({
    items: INITIAL_ITEMS,
    currentIndex: 1,
    isPlaying: true,
    elapsed: 32 * 60 + 18,
    isMuted: false,
  })

  const handleCommand = React.useCallback((command: string) => {
    setLastCommand(command)

    setSnapshot((current) => {
      if (command === "--prev") {
        return {
          ...current,
          currentIndex: Math.max(0, current.currentIndex - 1),
          elapsed: 0,
        }
      }

      if (command === "--skip") {
        return {
          ...current,
          currentIndex: Math.min(
            current.items.length - 1,
            current.currentIndex + 1
          ),
          elapsed: 0,
        }
      }

      if (command === "--pause") return { ...current, isPlaying: false }
      if (command === "--resume") return { ...current, isPlaying: true }
      if (command === "--mute") return { ...current, isMuted: true }
      if (command === "--unmute") return { ...current, isMuted: false }

      if (command === "--clearqueue") {
        const active = current.items[current.currentIndex]
        return {
          ...current,
          items: active ? [active] : [],
          currentIndex: active ? 0 : -1,
        }
      }

      const seek = /^--seek\s+(\d+)$/.exec(command)
      if (seek) {
        return { ...current, elapsed: Number(seek[1]) }
      }

      const remove = /^--remove\s+(\d+)$/.exec(command)
      if (remove) {
        const index = Number(remove[1]) - 1
        if (index < 0 || index >= current.items.length) return current

        const nextItems = current.items.filter(
          (_, itemIndex) => itemIndex !== index
        )
        let nextIndex = current.currentIndex
        if (index < nextIndex) nextIndex -= 1
        if (index === nextIndex) {
          nextIndex = Math.min(nextIndex, nextItems.length - 1)
        }

        return {
          ...current,
          items: nextItems,
          currentIndex: nextItems.length === 0 ? -1 : Math.max(0, nextIndex),
        }
      }

      const move = /^--move\s+(\d+)\s+(\d+)$/.exec(command)
      if (move) {
        const from = Number(move[1]) - 1
        const to = Number(move[2]) - 1
        return {
          ...current,
          items: moveItem(current.items, from, to),
        }
      }

      return current
    })
  }, [])

  const handleImport = React.useCallback((value: unknown) => {
    const items = setlistItems(value)
    if (!items) return

    setSnapshot({
      items,
      currentIndex: 0,
      isPlaying: true,
      elapsed: 0,
      isMuted: false,
    })
  }, [])

  return (
    <main className="dark grid min-h-svh place-items-center bg-background p-3 text-foreground">
      <span
        data-testid="last-mqs-command"
        className="sr-only"
        aria-live="polite"
      >
        {lastCommand}
      </span>

      {open ? (
        <MqsQueueWindow
          items={snapshot.items}
          currentIndex={snapshot.currentIndex}
          isPlaying={snapshot.isPlaying}
          elapsed={snapshot.elapsed}
          isMuted={snapshot.isMuted}
          title="Rooftop"
          onCommand={handleCommand}
          onImportSetlist={handleImport}
          onClose={() => setOpen(false)}
        />
      ) : (
        <Button type="button" onClick={() => setOpen(true)}>
          Open queue
        </Button>
      )}
    </main>
  )
}

export default MqsPrototype
