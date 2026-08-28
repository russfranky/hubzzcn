import { TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

export function StageLeaveConfirm({
  open,
  alreadyAudience = false,
  onCancel,
  onConfirm,
}: {
  open: boolean
  alreadyAudience?: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="border-stage-raised bg-stage-panel text-stage-fg w-[min(92vw,22rem)] gap-0 overflow-hidden rounded-xl border p-0 shadow-[0_24px_32px_-16px_rgb(0_0_0_/_0.5)]"
      >
        <div className="flex flex-col items-center gap-8 px-6 pt-11 pb-6">
          <span className="border-stage-line/25 bg-stage-line flex size-16 items-center justify-center rounded-full border-8">
            <TriangleAlert
              className="text-stage-fg size-10"
              strokeWidth={1.5}
            />
          </span>
          <div className="space-y-2 text-center">
            <DialogTitle className="text-stage-fg text-lg font-semibold text-balance">
              Are you sure you want to leave?
            </DialogTitle>
            <DialogDescription className="text-stage-muted text-sm text-pretty">
              {alreadyAudience
                ? "You'll stay in the audience. Raise your hand to request the stage again."
                : "You can join the stage again but you must be approved."}
            </DialogDescription>
          </div>
        </div>
        <div className="border-stage-raised flex gap-4 border-t px-6 py-4">
          <Button
            variant="outline"
            className="border-stage-line text-stage-fg hover:bg-stage-raised hover:text-stage-fg h-12 flex-1 rounded-full bg-transparent"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            className="bg-stage-leave text-stage-fg hover:bg-stage-leave/90 hover:text-stage-fg h-12 flex-1 rounded-full"
            onClick={onConfirm}
          >
            Leave anyway
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
