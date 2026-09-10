import * as React from "react"
import { toast } from "sonner"

import {
  MqsQueueWindow,
  type MqsQueueItem,
} from "@/components/hubzz/mqs-queue-window"
import { Button } from "@/components/ui/button"
import {
  applyMqsDemoCommand,
  parseMqsDemoSetlist,
  replaceMqsDemoSetlist,
  type MqsDemoSnapshot,
} from "./mqs-demo-state"

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
  const [snapshot, setSnapshot] = React.useState<MqsDemoSnapshot>({
    items: INITIAL_ITEMS,
    currentIndex: 1,
    isPlaying: true,
    elapsed: 32 * 60 + 18,
    isMuted: false,
  })
  const importToastId = React.useId()

  React.useEffect(
    () => () => {
      toast.dismiss(importToastId)
    },
    [importToastId]
  )

  const handleCommand = React.useCallback((command: string) => {
    setLastCommand(command)
    setSnapshot((current) => applyMqsDemoCommand(current, command))
  }, [])

  const handleImport = React.useCallback(
    (value: unknown) => {
      // Generate identities once per accepted request, never inside a state updater.
      const result = parseMqsDemoSetlist(value, crypto.randomUUID())
      if (!result.ok) throw new Error(result.error)
      toast.dismiss(importToastId)
      if (result.skipped > 0) {
        toast.warning("Some setlist segments were skipped", {
          id: importToastId,
          description: `${result.skipped} invalid segments were not loaded.`,
        })
      }
      setSnapshot((current) => replaceMqsDemoSetlist(current, result.items))
      setLastCommand("")
    },
    [importToastId]
  )

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
