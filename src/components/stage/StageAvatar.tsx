import { cn } from "@/lib/utils"
import type { Participant } from "@/lib/stage/types"

export const CHIP: Record<Participant["chip"], string> = {
  rose: "bg-stage-chip-rose text-stage-panel",
  sky: "bg-stage-chip-sky text-stage-panel",
  violet: "bg-stage-chip-violet text-stage-panel",
  slate: "bg-stage-chip-slate text-stage-panel",
  amber: "bg-stage-chip-amber text-stage-panel",
}

export function StageAvatar({
  src,
  alt = "",
  initials,
  chip,
  eager = false,
  className,
}: {
  src?: string
  alt?: string
  initials?: string
  chip?: Participant["chip"]
  eager?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        "relative block size-full overflow-hidden rounded-full",
        chip ? CHIP[chip] : null,
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          className="size-full object-cover"
        />
      ) : (
        <span className="flex size-full items-center justify-center text-xs font-semibold sm:text-lg">
          {initials}
        </span>
      )}
    </span>
  )
}
