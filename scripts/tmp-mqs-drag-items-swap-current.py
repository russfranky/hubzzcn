from pathlib import Path

source_path = Path("src/pages/MqsPrototype.tsx")
test_path = Path("tests/mqs-prototype.spec.ts")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label} anchor count: {count}")
    return text.replace(old, new, 1)


def replace_between(text: str, start: str, end: str, replacement: str, label: str) -> str:
    start_index = text.find(start)
    if start_index < 0:
        raise SystemExit(f"{label} start missing")
    end_index = text.find(end, start_index)
    if end_index < 0:
        raise SystemExit(f"{label} end missing")
    return text[:start_index] + replacement + text[end_index:]


text = source_path.read_text()

text = replace_once(
    text,
    '''type SwapKind = "history" | "upcoming"\n\ntype SwapTarget = {\n  kind: SwapKind\n  index: number\n  title: string\n}\n''',
    '''type DraggedMedia = {\n  kind: "history" | "upcoming"\n  index: number\n  title: string\n}\n''',
    "swap type",
)

history_row = r'''function HistoryRow({
  item,
  index,
  onDragStart,
}: {
  item: QueueItem
  index: number
  onDragStart: (event: React.DragEvent, source: string) => void
}) {
  return (
    <div
      data-testid="history-row"
      draggable
      onDragStart={(event) => onDragStart(event, `history:${index}`)}
      className="grid min-h-16 grid-cols-[32px_minmax(0,1fr)_minmax(180px,280px)_96px] items-center gap-3 border-b border-border/60 px-3 py-2 opacity-55 last:border-b-0"
    >
      <DragHandle title={item.title} />
      <div className="min-w-0 truncate text-base font-medium">{item.title}</div>
      <QueueMeta item={item} dimmed />
      <span className="justify-self-end text-base text-muted-foreground tabular-nums">
        {formatTime(item.durationSeconds)}
      </span>
    </div>
  )
}

'''
text = replace_between(text, "function HistoryRow({", "function UpcomingRow({", history_row, "HistoryRow")

upcoming_row = r'''function UpcomingRow({
  item,
  index,
  onMove,
  onDragStart,
  onDropSource,
}: {
  item: QueueItem
  index: number
  onMove: (from: number, to: number) => void
  onDragStart: (event: React.DragEvent, source: string) => void
  onDropSource: (source: string, targetIndex: number) => void
}) {
  const [dragging, setDragging] = React.useState(false)
  const [dropInsertionIndex, setDropInsertionIndex] = React.useState<
    number | null
  >(null)

  return (
    <div
      data-testid="upcoming-row"
      data-queue-id={item.id}
      draggable
      onDragStart={(event) => {
        setDragging(true)
        onDragStart(event, `upcoming:${index}`)
      }}
      onDragEnd={() => {
        setDragging(false)
        setDropInsertionIndex(null)
      }}
      onDragOver={(event) => {
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        const rect = event.currentTarget.getBoundingClientRect()
        const after = event.clientY >= rect.top + rect.height / 2
        setDropInsertionIndex(index + (after ? 1 : 0))
      }}
      onDragLeave={(event) => {
        const nextTarget = event.relatedTarget as Node | null
        if (nextTarget && event.currentTarget.contains(nextTarget)) return
        setDropInsertionIndex(null)
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const targetIndex = dropInsertionIndex ?? index
        setDropInsertionIndex(null)
        onDropSource(event.dataTransfer.getData("text/plain"), targetIndex)
      }}
      className={cn(
        "relative grid min-h-16 grid-cols-[32px_minmax(0,1fr)_minmax(180px,280px)_96px] items-center gap-3 border-b border-border/60 px-3 py-2 transition-colors last:border-b-0 hover:bg-accent/25",
        dragging && "opacity-45"
      )}
    >
      {dropInsertionIndex !== null ? (
        <span
          data-testid="queue-drop-indicator"
          data-position={dropInsertionIndex === index ? "before" : "after"}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-3 left-3 z-20 h-0.5 rounded-full bg-indigo-400",
            dropInsertionIndex === index ? "-top-px" : "-bottom-px"
          )}
        />
      ) : null}
      <DragHandle
        title={item.title}
        onKeyDown={(event) => {
          if (!event.altKey) return

          if (event.key === "ArrowUp") {
            event.preventDefault()
            onMove(index, index - 1)
          }

          if (event.key === "ArrowDown") {
            event.preventDefault()
            onMove(index, index + 1)
          }
        }}
      />
      <div className="min-w-0 truncate text-base font-medium">{item.title}</div>
      <QueueMeta item={item} />
      <span className="justify-self-end text-base text-muted-foreground tabular-nums">
        {formatTime(item.durationSeconds)}
      </span>
    </div>
  )
}

'''
text = replace_between(text, "function UpcomingRow({", "function CurrentCard({", upcoming_row, "UpcomingRow")

text = replace_once(
    text,
    '''  canSkipUp,\n  onDragStart,\n  onDragEnd,\n  swapTargetTitle,\n}: {\n''',
    '''  canSkipUp,\n  swapSourceTitle,\n  onSwapDragOver,\n  onSwapDragLeave,\n  onSwapDrop,\n}: {\n''',
    "current props args",
)
text = replace_once(
    text,
    '''  canSkipUp: boolean\n  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void\n  onDragEnd: () => void\n  swapTargetTitle: string | null\n}) {\n''',
    '''  canSkipUp: boolean\n  swapSourceTitle: string | null\n  onSwapDragOver: (event: React.DragEvent<HTMLDivElement>) => void\n  onSwapDragLeave: (event: React.DragEvent<HTMLDivElement>) => void\n  onSwapDrop: (event: React.DragEvent<HTMLDivElement>) => void\n}) {\n''',
    "current props type",
)
text = replace_once(
    text,
    '''    <Card\n      data-testid="current-row"\n      draggable\n      onDragStart={(event) => {\n        const target = event.target as HTMLElement\n        if (target.closest('button, [role="slider"], a')) {\n          event.preventDefault()\n          return\n        }\n        onDragStart(event)\n      }}\n      onDragEnd={onDragEnd}\n      className="relative gap-0 overflow-hidden rounded-xl bg-card py-0 ring-1 ring-foreground/15"\n    >\n      {swapTargetTitle ? (\n''',
    '''    <Card\n      data-testid="current-row"\n      data-swap-target={swapSourceTitle ? "true" : undefined}\n      onDragOver={onSwapDragOver}\n      onDragLeave={onSwapDragLeave}\n      onDrop={onSwapDrop}\n      className={cn(\n        "relative gap-0 overflow-hidden rounded-xl bg-card py-0 ring-1 ring-foreground/15 transition-colors",\n        swapSourceTitle && "ring-indigo-400/60"\n      )}\n    >\n      {swapSourceTitle ? (\n''',
    "current root",
)
text = replace_once(text, "            {swapTargetTitle}\n", "            {swapSourceTitle}\n", "overlay title")

text = replace_once(
    text,
    '''  const [queueTailDropActive, setQueueTailDropActive] = React.useState(false)\n  const [swapTarget, setSwapTarget] = React.useState<SwapTarget | null>(null)\n''',
    '''  const [queueTailDropActive, setQueueTailDropActive] = React.useState(false)\n  const [currentSwapSource, setCurrentSwapSource] =\n    React.useState<DraggedMedia | null>(null)\n''',
    "swap state",
)

old_swap_block = '''  function handleSwapHover(kind: SwapKind, index: number, title: string) {\n    setSwapTarget({ kind, index, title })\n  }\n\n  function handleSwapLeave(kind: SwapKind, index: number) {\n    setSwapTarget((target) =>\n      target?.kind === kind && target.index === index ? null : target\n    )\n  }\n\n  function swapCurrentWith(kind: SwapKind, index: number) {\n    if (!current) return\n\n    const target = kind === "history" ? played[index] : upcoming[index]\n    if (!target) return\n\n    if (kind === "history") {\n      setPlayed((items) => {\n        if (!items[index]) return items\n        const next = [...items]\n        next[index] = current\n        return next\n      })\n    } else {\n      setUpcoming((items) => {\n        if (!items[index]) return items\n        const next = [...items]\n        next[index] = current\n        return next\n      })\n    }\n\n    setCurrent(target)\n    setElapsed(0)\n    setIsPlaying(true)\n    setDragSource(null)\n    setRemoveTargetActive(false)\n    setQueueTailDropActive(false)\n    setSwapTarget(null)\n  }\n\n'''
new_swap_block = '''  function draggedMedia(source: string): DraggedMedia | null {\n    const [kind, rawIndex] = source.split(":")\n    const index = Number(rawIndex)\n    if (!Number.isInteger(index)) return null\n\n    if (kind === "history") {\n      const item = played[index]\n      return item ? { kind, index, title: item.title } : null\n    }\n\n    if (kind === "upcoming") {\n      const item = upcoming[index]\n      return item ? { kind, index, title: item.title } : null\n    }\n\n    return null\n  }\n\n  function swapDraggedMediaWithCurrent(source: string) {\n    if (!current) return\n    const dragged = draggedMedia(source)\n    if (!dragged) return\n\n    const target =\n      dragged.kind === "history" ? played[dragged.index] : upcoming[dragged.index]\n    if (!target) return\n\n    if (dragged.kind === "history") {\n      setPlayed((items) => {\n        if (!items[dragged.index]) return items\n        const next = [...items]\n        next[dragged.index] = current\n        return next\n      })\n    } else {\n      setUpcoming((items) => {\n        if (!items[dragged.index]) return items\n        const next = [...items]\n        next[dragged.index] = current\n        return next\n      })\n    }\n\n    setCurrent(target)\n    setElapsed(0)\n    setIsPlaying(true)\n    setDragSource(null)\n    setRemoveTargetActive(false)\n    setQueueTailDropActive(false)\n    setCurrentSwapSource(null)\n  }\n\n  function handleCurrentSwapDragOver(event: React.DragEvent<HTMLDivElement>) {\n    const source = event.dataTransfer.getData("text/plain") || dragSource || ""\n    const dragged = draggedMedia(source)\n    if (!dragged) return\n\n    event.preventDefault()\n    event.dataTransfer.dropEffect = "move"\n    setCurrentSwapSource(dragged)\n  }\n\n  function handleCurrentSwapDragLeave(event: React.DragEvent<HTMLDivElement>) {\n    const next = event.relatedTarget as Node | null\n    if (next && event.currentTarget.contains(next)) return\n    setCurrentSwapSource(null)\n  }\n\n  function handleCurrentSwapDrop(event: React.DragEvent<HTMLDivElement>) {\n    const source = event.dataTransfer.getData("text/plain") || dragSource || ""\n    if (!draggedMedia(source)) return\n\n    event.preventDefault()\n    event.stopPropagation()\n    swapDraggedMediaWithCurrent(source)\n  }\n\n'''
text = replace_once(text, old_swap_block, new_swap_block, "swap handlers")

text = text.replace("    setSwapTarget(null)\n", "    setCurrentSwapSource(null)\n")

history_render_old = '''                <HistoryRow\n                  key={item.id}\n                  item={item}\n                  index={index}\n                  onDragStart={handleDragStart}\n                  currentSwapActive={dragSource === "current"}\n                  isSwapTarget={\n                    swapTarget?.kind === "history" && swapTarget.index === index\n                  }\n                  onSwapHover={handleSwapHover}\n                  onSwapLeave={handleSwapLeave}\n                  onSwapDrop={swapCurrentWith}\n                />\n'''
history_render_new = '''                <HistoryRow\n                  key={item.id}\n                  item={item}\n                  index={index}\n                  onDragStart={handleDragStart}\n                />\n'''
text = replace_once(text, history_render_old, history_render_new, "history render")

current_render_old = '''              canSkipUp={played.length > 0}\n              onDragStart={(event) => handleDragStart(event, "current")}\n              onDragEnd={() => {\n                setDragSource(null)\n                setRemoveTargetActive(false)\n                setQueueTailDropActive(false)\n                setCurrentSwapSource(null)\n              }}\n              swapTargetTitle={swapTarget?.title ?? null}\n'''
current_render_new = '''              canSkipUp={played.length > 0}\n              swapSourceTitle={currentSwapSource?.title ?? null}\n              onSwapDragOver={handleCurrentSwapDragOver}\n              onSwapDragLeave={handleCurrentSwapDragLeave}\n              onSwapDrop={handleCurrentSwapDrop}\n'''
text = replace_once(text, current_render_old, current_render_new, "current render")

text = replace_once(
    text,
    '''              if (dragSource === "current") {\n                setQueueTailDropActive(false)\n                return\n              }\n\n              event.preventDefault()\n''',
    '''              event.preventDefault()\n''',
    "up next current drag guard",
)
text = replace_once(text, '''              if (dragSource === "current") return\n\n''', '', "up next drop current guard")

upcoming_render_old = '''                <UpcomingRow\n                  key={item.id}\n                  item={item}\n                  index={index}\n                  onMove={moveUpcoming}\n                  onDragStart={handleDragStart}\n                  onDropSource={handleDropSource}\n                  currentSwapActive={dragSource === "current"}\n                  isSwapTarget={\n                    swapTarget?.kind === "upcoming" &&\n                    swapTarget.index === index\n                  }\n                  onSwapHover={handleSwapHover}\n                  onSwapLeave={handleSwapLeave}\n                  onSwapDrop={swapCurrentWith}\n                />\n'''
upcoming_render_new = '''                <UpcomingRow\n                  key={item.id}\n                  item={item}\n                  index={index}\n                  onMove={moveUpcoming}\n                  onDragStart={handleDragStart}\n                  onDropSource={handleDropSource}\n                />\n'''
text = replace_once(text, upcoming_render_old, upcoming_render_new, "upcoming render")

text = replace_once(
    text,
    '''            {dragSource && dragSource !== "current" ? (\n''',
    '''            {dragSource ? (\n''',
    "composer drag condition",
)

source_path.write_text(text)


tests = test_path.read_text()
start = '  test("swaps Now Playing only with whole media rows", async ({ page }) => {\n'
end = '  test("previews the exact queue insertion point while dragging", async ({\n'
new_test = r'''  test("swaps dragged media into the non-draggable Now Playing target", async ({ page }) => {
    const current = page.getByTestId("current-row")
    const upcoming = page.getByTestId("upcoming-row").first()

    await expect(current).toContainText("Tomorrowland 2026 Mainstage W1")
    await expect(current).not.toHaveAttribute("draggable", "true")

    const upcomingTransfer = await page.evaluateHandle(() => new DataTransfer())
    await upcoming.dispatchEvent("dragstart", { dataTransfer: upcomingTransfer })
    await expect(page.getByTestId("remove-drop-target")).toBeVisible()

    await current.dispatchEvent("dragover", { dataTransfer: upcomingTransfer })

    await expect(current).toHaveAttribute("data-swap-target", "true")
    await expect(page.getByTestId("current-swap-overlay")).toContainText("Swap with")
    await expect(page.getByTestId("current-swap-overlay")).toContainText("Afterlife Tulum 2025")
    await expect(page.getByTestId("queue-drop-indicator")).toHaveCount(0)

    await current.dispatchEvent("drop", { dataTransfer: upcomingTransfer })

    await expect(current).toContainText("Afterlife Tulum 2025")
    await expect(page.getByTestId("upcoming-row").first()).toContainText(
      "Tomorrowland 2026 Mainstage W1"
    )
    await expect(page.getByTestId("current-swap-overlay")).toHaveCount(0)
    await expect(page.getByRole("textbox", { name: "Media URL" })).toBeVisible()

    const history = page.getByTestId("history-row").first()
    const historyTransfer = await page.evaluateHandle(() => new DataTransfer())
    await history.dispatchEvent("dragstart", { dataTransfer: historyTransfer })
    await current.dispatchEvent("dragover", { dataTransfer: historyTransfer })

    await expect(current).toHaveAttribute("data-swap-target", "true")
    await expect(page.getByTestId("current-swap-overlay")).toContainText("Sunset Drive 2025")

    await current.dispatchEvent("drop", { dataTransfer: historyTransfer })

    await expect(current).toContainText("Sunset Drive 2025")
    await expect(page.getByTestId("history-row").first()).toContainText("Afterlife Tulum 2025")
  })

'''
tests = replace_between(tests, start, end, new_test, "swap test")
test_path.write_text(tests)
