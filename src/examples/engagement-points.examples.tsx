import {
  EngagementPoints,
  type EngagementPointsProps,
} from "@/components/hubzz/engagement-points"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof EngagementPoints> = {
  title: "EngagementPoints",
  slug: "engagement-points",
  navLabel: "Engagement points",
  component: EngagementPoints,
  description:
    "Interactive Hubzz engagement points dashboard built from shadcn kit primitives — balance, season chart, earn ways, and activity history.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Catalog demo uses the kit primitives version (same UI as ?prototype=points-kit).",
    "The Figma-port prototype remains at ?prototype=points and is unchanged.",
    "Host surfaces own dark shell chrome; the component renders the dashboard body.",
  ],
}

export const Default: Example<EngagementPointsProps> = {
  name: "Dashboard",
  args: {},
  render: () => (
    <div className="w-full overflow-x-auto rounded-lg bg-[#0E0F12] text-[#c7d2da]">
      <EngagementPoints className="px-6 py-8" />
    </div>
  ),
}

export const examples = [Default]
