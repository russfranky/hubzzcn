import * as React from "react"

import { TermsModal } from "@/components/hubzz/terms-modal"
import { Button } from "@/components/ui/button"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof TermsModal> = {
  title: "TermsModal",
  slug: "terms-modal",
  navLabel: "Terms Modal",
  component: TermsModal,
  description:
    "Terms of Use modal with scrollable legal copy and a Close action, ported from the Figma Make Digital Merch Modal project.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/TermsModal.tsx.",
    "Legal copy is carried over from the source as-is, including the sections the source itself abbreviates.",
    "Shell and colors are hubzzcn Dialog and semantic tokens.",
  ],
}

interface DemoArgs {
  triggerLabel: string
}

function TermsModalDemo({ triggerLabel }: DemoArgs) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <TermsModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export const Default: Example<DemoArgs> = {
  name: "Default",
  args: { triggerLabel: "Terms of Use" },
  render: (args) => <TermsModalDemo {...args} />,
}

export const examples = [Default]
