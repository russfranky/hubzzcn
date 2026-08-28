import type { ReactNode } from "react"

import { IconArrowSquareRight } from "./DockIcons"

export function StageRailHeader({
  title,
  closeLabel,
  onClose,
  actionLabel,
  onAction,
  action,
}: {
  title: string
  closeLabel: string
  onClose: () => void
  actionLabel: string
  onAction: () => void
  action: ReactNode
}) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-4">
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="text-stage-fg hover:bg-stage-raised flex size-9 items-center justify-center rounded-md"
      >
        <IconArrowSquareRight />
      </button>
      <p className="text-stage-soft min-w-0 flex-1 text-sm font-semibold">
        {title}
      </p>
      <button
        type="button"
        onClick={onAction}
        aria-label={actionLabel}
        className="text-stage-fg hover:bg-stage-raised flex size-9 items-center justify-center rounded-md"
      >
        {action}
      </button>
    </header>
  )
}
