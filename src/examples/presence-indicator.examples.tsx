import {
  PresenceIndicator,
  type PresenceIndicatorProps,
  type PresenceStatus,
} from "@/components/hubzz/presence-indicator"
import type { Example, Meta } from "./types"

const statuses: PresenceStatus[] = ["online", "idle", "offline"]
const labels: Record<PresenceStatus, string> = {
  online: "Online",
  idle: "Away",
  offline: "Offline",
}

export const meta: Meta<typeof PresenceIndicator> = {
  title: "PresenceIndicator",
  slug: "presence-indicator",
  navLabel: "Presence Indicator",
  component: PresenceIndicator,
  description:
    "Stateless Hubzz presence dot that centralizes online, away, and offline semantics across product surfaces.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Host code owns positioning, halo, border, and presence state.",
    "Use className to size the dot for the local surface instead of adding size variants.",
    "The component supplies the canonical accessible label unless aria-label is overridden.",
  ],
}

export const Online: Example<PresenceIndicatorProps> = {
  name: "Online",
  args: { status: "online" },
}

export const AllStatuses: Example<PresenceIndicatorProps> = {
  name: "All statuses",
  args: { status: "online" },
  render: () => (
    <div className="flex items-center gap-6">
      {statuses.map((status) => (
        <div key={status} className="flex items-center gap-2 text-sm">
          <PresenceIndicator status={status} />
          <span>{labels[status]}</span>
        </div>
      ))}
    </div>
  ),
}

export const HostSized: Example<PresenceIndicatorProps> = {
  name: "Host sized",
  args: {
    status: "idle",
    className: "size-3",
    "aria-label": "Away from keyboard",
  },
}

export const examples = [Online, AllStatuses, HostSized]
