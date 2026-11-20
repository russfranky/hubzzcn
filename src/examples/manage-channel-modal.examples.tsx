import * as React from "react"

import { ManageChannelModal } from "@/components/hubzz/manage-channel-modal"
import { Button } from "@/components/ui/button"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof ManageChannelModal> = {
  title: "ManageChannelModal",
  slug: "manage-channel-modal",
  navLabel: "Manage Channel Modal",
  component: ManageChannelModal,
  description:
    "Manage group menu modal with six channel administration rows, ported from the Figma Make Digital Merch Modal project.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/ManageChannelModal.tsx.",
    "Rows report through onSelect with a stable item id; the source rows only logged to the console.",
    "Shell and colors are hubzzcn Dialog and semantic tokens.",
  ],
}

interface DemoArgs {
  triggerLabel: string
}

function ManageChannelModalDemo({ triggerLabel }: DemoArgs) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <ManageChannelModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export const Default: Example<DemoArgs> = {
  name: "Default",
  args: { triggerLabel: "Manage Channel" },
  render: (args) => <ManageChannelModalDemo {...args} />,
}

export const examples = [Default]
