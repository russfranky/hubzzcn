import * as React from "react"

import { HBXModal } from "@/components/hubzz/hbx-modal"
import { Button } from "@/components/ui/button"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof HBXModal> = {
  title: "HBXModal",
  slug: "hbx-modal",
  navLabel: "HBX Modal",
  component: HBXModal,
  description:
    "'What is HBX?' explainer modal with Unlock perks and Collect moments cards, ported from the Figma Make Digital Merch Modal project.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/HBXModal.tsx.",
    "Copy is the Figma source copy. Shell and colors are hubzzcn Dialog and semantic tokens.",
    "Card actions report through onGoToQuests and onViewStubs; the source buttons were inert.",
  ],
}

interface DemoArgs {
  triggerLabel: string
}

function HBXModalDemo({ triggerLabel }: DemoArgs) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <HBXModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export const Default: Example<DemoArgs> = {
  name: "Default",
  args: { triggerLabel: "What is HBX?" },
  render: (args) => <HBXModalDemo {...args} />,
}

export const examples = [Default]
