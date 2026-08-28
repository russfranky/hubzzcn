import type { Participant } from "@/lib/stage/types"
import { StageParticipant } from "./StageParticipant"

export function StageGrid({
  participants,
  outputMuted = false,
  onSelect,
}: {
  participants: Participant[]
  outputMuted?: boolean
  onSelect?: (id: string) => void
}) {
  if (participants.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-stage-muted text-sm font-medium">No one on stage</p>
        <p className="text-stage-muted/70 text-xs">
          Waiting for a host to start.
        </p>
      </div>
    )
  }

  return (
    <div className="stage-grid h-full w-full overflow-y-auto">
      <div className="stage-grid-list">
        {participants.map((p) => (
          <StageParticipant
            key={p.id}
            participant={p}
            size="md"
            outputMuted={outputMuted}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
