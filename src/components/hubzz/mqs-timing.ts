/** Timing safeguards shared by the snapshot view and its local demo host. */
export function mqsDurationSeconds(item?: {
  duration?: number
  durationMode?: string
}): number | null {
  if (
    !item ||
    (item.durationMode !== undefined && item.durationMode !== "fixed") ||
    typeof item.duration !== "number" ||
    !Number.isFinite(item.duration) ||
    item.duration <= 0
  ) {
    return null
  }
  const seconds = Math.round(item.duration * 60)
  return Number.isSafeInteger(seconds) && seconds > 0 ? seconds : null
}

export function clampMqsElapsed(value: number, duration: number | null) {
  const seconds = Number.isFinite(value)
    ? Math.min(Number.MAX_SAFE_INTEGER, Math.max(0, Math.floor(value)))
    : 0
  return duration === null ? seconds : Math.min(seconds, duration)
}
