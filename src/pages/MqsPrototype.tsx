import * as React from "react"
import { toast } from "sonner"

import { MqsQueuePanel, type MqsQueuePanelItem } from "@/components/hubzz/mqs-queue-panel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const SETLIST_LIMIT = 500

const INITIAL_ITEMS: MqsQueuePanelItem[] = [
  {
    id: "played-sunset-drive",
    title: "Sunset Drive 2025 – Live Set",
    url: "https://www.youtube.com/watch?v=history-1",
    platform: "YouTube",
    addedBy: "john",
    addedByName: "John",
    durationMinutes: 58.4,
  },
  {
    id: "played-chillhop",
    title: "Chillhop Essentials – Spring 2025",
    url: "https://www.youtube.com/watch?v=history-2",
    platform: "YouTube",
    addedBy: "mira",
    addedByName: "Mira",
    durationMinutes: 62.1833,
  },
  {
    id: "played-tokyo-nights",
    title: "Tokyo Nights – LoFi Mix",
    url: "https://www.youtube.com/watch?v=history-3",
    platform: "YouTube",
    addedBy: "kai",
    addedByName: "Kai",
    durationMinutes: 45.1167,
  },
  {
    id: "current-tomorrowland",
    title: "Tomorrowland 2026 Mainstage W1",
    url: "https://www.youtube.com/watch?v=current",
    platform: "YouTube",
    addedBy: "dan",
    addedByName: "Dan",
    durationMinutes: 75.7,
  },
  {
    id: "upcoming-afterlife",
    title: "Afterlife Tulum 2025",
    url: "https://www.youtube.com/watch?v=upcoming-1",
    platform: "YouTube",
    addedBy: "nina",
    addedByName: "Nina",
    durationMinutes: 72.55,
  },
  {
    id: "upcoming-calvin",
    title: "Calvin Harris – Live at Ushuaïa",
    url: "https://www.youtube.com/watch?v=upcoming-2",
    platform: "YouTube",
    addedBy: "jordan",
    addedByName: "Jordan",
    durationMinutes: 59.1667,
  },
  {
    id: "upcoming-anjunadeep",
    title: "Anjunadeep Open Air 2025",
    url: "https://www.youtube.com/watch?v=upcoming-3",
    platform: "YouTube",
    addedBy: "leo",
    addedByName: "Leo",
    durationMinutes: 65.7,
  },
  {
    id: "upcoming-keinemusik",
    title: "Keinemusik Radio Show",
    url: "https://www.youtube.com/watch?v=upcoming-4",
    platform: "YouTube",
    addedBy: "max",
    addedByName: "Max",
    durationMinutes: 60.3,
  },
  {
    id: "upcoming-rufus",
    title: "RÜFÜS DU SOL – Live from LA",
    url: "https://www.youtube.com/watch?v=upcoming-5",
    platform: "YouTube",
    addedBy: "taylor",
    addedByName: "Taylor",
    durationMinutes: 67.9167,
  },
]

type PendingSetlist = {
  name: string
  items: MqsQueuePanelItem[]
  dropped: number
}

function isSafeHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === "https:" || parsed.protocol === "http:"
  } catch {
    return false
  }
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

function parseSetlist(fileName: string, raw: unknown): PendingSetlist {
  if (!raw || typeof raw !== "object") {
    throw new Error("That file is not a setlist object.")
  }

  const record = raw as { name?: unknown; segments?: unknown }
  if (!Array.isArray(record.segments) || record.segments.length === 0) {
    throw new Error("A setlist needs at least one segment.")
  }

  const source = record.segments.slice(0, SETLIST_LIMIT)
  const items = source.flatMap((segment, index) => {
    if (!segment || typeof segment !== "object") return []

    const item = segment as {
      title?: unknown
      url?: unknown
      platform?: unknown
      duration?: unknown
    }

    if (typeof item.url !== "string" || !isSafeHttpUrl(item.url)) return []

    const durationMinutes =
      typeof item.duration === "number" && Number.isFinite(item.duration)
        ? Math.max(0.1, Math.min(item.duration, 480))
        : undefined

    return [
      {
        id: `setlist-${Date.now()}-${index}`,
        title:
          typeof item.title === "string" && item.title.trim()
            ? item.title.trim()
            : item.url,
        url: item.url,
        platform:
          typeof item.platform === "string" && item.platform.trim()
            ? item.platform.trim()
            : providerFromUrl(item.url),
        addedBy: "you",
        addedByName: "You",
        durationMinutes,
      } satisfies MqsQueuePanelItem,
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

function moveItem<T>(values: T[], from: number, to: number) {
  if (from === to || from < 0 || to < 0 || from >= values.length || to >= values.length) {
    return values
  }

  const next = [...values]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function MqsPrototype() {
  const [items, setItems] = React.useState(INITIAL_ITEMS)
  const [currentIndex, setCurrentIndex] = React.useState(3)
  const [isPlaying, setIsPlaying] = React.useState(true)
  const [elapsed, setElapsed] = React.useState(32 * 60 + 18)
  const [expanded, setExpanded] = React.useState(false)
  const [pendingSetlist, setPendingSetlist] = React.useState<PendingSetlist | null>(null)
  const [stopOpen, setStopOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const add = React.useCallback(
    (url: string, durationMinutes?: number) => {
      if (!isSafeHttpUrl(url)) {
        toast.error("Use a valid http(s) media URL.")
        return
      }

      const item: MqsQueuePanelItem = {
        id: `added-${Date.now()}`,
        title: url,
        url,
        platform: providerFromUrl(url),
        addedBy: "you",
        addedByName: "You",
        durationMinutes,
      }

      setItems((current) => [...current, item])
      if (currentIndex < 0) {
        setCurrentIndex(0)
        setElapsed(0)
        setIsPlaying(false)
      }
    },
    [currentIndex]
  )

  const addNext = React.useCallback(
    (url: string, durationMinutes?: number) => {
      if (!isSafeHttpUrl(url)) {
        toast.error("Use a valid http(s) media URL.")
        return
      }

      const item: MqsQueuePanelItem = {
        id: `next-${Date.now()}`,
        title: url,
        url,
        platform: providerFromUrl(url),
        addedBy: "you",
        addedByName: "You",
        durationMinutes,
      }

      setItems((current) => {
        if (currentIndex < 0) return [item, ...current]
        const next = [...current]
        next.splice(currentIndex + 1, 0, item)
        return next
      })

      if (currentIndex < 0) {
        setCurrentIndex(0)
        setElapsed(0)
        setIsPlaying(false)
      }
    },
    [currentIndex]
  )

  const actions = React.useMemo(
    () => ({
      add,
      addNext,
      previous: () => {
        if (currentIndex <= 0) return
        setCurrentIndex((value) => value - 1)
        setElapsed(0)
      },
      pause: () => setIsPlaying(false),
      resume: () => setIsPlaying(true),
      seek: (seconds: number) => setElapsed(Math.max(0, seconds)),
      skip: () => {
        if (currentIndex < 0 || currentIndex >= items.length - 1) return
        setCurrentIndex((value) => value + 1)
        setElapsed(0)
      },
      move: (fromIndex: number, toIndex: number) => {
        if (currentIndex >= 0 && (fromIndex <= currentIndex || toIndex <= currentIndex)) return
        setItems((current) => moveItem(current, fromIndex, toIndex))
      },
      remove: (index: number) => {
        if (currentIndex >= 0 && index <= currentIndex) return
        setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))
      },
      shuffle: () => {
        setItems((current) => {
          const start = currentIndex >= 0 ? currentIndex + 1 : 0
          const prefix = current.slice(0, start)
          const upcoming = current.slice(start)
          for (let index = upcoming.length - 1; index > 0; index -= 1) {
            const swap = Math.floor(Math.random() * (index + 1))
            ;[upcoming[index], upcoming[swap]] = [upcoming[swap], upcoming[index]]
          }
          return [...prefix, ...upcoming]
        })
      },
      clearUpcoming: () => {
        setItems((current) => (currentIndex >= 0 ? current.slice(0, currentIndex + 1) : []))
      },
      stop: () => setStopOpen(true),
      toggleWebcam: () => toast("Webcam command sent"),
      toggleScreenshare: () => toast("Screenshare command sent"),
      showHelp: () => toast("Full MQS command help would open here"),
      loadSetlist: () => fileInputRef.current?.click(),
    }),
    [add, addNext, currentIndex, items.length]
  )

  return (
    <main className="dark flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <MqsQueuePanel
        items={items}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        elapsed={elapsed}
        title="Rooftop"
        expanded={expanded}
        actions={actions}
        onToggleExpand={() => setExpanded((value) => !value)}
        onContributorClick={(item) =>
          toast(`Open profile: ${item.addedByName ?? item.addedBy ?? "unknown"}`)
        }
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        aria-label="Setlist JSON file"
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0]
          event.currentTarget.value = ""
          if (!file) return

          try {
            const parsed = JSON.parse(await file.text()) as unknown
            setPendingSetlist(parseSetlist(file.name, parsed))
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not read setlist.")
          }
        }}
      />

      <Dialog open={Boolean(pendingSetlist)} onOpenChange={(open) => !open && setPendingSetlist(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load setlist</DialogTitle>
            <DialogDescription>
              {pendingSetlist
                ? `${pendingSetlist.items.length} valid segments · ${pendingSetlist.dropped} invalid or capped`
                : "Review the selected setlist before replacing the queue."}
            </DialogDescription>
          </DialogHeader>
          {pendingSetlist ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <div className="font-medium">{pendingSetlist.name}</div>
              <div className="mt-1 text-muted-foreground">
                The prototype mirrors the current pre-alpha replace-only host capability.
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingSetlist(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!pendingSetlist) return
                setItems(pendingSetlist.items)
                setCurrentIndex(0)
                setElapsed(0)
                setIsPlaying(false)
                setPendingSetlist(null)
              }}
            >
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
              This stops current playback and removes the current queue and recent history.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStopOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setItems([])
                setCurrentIndex(-1)
                setElapsed(0)
                setIsPlaying(false)
                setStopOpen(false)
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
