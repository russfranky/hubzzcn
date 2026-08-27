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
    '''type PendingSetlist = {
  items: QueueItem[]
  dropped: number
}
''',
    '''type PendingSetlist = {
  items: QueueItem[]
  dropped: number
}

type SwapKind = "history" | "upcoming"

type SwapTarget = {
  kind: SwapKind
  index: number
  title: string
}
''',
    "swap types",
)

history_row = r'''function HistoryRow({
  item,
  index,
  onDragStart,
  currentSwapActive,
  isSwapTarget,
  onSwapHover,
  onSwapLeave,
  onSwapDrop,
}: {
  item: QueueItem
  index: number
  onDragStart: (event: React.DragEvent, source: string) => void
  currentSwapActive: boolean
  isSwapTarget: boolean
  onSwapHover: (kind: SwapKind, index: number, title: string) => void
  onSwapLeave: (kind: SwapKind, index: number) => void
  onSwapDrop: (kind: SwapKind, index: number) => void
}) {
  return (
    <div
      data-testid="history-row"
      data-swap-target={isSwapTarget ? "true" : undefined}
      draggable
      onDragStart={(event) => onDragStart(event, `history:${index}`)}
      onDragOver={(event) => {
        if (!currentSwapActive) return
        event.preventDefault()
        event.dataTransfer.dropEffect = "move"
        onSwapHover("history", index, item.title)
      }}
      onDragLeave={(event) => {
        if (!currentSwapActive) return
        const nextTarget = event.relatedTarget as Node | null
        if (nextTarget && event.currentTarget.contains(nextTarget)) return
        onSwapLeave("history", index)
      }}
      onDrop={(event) => {
        if (!currentSwapActive) return
        event.preventDefault()
        event.stopPropagation()
        onSwapDrop("history", index)
      }}
      className={cn(
        "relative grid min-h-16 grid-cols-[32px_minmax(0,1fr)_minmax(180px,280px)_96px] items-center gap-3 border-b border-border/60 px-3 py-2 opacity-55 transition-colors last:border-b-0",
        isSwapTarget &&
          "!opacity-100 bg-indigo-400/10 ring-1 ring-inset ring-indigo-400/40"
      )}
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
  currentSwapActive,
  isSwapTarget,
  onSwapHover,
  onSwapLeave,
  onSwapDrop,
}: {
  item: QueueItem
  index: number
  onMove: (from: number, to: number) => void
  onDragStart: (event: React.DragEvent, source: string) => void
  onDropSource: (source: string, targetIndex: number) => void
  currentSwapActive: boolean
  isSwapTarget: boolean
  onSwapHover: (kind: SwapKind, index: number, title: string) => void
  onSwapLeave: (kind: SwapKind, index: number) => void
  onSwapDrop: (kind: SwapKind, index: number) => void
}) {
  const [dragging, setDragging] = React.useState(false)
  const [dropInsertionIndex, setDropInsertionIndex] = React.useState<
    number | null
  >(null)

  return (
    <div
      data-testid="upcoming-row"
      data-queue-id={item.id}
      data-swap-target={isSwapTarget ? "true" : undefined}
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
        if (currentSwapActive) {
          event.preventDefault()
          event.dataTransfer.dropEffect = "move"
          setDropInsertionIndex(null)
          onSwapHover("upcoming", index, item.title)
          return
        }

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
        if (currentSwapActive) onSwapLeave("upcoming", index)
      }}
      onDrop={(event) => {
        event.preventDefault()
        event.stopPropagation()

        if (currentSwapActive) {
          setDropInsertionIndex(null)
          onSwapDrop("upcoming", index)
          return
        }

        const targetIndex = dropInsertionIndex ?? index
        setDropInsertionIndex(null)
        onDropSource(event.dataTransfer.getData("text/plain"), targetIndex)
      }}
      className={cn(
        "relative grid min-h-16 grid-cols-[32px_minmax(0,1fr)_minmax(180px,280px)_96px] items-center gap-3 border-b border-border/60 px-3 py-2 transition-colors last:border-b-0 hover:bg-accent/25",
        dragging && "opacity-45",
        isSwapTarget && "bg-indigo-400/10 ring-1 ring-inset ring-indigo-400/40"
      )}
    >
      {dropInsertionIndex !== null && !currentSwapActive ? (
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

current_card = r'''function CurrentCard({
  item,
  elapsed,
  isPlaying,
  onElapsedChange,
  onTogglePlaying,
  onSkipUp,
  onSkipDown,
  canSkipUp,
  onDragStart,
  onDragEnd,
  swapTargetTitle,
}: {
  item: QueueItem
  elapsed: number
  isPlaying: boolean
  onElapsedChange: (value: number) => void
  onTogglePlaying: () => void
  onSkipUp: () => void
  onSkipDown: () => void
  canSkipUp: boolean
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
  swapTargetTitle: string | null
}) {
  const duration = item.durationSeconds ?? 0
  const hasDuration = duration > 0
  const progress = hasDuration
    ? Math.min(100, Math.max(0, (elapsed / duration) * 100))
    : 0

  function seekFromPointer(event: React.PointerEvent<HTMLDivElement>) {
    if (!hasDuration) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width)
    )
    onElapsedChange(Math.round(duration * ratio))
  }

  return (
    <Card
      data-testid="current-row"
      draggable
      onDragStart={(event) => {
        const target = event.target as HTMLElement
        if (target.closest('button, [role="slider"], a')) {
          event.preventDefault()
          return
        }
        onDragStart(event)
      }}
      onDragEnd={onDragEnd}
      className="relative gap-0 overflow-hidden rounded-xl bg-card py-0 ring-1 ring-foreground/15"
    >
      {swapTargetTitle ? (
        <div
          data-testid="current-swap-overlay"
          aria-live="polite"
          className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center rounded-xl bg-card/75 px-8 text-center backdrop-blur-[1px]"
        >
          <span className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Swap with
          </span>
          <span className="mt-1 max-w-full truncate text-sm font-semibold text-foreground">
            {swapTargetTitle}
          </span>
        </div>
      ) : null}

      <CardContent className="grid min-h-44 grid-cols-[44px_minmax(0,1fr)_104px] gap-0 p-0">
        <div
          className="flex items-start justify-center pt-6"
          aria-hidden="true"
        >
          <GripVertical className="size-4 text-muted-foreground/70" />
        </div>

        <div className="min-w-0 px-1 py-6 pr-6">
          <div className="truncate text-xl font-semibold tracking-tight">
            {item.title}
          </div>
          <div className="mt-2">
            <QueueMeta item={item} />
          </div>

          <div data-testid="playback-progress" className="mt-8">
            <div
              className={cn("relative h-10", hasDuration && "cursor-pointer")}
              role="slider"
              tabIndex={hasDuration ? 0 : -1}
              aria-label="Playback position"
              aria-valuemin={0}
              aria-valuemax={hasDuration ? duration : 0}
              aria-valuenow={hasDuration ? Math.min(duration, elapsed) : 0}
              onPointerDown={seekFromPointer}
              onKeyDown={(event) => {
                if (!hasDuration) return
                if (event.key === "ArrowLeft") {
                  event.preventDefault()
                  onElapsedChange(Math.max(0, elapsed - 5))
                }
                if (event.key === "ArrowRight") {
                  event.preventDefault()
                  onElapsedChange(Math.min(duration, elapsed + 5))
                }
              }}
            >
              <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-muted">
                {hasDuration ? (
                  <div
                    className="h-full rounded-full bg-indigo-400"
                    style={{ width: `${progress}%` }}
                  />
                ) : null}
              </div>
              {hasDuration ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400 ring-4 ring-card"
                  style={{ left: `${progress}%` }}
                />
              ) : null}
            </div>

            <div
              data-testid="playback-times"
              className="mt-1 flex items-center justify-between text-base text-muted-foreground tabular-nums"
            >
              <span data-testid="elapsed-time">
                {hasDuration ? formatTime(elapsed) : "LIVE"}
              </span>
              <span data-testid="total-time">
                {hasDuration ? formatTime(duration) : "LIVE"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 border-l border-border/70 px-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Skip up"
            title="Skip up"
            disabled={!canSkipUp}
            onClick={onSkipUp}
          >
            <ChevronUp />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full bg-card"
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlaying}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label="Skip down"
            title="Skip down"
            onClick={onSkipDown}
          >
            <ChevronDown />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

'''
text = replace_between(text, "function CurrentCard({", "function normalizeSetlist(", current_card, "CurrentCard")

text = replace_once(
    text,
    '''  const [queueTailDropActive, setQueueTailDropActive] = React.useState(false)
  const [pendingRevealId, setPendingRevealId] = React.useState<string | null>(
''',
    '''  const [queueTailDropActive, setQueueTailDropActive] = React.useState(false)
  const [swapTarget, setSwapTarget] = React.useState<SwapTarget | null>(null)
  const [pendingRevealId, setPendingRevealId] = React.useState<string | null>(
''',
    "swap state",
)

text = replace_once(
    text,
    '''  function handleDragStart(event: React.DragEvent, source: string) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", source)
    setDragSource(source)
    setRemoveTargetActive(false)
    setQueueTailDropActive(false)
  }
''',
    '''  function handleDragStart(event: React.DragEvent, source: string) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", source)
    setDragSource(source)
    setRemoveTargetActive(false)
    setQueueTailDropActive(false)
    setSwapTarget(null)
  }

  function handleSwapHover(kind: SwapKind, index: number, title: string) {
    setSwapTarget({ kind, index, title })
  }

  function handleSwapLeave(kind: SwapKind, index: number) {
    setSwapTarget((target) =>
      target?.kind === kind && target.index === index ? null : target
    )
  }

  function swapCurrentWith(kind: SwapKind, index: number) {
    if (!current) return

    const target = kind === "history" ? played[index] : upcoming[index]
    if (!target) return

    if (kind === "history") {
      setPlayed((items) => {
        if (!items[index]) return items
        const next = [...items]
        next[index] = current
        return next
      })
    } else {
      setUpcoming((items) => {
        if (!items[index]) return items
        const next = [...items]
        next[index] = current
        return next
      })
    }

    setCurrent(target)
    setElapsed(0)
    setIsPlaying(true)
    setDragSource(null)
    setRemoveTargetActive(false)
    setQueueTailDropActive(false)
    setSwapTarget(null)
  }
''',
    "swap handlers",
)

text = replace_once(
    text,
    '''    setRemoveTargetActive(false)
    setQueueTailDropActive(false)
    setDragSource(null)
  }

  function handleDropSource''',
    '''    setRemoveTargetActive(false)
    setQueueTailDropActive(false)
    setDragSource(null)
    setSwapTarget(null)
  }

  function handleDropSource''',
    "remove drop cleanup",
)

text = replace_once(
    text,
    '''      setDragSource(null)
      setRemoveTargetActive(false)
      setQueueTailDropActive(false)
    }
  }

  function skipDown''',
    '''      setDragSource(null)
      setRemoveTargetActive(false)
      setQueueTailDropActive(false)
      setSwapTarget(null)
    }
  }

  function skipDown''',
    "queue drop cleanup",
)

text = replace_once(
    text,
    '''        setDragSource(null)
        setRemoveTargetActive(false)
        setQueueTailDropActive(false)
      }}
''',
    '''        setDragSource(null)
        setRemoveTargetActive(false)
        setQueueTailDropActive(false)
        setSwapTarget(null)
      }}
''',
    "main drag cleanup",
)

text = replace_once(
    text,
    '''                  index={index}
                  onDragStart={handleDragStart}
                />
''',
    '''                  index={index}
                  onDragStart={handleDragStart}
                  currentSwapActive={dragSource === "current"}
                  isSwapTarget={
                    swapTarget?.kind === "history" && swapTarget.index === index
                  }
                  onSwapHover={handleSwapHover}
                  onSwapLeave={handleSwapLeave}
                  onSwapDrop={swapCurrentWith}
                />
''',
    "history props",
)

text = replace_once(
    text,
    '''              onSkipDown={skipDown}
              canSkipUp={played.length > 0}
            />
''',
    '''              onSkipDown={skipDown}
              canSkipUp={played.length > 0}
              onDragStart={(event) => handleDragStart(event, "current")}
              onDragEnd={() => {
                setDragSource(null)
                setRemoveTargetActive(false)
                setQueueTailDropActive(false)
                setSwapTarget(null)
              }}
              swapTargetTitle={swapTarget?.title ?? null}
            />
''',
    "current props",
)

old_scroll_drag = '''            onDragOver={(event) => {
              if (!dragSource) return

              event.preventDefault()
              event.dataTransfer.dropEffect = "move"

              const rect = event.currentTarget.getBoundingClientRect()
              const edge = Math.min(48, rect.height * 0.2)
              if (event.clientY <= rect.top + edge) {
                event.currentTarget.scrollTop -= 24
              } else if (event.clientY >= rect.bottom - edge) {
                event.currentTarget.scrollTop += 24
              }

              const row = (event.target as HTMLElement).closest(
                '[data-testid="upcoming-row"]'
              )
              setQueueTailDropActive(!row)
            }}
'''
new_scroll_drag = '''            onDragOver={(event) => {
              if (!dragSource) return

              const row = (event.target as HTMLElement).closest(
                '[data-testid="upcoming-row"]'
              )
              const rect = event.currentTarget.getBoundingClientRect()
              const edge = Math.min(48, rect.height * 0.2)

              if (row) {
                if (event.clientY <= rect.top + edge) {
                  event.currentTarget.scrollTop -= 24
                } else if (event.clientY >= rect.bottom - edge) {
                  event.currentTarget.scrollTop += 24
                }
              }

              if (dragSource === "current") {
                setQueueTailDropActive(false)
                return
              }

              event.preventDefault()
              event.dataTransfer.dropEffect = "move"
              setQueueTailDropActive(!row)
            }}
'''
text = replace_once(text, old_scroll_drag, new_scroll_drag, "scroll drag mode")

text = replace_once(
    text,
    '''            onDrop={(event) => {
              if (
''',
    '''            onDrop={(event) => {
              if (dragSource === "current") return

              if (
''',
    "tail drop current guard",
)

text = replace_once(
    text,
    '''                  onMove={moveUpcoming}
                  onDragStart={handleDragStart}
                  onDropSource={handleDropSource}
                />
''',
    '''                  onMove={moveUpcoming}
                  onDragStart={handleDragStart}
                  onDropSource={handleDropSource}
                  currentSwapActive={dragSource === "current"}
                  isSwapTarget={
                    swapTarget?.kind === "upcoming" && swapTarget.index === index
                  }
                  onSwapHover={handleSwapHover}
                  onSwapLeave={handleSwapLeave}
                  onSwapDrop={swapCurrentWith}
                />
''',
    "upcoming props",
)

text = replace_once(
    text,
    '''            {dragSource ? (
''',
    '''            {dragSource && dragSource !== "current" ? (
''',
    "composer current drag mode",
)

source_path.write_text(text)

tests = test_path.read_text()
anchor = '''  test("previews the exact queue insertion point while dragging", async ({
    page,
  }) => {'''
new_test = r'''  test("swaps Now Playing only with whole media rows", async ({ page }) => {
    const current = page.getByTestId("current-row")
    const mediaInput = page.getByRole("textbox", { name: "Media URL" })
    const upcoming = page.getByTestId("upcoming-row").first()

    await expect(current).toContainText("Tomorrowland 2026 Mainstage W1")

    const upcomingTransfer = await page.evaluateHandle(() => new DataTransfer())
    await current.dispatchEvent("dragstart", { dataTransfer: upcomingTransfer })

    await expect(mediaInput).toBeVisible()
    await expect(page.getByTestId("remove-drop-target")).toHaveCount(0)
    await expect(page.getByTestId("current-swap-overlay")).toHaveCount(0)

    await upcoming.dispatchEvent("dragover", { dataTransfer: upcomingTransfer })

    await expect(upcoming).toHaveAttribute("data-swap-target", "true")
    await expect(page.getByTestId("current-swap-overlay")).toContainText(
      "Swap with"
    )
    await expect(page.getByTestId("current-swap-overlay")).toContainText(
      "Afterlife Tulum 2025"
    )
    await expect(page.getByTestId("queue-drop-indicator")).toHaveCount(0)
    await expect(page.getByTestId("queue-tail-drop-indicator")).toHaveCount(0)

    await upcoming.dispatchEvent("drop", { dataTransfer: upcomingTransfer })

    await expect(current).toContainText("Afterlife Tulum 2025")
    await expect(page.getByTestId("upcoming-row").first()).toContainText(
      "Tomorrowland 2026 Mainstage W1"
    )
    await expect(page.getByTestId("current-swap-overlay")).toHaveCount(0)

    const history = page.getByTestId("history-row").first()
    const historyTransfer = await page.evaluateHandle(() => new DataTransfer())
    await current.dispatchEvent("dragstart", { dataTransfer: historyTransfer })
    await history.dispatchEvent("dragover", { dataTransfer: historyTransfer })

    await expect(history).toHaveAttribute("data-swap-target", "true")
    await expect(page.getByTestId("current-swap-overlay")).toContainText(
      "Sunset Drive 2025"
    )

    await history.dispatchEvent("drop", { dataTransfer: historyTransfer })

    await expect(current).toContainText("Sunset Drive 2025")
    await expect(page.getByTestId("history-row").first()).toContainText(
      "Afterlife Tulum 2025"
    )
    await expect(mediaInput).toBeVisible()
  })

'''
if anchor not in tests:
    raise SystemExit("swap test anchor missing")
test_path.write_text(tests.replace(anchor, new_test + anchor, 1))
