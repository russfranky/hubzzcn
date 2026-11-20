import * as React from "react"
import { ShoppingBag, Sparkles, Users, Zap } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

export interface MerchItem {
  id: string
  title: string
  description: string
  price: number
  badge?: string
  /** CSS background for the item card artwork surface. */
  gradient?: string
}

export interface MerchModalProps {
  open: boolean
  onClose: () => void
  storeName?: string
  storeDescription?: string
  coverSrc?: string
  avatarSrc?: string
  items?: MerchItem[]
  initialBalance?: number
  onPurchase?: (item: MerchItem) => void
  onEarnMore?: () => void
  className?: string
}

const DEFAULT_GRADIENTS = [
  "linear-gradient(to bottom right, #f3eee2, #def0d6 70%)",
  "linear-gradient(to bottom right, #e0c6ff, #ffe1fa 70%)",
  "linear-gradient(to bottom right, #e2f3e9, #e0f8ff 70%)",
]

const DEFAULT_ITEMS: MerchItem[] = [
  {
    id: "1",
    title: "Avatar Frame",
    description: "Exclusive animated border for your profile",
    price: 500,
    badge: "Exclusive",
    gradient: DEFAULT_GRADIENTS[0],
  },
  {
    id: "2",
    title: "Chat Badge",
    description: "Stand out with a unique chat badge",
    price: 250,
    badge: "New",
    gradient: DEFAULT_GRADIENTS[1],
  },
  {
    id: "3",
    title: "Profile Theme",
    description: "Customize your profile with premium themes",
    price: 750,
    badge: "Limited",
    gradient: DEFAULT_GRADIENTS[2],
  },
  {
    id: "4",
    title: "Emote Pack",
    description: "Unlock exclusive animated emotes",
    price: 400,
    badge: "New",
    gradient: DEFAULT_GRADIENTS[0],
  },
]

/**
 * Digital Merch store modal, ported from the Figma Make project
 * "Digital Merch Modal" (file 7w2KEWk6WBaOOaDQSjRd1S, MerchModal.tsx).
 *
 * Structure, copy, and item data come from the Figma source. The shell is
 * hubzzcn's Dialog and every color is a hubzzcn semantic token, so the
 * modal follows the catalog light and dark themes. Item cards keep their
 * pastel artwork gradients from the source; text on those cards stays
 * dark in both themes, like the EventTicket artwork surface.
 *
 * The source toasted purchase results through sonner. This port keeps
 * feedback in the component instead: a bought item reads Owned, and an
 * item the balance cannot cover is disabled. Hosts that want a toast
 * can render one from onPurchase.
 */
export function MerchModal({
  open,
  onClose,
  storeName = "RetrosDoges",
  storeDescription = "This group is like lorem ipsum dolor sit amet is professional dummy text",
  coverSrc,
  avatarSrc,
  items = DEFAULT_ITEMS,
  initialBalance = 2500,
  onPurchase,
  onEarnMore,
  className,
}: MerchModalProps) {
  const [balance, setBalance] = React.useState(initialBalance)
  const [purchasedIds, setPurchasedIds] = React.useState<string[]>([])

  const handlePurchase = (item: MerchItem) => {
    if (balance < item.price || purchasedIds.includes(item.id)) return
    setBalance((prev) => prev - item.price)
    setPurchasedIds((prev) => [...prev, item.id])
    onPurchase?.(item)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        className={cn(
          "max-h-[90dvh] gap-0 overflow-x-hidden overflow-y-auto p-0 sm:max-w-[48rem]",
          className
        )}
      >
        {/* Header banner */}
        <div className="relative h-64 shrink-0 p-4 md:h-44">
          {coverSrc ? (
            <img
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              src={coverSrc}
            />
          ) : (
            <div className="absolute inset-0 [background:var(--primary-gradient)]" />
          )}
          <div className="relative inline-flex items-center rounded-lg bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
            <ShoppingBag className="mr-2 inline-flex size-3" />
            Merch Store
          </div>
        </div>

        {/* Content */}
        <div className="relative -mt-10 px-10 pt-0 pb-16 md:px-5 md:pb-10">
          {/* Avatar */}
          <div className="relative mb-6 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.25rem]">
            {avatarSrc ? (
              <img
                alt={storeName}
                className="absolute inset-0 h-full w-full object-cover"
                src={avatarSrc}
              />
            ) : (
              <div className="absolute inset-0 [background:var(--primary-gradient)]" />
            )}
            {!avatarSrc && (
              <Sparkles className="relative size-8 text-primary-foreground" />
            )}
          </div>

          {/* Title and community badge */}
          <div className="mb-2 flex items-center gap-2">
            <DialogTitle className="text-[2rem] leading-10 font-semibold tracking-tight">
              {storeName}
            </DialogTitle>
            <div className="inline-flex items-center rounded border border-border px-2 py-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                Community
              </span>
            </div>
          </div>

          <DialogDescription className="mb-6 text-base text-muted-foreground">
            {storeDescription}
          </DialogDescription>

          <Separator className="mb-8 md:mb-5" />

          <div className="mb-6 font-semibold text-popover-foreground">
            Available items
          </div>

          {/* Carousel */}
          <div className="-mr-10 flex [scrollbar-width:none] overflow-auto scroll-smooth after:w-10 after:shrink-0 md:-mr-5 md:after:w-5 [&::-webkit-scrollbar]:hidden">
            {items.map((item) => {
              const owned = purchasedIds.includes(item.id)
              const canAfford = balance >= item.price
              return (
                <div
                  key={item.id}
                  className="relative mr-6 w-60 shrink-0 rounded-2xl p-6 md:mr-3"
                  style={{ backgroundImage: item.gradient }}
                >
                  {item.badge && (
                    <div className="absolute top-2 right-2 flex h-5 items-center rounded-lg bg-zinc-900 px-3 text-xs font-semibold text-white">
                      {item.badge}
                    </div>
                  )}
                  <div className="mb-1 text-base font-semibold text-zinc-900">
                    {item.title}
                  </div>
                  <div className="mb-4 text-xs text-zinc-900/70">
                    {item.description}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 font-semibold text-zinc-900">
                      <Zap className="size-4 fill-current" />
                      {item.price} XP
                    </div>
                    <Button
                      size="sm"
                      className="rounded-lg"
                      disabled={owned || !canAfford}
                      onClick={() => handlePurchase(item)}
                    >
                      {owned ? "Owned" : "Buy"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Balance bar */}
        <div className="relative mx-auto w-full max-w-[66.5rem] shrink-0 px-10 pb-8 md:px-5 md:pb-5">
          <div className="rounded-xl p-px [background:var(--primary-gradient)]">
            <div className="relative flex min-h-16 items-center justify-between rounded-[0.6875rem] bg-popover px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-[0.625rem] bg-secondary">
                  <Zap className="size-5 fill-current text-secondary-foreground" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Your Balance
                  </div>
                  <div className="font-semibold text-popover-foreground">
                    {balance} XP
                  </div>
                </div>
              </div>
              <Button onClick={onEarnMore}>Earn More XP</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
