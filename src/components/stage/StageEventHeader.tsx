import { IconArrowSquareLeft, IconDotsHorizontal, IconInfo } from "./DockIcons"

export function StageEventHeader({
  title,
  railOpen,
  onReopenRail,
}: {
  title: string
  railOpen: boolean
  onReopenRail: () => void
}) {
  return (
    <header className="stage-hud-header bg-stage-panel pointer-events-auto flex h-14 items-center gap-2 px-6">
      <IconInfo className="text-stage-muted size-5 shrink-0" />
      <h1 className="text-stage-soft min-w-0 flex-1 truncate text-sm leading-5 font-semibold">
        {title}
      </h1>
      <button
        type="button"
        aria-label="More"
        className="text-stage-fg hover:bg-stage-raised flex size-9 shrink-0 items-center justify-center rounded-md"
      >
        <IconDotsHorizontal />
      </button>
      {railOpen ? null : (
        <button
          type="button"
          aria-label="Show panel"
          onClick={onReopenRail}
          className="text-stage-fg hover:bg-stage-raised flex size-9 shrink-0 items-center justify-center rounded-md"
        >
          <IconArrowSquareLeft />
        </button>
      )}
    </header>
  )
}
