import type { Participant } from "@/lib/stage/types"
import { StageParticipant } from "./StageParticipant"

export function StageSpotlight({
  active,
  others,
  outputMuted = false,
  onSelect,
}: {
  active: Participant | null
  others: Participant[]
  outputMuted?: boolean
  onSelect?: (id: string) => void
}) {
  return (
    <div className="relative h-full w-full overflow-hidden">
      {active?.avatar ? (
        <img
          src={active.avatar}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className="pointer-events-none absolute inset-0 size-full scale-110 object-cover"
        />
      ) : (
        <div className="bg-stage-bg absolute inset-0" />
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(0,0,0,0.4) 3px)",
        }}
      />
      <div className="from-stage-bg pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b to-transparent" />

      <div className="relative z-10 overflow-x-auto px-4 pt-4 pb-28 sm:px-8 sm:pt-6">
        <div className="flex w-max min-w-full items-start justify-start gap-4 sm:justify-center sm:gap-6">
          {others.map((p) => (
            <StageParticipant
              key={p.id}
              participant={p}
              size="sm"
              outputMuted={outputMuted}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
