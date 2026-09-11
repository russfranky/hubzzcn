import type { PortalSpace } from "@/lib/portal/types"

export function PortalHud({ current }: { current: PortalSpace }) {
  return (
    <div className="pointer-events-none absolute top-4 left-4 z-20">
      <div
        role="status"
        aria-label="Current space"
        className="rounded-lg border border-border bg-card/90 px-3 py-2 text-sm font-semibold text-card-foreground backdrop-blur-sm"
      >
        {current.title}
      </div>
    </div>
  )
}
