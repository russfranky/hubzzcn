import { Capsule, type CapsuleProps } from "@/components/hubzz/capsule"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof Capsule> = {
  title: "Capsule",
  component: Capsule,
  description:
    "Hubzz filter pill that delegates pressed semantics and keyboard behavior to the upstream Toggle primitive.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Use for filters and selections, not primary actions.",
    "active maps to Toggle pressed state and therefore exposes aria-pressed semantics.",
    "Use onActiveChange when the consumer owns the selected state.",
  ],
}

export const ActiveMusic: Example<CapsuleProps> = {
  name: "Active — Music",
  args: { active: true, children: "Music" },
}

export const ActiveGaming: Example<CapsuleProps> = {
  name: "Active — Gaming",
  args: { active: true, children: "Gaming" },
}

export const InactiveArt: Example<CapsuleProps> = {
  name: "Inactive — Art",
  args: { active: false, children: "Art" },
}

export const InactiveSports: Example<CapsuleProps> = {
  name: "Inactive — Sports",
  args: { active: false, children: "Sports" },
}

export const InactiveTechnology: Example<CapsuleProps> = {
  name: "Inactive — Technology",
  args: { active: false, children: "Technology" },
}

export const examples = [
  ActiveMusic,
  ActiveGaming,
  InactiveArt,
  InactiveSports,
  InactiveTechnology,
]
