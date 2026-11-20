import { Coins } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

export interface BuyItemModalProps {
  open: boolean
  onClose: () => void
  itemName?: string
  itemImageSrc?: string
  quantity?: number
  cost?: number
  balance?: number
  onBuy?: () => void
  termsHref?: string
  className?: string
}

function CoinMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-warning text-zinc-900",
        className
      )}
    >
      <Coins className="size-3 fill-current" />
    </div>
  )
}

/**
 * Buy Item purchase confirmation modal, ported from the Figma Make
 * project "Digital Merch Modal" (file 7w2KEWk6WBaOOaDQSjRd1S,
 * BuyItemModal.tsx).
 *
 * The Figma source is a fixed white card. In hubzzcn the card is the
 * Dialog popover surface, so it reads white in the light theme and dark
 * in the dark theme. The gold coin mark uses the warning token. The new
 * balance is computed from balance and cost instead of hard-coded.
 */
export function BuyItemModal({
  open,
  onClose,
  itemName = "Water Potion",
  itemImageSrc,
  quantity = 1,
  cost = 100,
  balance = 296883,
  onBuy,
  termsHref = "#",
  className,
}: BuyItemModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        className={cn("gap-0 rounded-[2rem] p-8 sm:max-w-sm", className)}
      >
        <DialogTitle className="mb-8 text-center text-2xl font-black">
          Buy Item
        </DialogTitle>

        {/* Item display */}
        <div className="mb-8 flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
              {itemImageSrc ? (
                <img
                  src={itemImageSrc}
                  alt={itemName}
                  className="h-16 w-16 object-contain"
                />
              ) : (
                <Coins className="size-8 text-muted-foreground" />
              )}
            </div>
            <div className="absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-popover bg-foreground text-xs font-bold text-background">
              x{quantity}
            </div>
          </div>
          <div>
            <div className="mb-1 text-lg font-extrabold text-popover-foreground">
              {itemName}
            </div>
            <div className="flex items-center gap-1.5 font-bold text-popover-foreground">
              <CoinMark className="h-5 w-5" />
              {cost.toLocaleString()}
            </div>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* Transaction details */}
        <div className="mb-4 space-y-3">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-popover-foreground">Current Balance</span>
            <div className="flex items-center gap-1.5">
              <CoinMark className="h-4 w-4 [&_svg]:size-2.5" />
              <span>{balance.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold">
            <span className="text-popover-foreground">Item Cost</span>
            <span className="text-destructive">-{cost.toLocaleString()}</span>
          </div>
        </div>

        <Separator className="mb-4" />

        {/* New balance */}
        <div className="mb-8 flex items-center justify-between text-base font-bold">
          <span className="text-popover-foreground">New Balance</span>
          <div className="flex items-center gap-1.5">
            <CoinMark className="h-5 w-5" />
            <span>{(balance - cost).toLocaleString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onBuy?.()
              onClose()
            }}
          >
            Buy Item
          </Button>
        </div>

        {/* Footer link */}
        <div className="text-center">
          <a
            href={termsHref}
            className="text-xs text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Terms &amp; Conditions
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}
