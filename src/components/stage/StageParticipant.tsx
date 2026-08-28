import type { ReactNode } from "react"
import { MicOff, Video } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Participant } from "@/lib/stage/types"
import { StageAvatar } from "./StageAvatar"

type Size = "sm" | "md" | "lg"

const DIM: Record<Size, string> = {
  sm: "size-16 sm:size-[4.5rem]",
  md: "stage-head-md",
  lg: "mx-auto aspect-square size-32 sm:size-40 lg:size-[12.5rem]",
}

const NAME: Record<Size, string> = {
  sm: "max-w-16 truncate text-[11px] leading-tight sm:max-w-[4.5rem] sm:text-xs",
  md: "stage-name-md",
  lg: "max-w-full truncate text-base sm:text-xl",
}

const FRAME: Record<Size, string> = {
  sm: "flex min-w-0 shrink-0 flex-col items-center gap-1 overflow-visible px-0.5 py-1 text-center",
  md: "flex min-w-0 w-full flex-col items-center gap-1.5 overflow-visible py-1 text-center sm:gap-2",
  lg: "flex min-w-0 w-full flex-col items-center gap-2 overflow-visible px-2 py-2 text-center",
}

const MUTE_RING: Record<Size, string> = {
  sm: "ring-2",
  md: "ring-2 sm:ring-[3px]",
  lg: "ring-[3.5px]",
}

const SPEAK_INSET: Record<Size, string> = {
  sm: "-5px",
  md: "-5.5%",
  lg: "-5.5%",
}

const SPEAK_BORDER: Record<Size, string> = {
  sm: "border-2",
  md: "border-2 lg:border-[2.5px]",
  lg: "border-[2.5px]",
}

function StatusChip({
  size,
  label,
  children,
}: {
  size: Size
  label: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        "bg-stage-panel ring-stage-bg absolute flex items-center justify-center rounded-full",
        MUTE_RING[size],
        label === "Muted" ? "text-stage-muted" : "text-stage-fg"
      )}
      style={{ width: "22%", height: "22%", right: "6%", bottom: "6%" }}
      aria-hidden
    >
      {children}
    </span>
  )
}

export function StageParticipant({
  participant,
  size = "md",
  showName = true,
  outputMuted = false,
  onSelect,
}: {
  participant: Participant
  size?: Size
  showName?: boolean
  outputMuted?: boolean
  onSelect?: (id: string) => void
}) {
  const speaking =
    participant.isSpeaking && !participant.isMuted && !outputMuted
  const initials = participant.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const body = (
    <>
      <span className={cn("relative overflow-visible", DIM[size])}>
        {speaking ? (
          <span
            className={cn(
              "border-stage-speak pointer-events-none absolute rounded-full border-solid",
              SPEAK_BORDER[size]
            )}
            style={{ inset: SPEAK_INSET[size] }}
            aria-hidden
          />
        ) : null}
        <span className="relative block size-full">
          <StageAvatar
            src={participant.avatar}
            initials={initials}
            chip={participant.chip}
          />
          <span
            aria-hidden
            className="stage-photo-line pointer-events-none absolute inset-0 rounded-full"
          />
        </span>
        {participant.isMuted ? (
          <StatusChip size={size} label="Muted">
            <MicOff className="size-[55%]" strokeWidth={1.75} />
          </StatusChip>
        ) : participant.videoOn ? (
          <StatusChip size={size} label="Camera on">
            <Video className="size-[55%]" strokeWidth={1.75} />
          </StatusChip>
        ) : null}
      </span>
      {showName ? (
        <span className={cn("text-stage-fg font-medium", NAME[size])}>
          {participant.name}
        </span>
      ) : null}
    </>
  )

  const label = [
    participant.name,
    speaking ? "speaking" : null,
    participant.isMuted ? "muted" : null,
    participant.videoOn ? "camera on" : null,
    onSelect ? "spotlight" : null,
  ]
    .filter(Boolean)
    .join(", ")

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(participant.id)}
        className={FRAME[size]}
        aria-label={label}
      >
        {body}
      </button>
    )
  }

  return (
    <div className={FRAME[size]} role="group" aria-label={label}>
      {body}
    </div>
  )
}
