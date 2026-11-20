import * as React from "react"

import { BuyItemModal } from "@/components/hubzz/buy-item-modal"
import { Button } from "@/components/ui/button"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof BuyItemModal> = {
  title: "BuyItemModal",
  slug: "buy-item-modal",
  navLabel: "Buy Item Modal",
  component: BuyItemModal,
  description:
    "Buy Item purchase confirmation: item, cost, current and new balance, ported from the Figma Make Digital Merch Modal project.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/BuyItemModal.tsx.",
    "The source card is fixed white; here the card is the Dialog popover surface, so it follows the hubzzcn light and dark themes.",
    "New balance is computed from balance and cost. The coin mark uses the warning token.",
    "Item image is a host-supplied prop; without one the tile shows a coin icon.",
  ],
}

interface DemoArgs {
  triggerLabel: string
}

function BuyItemModalDemo({ triggerLabel }: DemoArgs) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <BuyItemModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export const Default: Example<DemoArgs> = {
  name: "Default",
  args: { triggerLabel: "Buy Item" },
  render: (args) => <BuyItemModalDemo {...args} />,
}

export const examples = [Default]
