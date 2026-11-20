import * as React from "react"

import { MerchModal } from "@/components/hubzz/merch-modal"
import { Button } from "@/components/ui/button"
import type { Example, Meta } from "./types"

const asset = (path: string) =>
  `${import.meta.env?.BASE_URL ?? "/"}${path.replace(/^\//, "")}`

export const meta: Meta<typeof MerchModal> = {
  title: "MerchModal",
  slug: "merch-modal",
  navLabel: "Merch Modal",
  component: MerchModal,
  description:
    "Digital Merch store modal: banner, store identity, XP item carousel, and balance bar, ported from the Figma Make Digital Merch Modal project.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/MerchModal.tsx.",
    "Shell and colors are hubzzcn Dialog and semantic tokens; only the item card artwork gradients keep the source pastel values.",
    "Balance and purchase state are internal, seeded by initialBalance; purchases report through onPurchase; a bought item reads Owned and unaffordable items disable.",
    "Cover and avatar are host-supplied image props; without them the modal renders the primary gradient.",
  ],
}

interface DemoArgs {
  triggerLabel: string
}

function MerchModalDemo({ triggerLabel }: DemoArgs) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <MerchModal
        open={open}
        onClose={() => setOpen(false)}
        coverSrc={asset("space-thumbs/retrodoges.jpg")}
        avatarSrc={asset("avatars/a1.png")}
      />
    </>
  )
}

export const Default: Example<DemoArgs> = {
  name: "Default",
  args: { triggerLabel: "Open Merch Store" },
  render: (args) => <MerchModalDemo {...args} />,
}

export const examples = [Default]
