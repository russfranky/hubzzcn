from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


source_path = Path("src/pages/MqsPrototype.tsx")
source = source_path.read_text()

source = replace_once(
    source,
    '  Play,\n  Shuffle,\n',
    '  Play,\n  Send,\n  Shuffle,\n',
    "Send icon import",
)

source = replace_once(
    source,
    'function Contributor({ name }: { name: string }) {',
    '''function playRemovalPoof(target: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const rect = target.getBoundingClientRect()
  const originX = rect.left + rect.width / 2
  const originY = rect.top + rect.height / 2
  const particles = [
    [-34, -8, 12],
    [-27, -25, 16],
    [-10, -34, 11],
    [10, -31, 14],
    [29, -22, 12],
    [35, -2, 16],
    [27, 20, 11],
    [8, 28, 15],
    [-13, 27, 13],
    [-31, 16, 10],
  ] as const

  particles.forEach(([x, y, size], index) => {
    const particle = document.createElement("span")
    particle.dataset.mqsPoof = "true"
    Object.assign(particle.style, {
      position: "fixed",
      left: `${originX}px`,
      top: `${originY}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "9999px",
      background: "rgba(230, 230, 235, 0.42)",
      boxShadow: "0 0 10px rgba(230, 230, 235, 0.16)",
      pointerEvents: "none",
      zIndex: "9999",
    })
    document.body.appendChild(particle)

    const animation = particle.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(0.2)",
          opacity: 0.78,
          filter: "blur(0px)",
        },
        {
          offset: 0.32,
          transform: `translate(calc(-50% + ${x * 0.35}px), calc(-50% + ${y * 0.35}px)) scale(1)`,
          opacity: 0.58,
          filter: "blur(0.5px)",
        },
        {
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.55)`,
          opacity: 0,
          filter: "blur(2.5px)",
        },
      ],
      {
        duration: 420 + index * 12,
        easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
        fill: "forwards",
      }
    )

    animation.onfinish = () => particle.remove()
    animation.oncancel = () => particle.remove()
  })
}

function Contributor({ name }: { name: string }) {''',
    "poof helper",
)

source = replace_once(
    source,
    '''  const [stopOpen, setStopOpen] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)''',
    '''  const [stopOpen, setStopOpen] = React.useState(false)
  const [dragSource, setDragSource] = React.useState<string | null>(null)
  const [removeTargetActive, setRemoveTargetActive] = React.useState(false)
  const [inputFocused, setInputFocused] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const removeTargetRef = React.useRef<HTMLDivElement>(null)''',
    "interaction state",
)

source = replace_once(
    source,
    '''  function handleDragStart(event: React.DragEvent, source: string) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", source)
  }
''',
    '''  function handleDragStart(event: React.DragEvent, source: string) {
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", source)
    setDragSource(source)
    setRemoveTargetActive(false)
  }

  function removeDraggedSource(source: string) {
    const [kind, rawIndex] = source.split(":")
    const sourceIndex = Number(rawIndex)
    if (!Number.isInteger(sourceIndex)) return false

    if (
      kind === "upcoming" &&
      sourceIndex >= 0 &&
      sourceIndex < upcoming.length
    ) {
      setUpcoming((items) =>
        items.filter((_, itemIndex) => itemIndex !== sourceIndex)
      )
      return true
    }

    if (
      kind === "history" &&
      sourceIndex >= 0 &&
      sourceIndex < played.length
    ) {
      setPlayed((items) =>
        items.filter((_, itemIndex) => itemIndex !== sourceIndex)
      )
      return true
    }

    return false
  }

  function handleRemoveDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    event.stopPropagation()

    const source =
      event.dataTransfer.getData("text/plain") || dragSource || ""
    const target = removeTargetRef.current
    const removed = removeDraggedSource(source)

    if (removed && target) playRemovalPoof(target)

    setRemoveTargetActive(false)
    setDragSource(null)
  }
''',
    "drag-to-remove handlers",
)

source = replace_once(
    source,
    '''    setUrl("")
    setError(null)
  }

  async function readSetlist''',
    '''    setUrl("")
    setError(null)
    setInputFocused(false)
  }

  async function readSetlist''',
    "successful send reset",
)

source = replace_once(
    source,
    '    <main className="dark min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-10">',
    '''    <main
      className="dark min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-10"
      onDragEnd={() => {
        setDragSource(null)
        setRemoveTargetActive(false)
      }}
    >''',
    "drag cleanup",
)

source = replace_once(
    source,
    '        <div className="flex items-center gap-4 px-8 py-7">',
    '''        <div
          className="flex items-center gap-4 px-8 py-7"
          onBlurCapture={(event) => {
            const next = event.relatedTarget as Node | null
            if (next && event.currentTarget.contains(next)) return
            setInputFocused(false)
          }}
        >''',
    "composer focus boundary",
)

source = replace_once(
    source,
    '''          <div className="relative min-w-0 flex-1">
            <Link2
              className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={url}
              onChange={(event) => {
                setUrl(event.target.value)
                setError(null)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  addUrl("tail")
                }
              }}
              aria-label="Media URL"
              placeholder="Paste YouTube or Twitch URL"
              className="h-14 rounded-lg bg-transparent pl-12 text-base"
            />
          </div>''',
    '''          <div className="relative min-w-0 flex-1">
            {dragSource ? (
              <div
                ref={removeTargetRef}
                data-testid="remove-drop-target"
                role="status"
                onDragEnter={(event) => {
                  event.preventDefault()
                  setRemoveTargetActive(true)
                }}
                onDragOver={(event) => {
                  event.preventDefault()
                  event.dataTransfer.dropEffect = "move"
                  setRemoveTargetActive(true)
                }}
                onDragLeave={(event) => {
                  const relatedTarget = event.relatedTarget as Node | null
                  if (relatedTarget && event.currentTarget.contains(relatedTarget))
                    return
                  setRemoveTargetActive(false)
                }}
                onDrop={handleRemoveDrop}
                className={cn(
                  "flex h-9 items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors",
                  removeTargetActive &&
                    "border-destructive/70 bg-destructive/20 ring-1 ring-destructive/30"
                )}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span>
                  {removeTargetActive ? "Drop here to remove" : "Drop to remove"}
                </span>
              </div>
            ) : (
              <>
                <Link2
                  className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={url}
                  onFocus={() => setInputFocused(true)}
                  onChange={(event) => {
                    setUrl(event.target.value)
                    setError(null)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      addUrl("tail")
                    }
                  }}
                  aria-label="Media URL"
                  placeholder="Paste YouTube or Twitch URL"
                  className="h-14 rounded-lg bg-transparent pl-12 text-base"
                />
              </>
            )}
          </div>''',
    "composer drag target",
)

menu_start = source.index("          <DropdownMenu>")
menu_end = source.index("\n\n          <input\n            ref={fileInputRef}", menu_start)
menu = source[menu_start:menu_end]
replacement = '''          {!dragSource ? (
            inputFocused ? (
              <Button
                type="button"
                className="size-14 rounded-lg"
                aria-label="Add media to queue"
                title="Add media to queue"
                disabled={!url.trim()}
                onClick={() => addUrl("tail")}
              >
                <Send />
              </Button>
            ) : (
''' + menu + '''
            )
          ) : null}'''
source = source[:menu_start] + replacement + source[menu_end:]

source_path.write_text(source)


test_path = Path("tests/mqs-prototype.spec.ts")
tests = test_path.read_text()

marker = '  test("previews a setlist and replaces the queue in paused state", async ({'
addition = '''  test("turns the media input into a full-width drag-to-remove target", async ({
    page,
  }) => {
    const rows = page.getByTestId("upcoming-row")
    const firstRow = rows.first()
    const mediaInput = page.getByRole("textbox", { name: "Media URL" })
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())

    await expect(rows).toHaveCount(5)
    await firstRow.dispatchEvent("dragstart", { dataTransfer })

    const removeTarget = page.getByTestId("remove-drop-target")
    await expect(mediaInput).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Queue actions" })).toHaveCount(0)
    await expect(removeTarget).toContainText("Drop to remove")

    await removeTarget.dispatchEvent("dragenter", { dataTransfer })
    await expect(removeTarget).toContainText("Drop here to remove")
    await removeTarget.dispatchEvent("drop", { dataTransfer })

    await expect(rows).toHaveCount(4)
    await expect(page.getByText("Afterlife Tulum 2025")).toHaveCount(0)
    await expect(mediaInput).toBeVisible()
    await expect(page.locator('[data-mqs-poof="true"]')).not.toHaveCount(0)
  })

  test("swaps queue actions for a send button while the media input is active", async ({
    page,
  }) => {
    const input = page.getByRole("textbox", { name: "Media URL" })

    await expect(page.getByRole("button", { name: "Queue actions" })).toBeVisible()
    await input.focus()
    await expect(page.getByRole("button", { name: "Queue actions" })).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "Add media to queue" })
    ).toBeVisible()

    await input.fill("https://example.com/focused-send")
    await page.getByRole("button", { name: "Add media to queue" }).click()
    await expect(page.getByTestId("upcoming-row")).toHaveCount(6)
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "https://example.com/focused-send"
    )
    await expect(page.getByRole("button", { name: "Queue actions" })).toBeVisible()
  })

''' + marker

tests = replace_once(tests, marker, addition, "interaction tests")
test_path.write_text(tests)
