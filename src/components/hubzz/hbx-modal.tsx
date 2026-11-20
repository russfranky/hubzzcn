import { Sparkles, Ticket } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

export interface HBXModalProps {
  open: boolean
  onClose: () => void
  onGoToQuests?: () => void
  onViewStubs?: () => void
  className?: string
}

/**
 * "What is HBX?" explainer modal, ported from the Figma Make project
 * "Digital Merch Modal" (file 7w2KEWk6WBaOOaDQSjRd1S, HBXModal.tsx).
 *
 * Copy and the two-card layout come from the Figma source. The shell is
 * hubzzcn's Dialog and every color is a hubzzcn semantic token; the hero
 * glow uses the primary gradient family instead of the source hex pair.
 */
export function HBXModal({
  open,
  onClose,
  onGoToQuests,
  onViewStubs,
  className,
}: HBXModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        className={cn(
          "max-h-[90dvh] gap-0 overflow-y-auto p-8 sm:max-w-[48rem] md:p-10",
          className
        )}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          {/* Hero */}
          <div className="relative mb-8">
            <div className="relative mx-auto mb-5 flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/40 to-accent opacity-60 blur-xl" />
              <Sparkles className="relative z-10 size-12 fill-warning/20 text-warning" />
            </div>
            <DialogTitle className="mb-4 text-3xl font-bold md:text-4xl">
              What is HBX?
            </DialogTitle>
            <DialogDescription className="mb-4 text-lg leading-relaxed">
              HBX is your experience score. Earn it by attending events,
              completing quests, and contributing in ways that help the room.
              HBX can&rsquo;t be sold. It simply unlocks perks, tools, and
              sponsored actions as you show up.
            </DialogDescription>
            <p className="text-sm font-medium text-muted-foreground/70">
              Tip: stay 10+ minutes in an event to claim your Ticket Stub.
            </p>
          </div>

          {/* Cards */}
          <div className="grid w-full grid-cols-1 items-stretch gap-6 md:grid-cols-[1fr_auto_1fr]">
            <div className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-6 text-left transition-colors hover:border-muted-foreground/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-foreground">
                <Sparkles className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-popover-foreground">
                Unlock perks
              </h3>
              <p className="mb-6 flex-grow text-muted-foreground">
                Hit HBX milestones to unlock creation tools, hosting privileges,
                and higher access tiers.
              </p>
              <Button
                className="w-full"
                data-bi-key="hbx_intro_go_to_quests"
                onClick={onGoToQuests}
              >
                Go to quests
              </Button>
            </div>

            <Separator
              orientation="vertical"
              className="mx-auto hidden self-stretch md:block"
            />
            <Separator className="w-full md:hidden" />

            <div className="flex h-full flex-col rounded-2xl border border-border bg-secondary p-6 text-left transition-colors hover:border-muted-foreground/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-foreground">
                <Ticket className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-popover-foreground">
                Collect moments
              </h3>
              <p className="mb-6 flex-grow text-muted-foreground">
                Events mint Ticket Stubs as proof you were there. Stubs unlock
                recordings, drops, badges, and exclusive items.
              </p>
              <Button
                variant="secondary"
                className="w-full border border-border"
                data-bi-key="hbx_intro_view_stubs"
                onClick={onViewStubs}
              >
                View Ticket Stubs
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
