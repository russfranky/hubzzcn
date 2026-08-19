import { Capsule, type CapsuleProps } from "@/components/ui/capsule"
import type { Meta, Example } from "./types"

export const meta: Meta<typeof Capsule> = {
  title: "Capsule",
  // slug defaults to "capsule" — matches existing #capsule anchor, no override needed
  component: Capsule,
  description:
    "Filter pill for category/tag selection. Active state is high-contrast white; inactive is muted.",
  category: "hubzz",
  notes: [
    "hover:bg-[#2E3238] is an intentional UX addition — the design spec has no hover state. Do not revert.",
    "Use for filters and tags only — not for actions (use Button instead).",
  ],
}

// Active examples: exactly 2 — Playwright tests assert toHaveCount(2) for text-[#FCFDFE] buttons
export const ActiveMusic: Example<CapsuleProps> = {
  name: "Active — Music",
  args: { active: true, children: "Music" },
}

export const ActiveGaming: Example<CapsuleProps> = {
  name: "Active — Gaming",
  args: { active: true, children: "Gaming" },
}

// Inactive examples: exactly 3 — Playwright tests assert toHaveCount(3) for text-[#ACB9C4] buttons
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

export const examples = [ActiveMusic, ActiveGaming, InactiveArt, InactiveSports, InactiveTechnology]
