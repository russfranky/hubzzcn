import type { MqsQueueItem } from "@/components/hubzz/mqs-queue-window"
import { mqsDurationSeconds } from "../components/hubzz/mqs-timing.ts"

export type MqsDemoSnapshot = {
  items: MqsQueueItem[]
  currentIndex: number
  isPlaying: boolean
  elapsed: number
  isMuted: boolean
}

export const MQS_DEMO_SEGMENT_LIMIT = 500

function validPosition(index: number, length: number) {
  return Number.isSafeInteger(index) && index >= 0 && index < length
}

/** Pure host transition. Never place side effects or random IDs here. */
export function applyMqsDemoCommand(
  current: MqsDemoSnapshot,
  command: string
): MqsDemoSnapshot {
  const active = validPosition(current.currentIndex, current.items.length)
    ? current.items[current.currentIndex]
    : undefined

  if (command === "--mute") return { ...current, isMuted: true }
  if (command === "--unmute") return { ...current, isMuted: false }
  if (command === "--pause") return { ...current, isPlaying: false }
  if (command === "--resume") {
    return active ? { ...current, isPlaying: true } : current
  }

  if (command === "--prev" || command === "--skip") {
    const index = current.currentIndex + (command === "--prev" ? -1 : 1)
    if (!active || !validPosition(index, current.items.length)) return current
    return { ...current, currentIndex: index, elapsed: 0 }
  }

  if (command === "--clearqueue") {
    return {
      ...current,
      items: active ? [active] : [],
      currentIndex: active ? 0 : -1,
      elapsed: active ? current.elapsed : 0,
      isPlaying: Boolean(active) && current.isPlaying,
    }
  }

  const seek = /^--seek\s+(\d+)$/.exec(command)
  if (seek) {
    const seconds = Number(seek[1])
    const duration = mqsDurationSeconds(active)
    if (duration === null || !Number.isSafeInteger(seconds)) return current
    return { ...current, elapsed: Math.min(seconds, duration) }
  }

  const remove = /^--remove\s+(\d+)$/.exec(command)
  if (remove) {
    const index = Number(remove[1]) - 1
    if (!validPosition(index, current.items.length)) return current
    const items = current.items.filter((_, position) => position !== index)
    const removedActive = active !== undefined && index === current.currentIndex
    // Removing the active row chooses its successor, or the predecessor at tail.
    const currentIndex = removedActive
      ? Math.min(index, items.length - 1)
      : active
        ? items.findIndex((item) => item.id === active.id)
        : -1
    return {
      ...current,
      items,
      currentIndex,
      elapsed: removedActive || currentIndex < 0 ? 0 : current.elapsed,
      isPlaying: currentIndex >= 0 && current.isPlaying,
    }
  }

  const move = /^--move\s+(\d+)\s+(\d+)$/.exec(command)
  if (move) {
    const from = Number(move[1]) - 1
    const to = Number(move[2]) - 1
    if (
      !validPosition(from, current.items.length) ||
      !validPosition(to, current.items.length) ||
      from === to
    ) {
      return current
    }
    const items = [...current.items]
    const [moved] = items.splice(from, 1)
    items.splice(to, 0, moved)
    return {
      ...current,
      items,
      currentIndex: active
        ? items.findIndex((item) => item.id === active.id)
        : -1,
    }
  }

  return current
}

type SetlistResult =
  | { ok: true; items: MqsQueueItem[]; skipped: number }
  | { ok: false; error: string }

/** Demo-only validation; the portable view still forwards parsed JSON unchanged. */
export function parseMqsDemoSetlist(
  value: unknown,
  batchId: string
): SetlistResult {
  const segments =
    value && typeof value === "object"
      ? (value as { segments?: unknown }).segments
      : undefined
  if (!Array.isArray(segments) || segments.length === 0) {
    return { ok: false, error: "The setlist needs a nonempty segments array." }
  }
  if (segments.length > MQS_DEMO_SEGMENT_LIMIT) {
    return {
      ok: false,
      error: "The demo accepts at most 500 setlist segments.",
    }
  }

  const items: MqsQueueItem[] = []
  for (let index = 0; index < segments.length; index += 1) {
    const segment: unknown = segments[index]
    if (!segment || typeof segment !== "object" || Array.isArray(segment))
      continue
    const candidate = segment as Record<string, unknown>
    const type =
      candidate.type === "youtube" ||
      candidate.type === "twitch" ||
      candidate.type === "kick" ||
      candidate.type === "native" ||
      candidate.type === "webcam" ||
      candidate.type === "screenshare"
        ? candidate.type
        : "website"
    const local =
      type === "native" || type === "webcam" || type === "screenshare"
    const url = typeof candidate.url === "string" ? candidate.url.trim() : ""
    if (url || !local) {
      try {
        const parsed = new URL(url)
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:")
          continue
      } catch {
        continue
      }
    }
    const durationMode =
      candidate.durationMode === "percent" || candidate.durationMode === "fill"
        ? candidate.durationMode
        : "fixed"
    const duration =
      typeof candidate.duration === "number" ? candidate.duration : undefined
    const timing = { duration, durationMode }
    items.push({
      id: `setlist-${batchId}-${index}`,
      type,
      url,
      title:
        typeof candidate.title === "string" && candidate.title.trim()
          ? candidate.title.trim()
          : url || "Untitled media",
      platform:
        typeof candidate.platform === "string" && candidate.platform.trim()
          ? candidate.platform.trim()
          : type.toUpperCase(),
      duration: mqsDurationSeconds(timing) === null ? undefined : duration,
      durationMode,
      addedBy: "setlist",
      addedByName: "Setlist",
    })
  }
  return items.length > 0
    ? { ok: true, items, skipped: segments.length - items.length }
    : { ok: false, error: "The setlist has no supported media segments." }
}

export function replaceMqsDemoSetlist(
  current: MqsDemoSnapshot,
  items: MqsQueueItem[]
): MqsDemoSnapshot {
  if (items.length === 0) return current
  return {
    ...current,
    items: [...items],
    currentIndex: 0,
    isPlaying: true,
    elapsed: 0,
  }
}
