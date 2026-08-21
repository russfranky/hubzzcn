import * as React from "react"

import { cn } from "@/lib/utils"

export type PresenceStatus = "online" | "idle" | "offline"

export interface PresenceIndicatorProps extends React.ComponentProps<"span"> {
  status: PresenceStatus
}

const presenceStatusConfig: Record<
  PresenceStatus,
  { color: string; label: string }
> = {
  online: { color: "#12B76A", label: "Online" },
  idle: { color: "#F59E0B", label: "Away" },
  offline: { color: "#7C878E", label: "Offline" },
}

export function PresenceIndicator({
  status,
  className,
  role = "img",
  "aria-label": ariaLabel,
  style,
  ...props
}: PresenceIndicatorProps) {
  const config = presenceStatusConfig[status]

  return (
    <span
      role={role}
      aria-label={ariaLabel ?? config.label}
      data-slot="presence-indicator"
      data-status={status}
      className={cn("inline-block size-2 shrink-0 rounded-full", className)}
      style={{ backgroundColor: config.color, ...style }}
      {...props}
    />
  )
}
