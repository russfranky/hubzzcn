from pathlib import Path

source_path = Path("src/pages/MqsPrototype.tsx")
css_path = Path("src/index.css")
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


source = source_path.read_text()

source = replace_once(
    source,
    '''  const duration = item.durationSeconds ?? 0
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
''',
    '''  const [scrubSeconds, setScrubSeconds] = React.useState<number | null>(null)
  const duration = item.durationSeconds ?? 0
  const hasDuration = duration > 0
  const displayedElapsed = scrubSeconds ?? elapsed
  const progress = hasDuration
    ? Math.min(100, Math.max(0, (displayedElapsed / duration) * 100))
    : 0

  function secondsFromPointer(clientX: number, element: HTMLElement) {
    if (!hasDuration) return null
    const rect = element.getBoundingClientRect()
    if (rect.width <= 0) return null
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return Math.round(duration * ratio)
  }

  function beginScrub(event: React.PointerEvent<HTMLDivElement>) {
    const next = secondsFromPointer(event.clientX, event.currentTarget)
    if (next === null) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setScrubSeconds(next)
  }

  function moveScrub(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const next = secondsFromPointer(event.clientX, event.currentTarget)
    if (next !== null) setScrubSeconds(next)
  }

  function endScrub(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const next = secondsFromPointer(event.clientX, event.currentTarget)
    event.currentTarget.releasePointerCapture(event.pointerId)
    setScrubSeconds(null)
    if (next !== null) onElapsedChange(next)
  }

  function cancelScrub(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setScrubSeconds(null)
  }
''',
    "seek helpers",
)

source = replace_once(
    source,
    '''      <CardContent className="grid min-h-44 grid-cols-[44px_minmax(0,1fr)_104px] gap-0 p-0">
        <div
          className="flex items-start justify-center pt-6"
          aria-hidden="true"
        >
          <GripVertical className="size-4 text-muted-foreground/70" />
        </div>

        <div className="min-w-0 px-1 py-6 pr-6">
''',
    '''      <CardContent className="grid min-h-44 grid-cols-[minmax(0,1fr)_104px] gap-0 p-0">
        <div className="min-w-0 px-5 py-6 pr-6">
''',
    "remove current grip",
)

playback_start = '          <div data-testid="playback-progress" className="mt-8">\n'
playback_end = '        </div>\n\n        <div className="flex flex-col items-center justify-center gap-3 border-l border-border/70 px-4">\n'
playback_replacement = '''          <div data-testid="playback-progress" className="mt-8">
            {hasDuration ? (
              <div
                data-testid="playback-rail"
                className="relative h-10 cursor-ew-resize touch-none"
                role="slider"
                tabIndex={0}
                aria-label="Playback position"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={Math.min(duration, displayedElapsed)}
                aria-valuetext={formatTime(displayedElapsed)}
                onPointerDown={beginScrub}
                onPointerMove={moveScrub}
                onPointerUp={endScrub}
                onPointerCancel={cancelScrub}
                onKeyDown={(event) => {
                  if (event.key === "ArrowLeft") {
                    event.preventDefault()
                    onElapsedChange(Math.max(0, elapsed - 5))
                  } else if (event.key === "ArrowRight") {
                    event.preventDefault()
                    onElapsedChange(Math.min(duration, elapsed + 5))
                  } else if (event.key === "Home") {
                    event.preventDefault()
                    onElapsedChange(0)
                  } else if (event.key === "End") {
                    event.preventDefault()
                    onElapsedChange(duration)
                  }
                }}
              >
                <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-indigo-400"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400 ring-4 ring-card"
                  style={{ left: `${progress}%` }}
                />
              </div>
            ) : (
              <div
                data-testid="playback-rail"
                className="relative h-10"
                aria-hidden="true"
              >
                <div className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full bg-muted" />
              </div>
            )}

            <div
              data-testid="playback-times"
              className="mt-1 flex items-center justify-between text-base text-muted-foreground tabular-nums"
            >
              <span data-testid="elapsed-time">
                {hasDuration ? formatTime(displayedElapsed) : "LIVE"}
              </span>
              {hasDuration ? (
                <span data-testid="total-time">{formatTime(duration)}</span>
              ) : null}
            </div>
          </div>
'''
source = replace_between(
    source,
    playback_start,
    playback_end,
    playback_replacement,
    "playback block",
)

source_path.write_text(source)

css = css_path.read_text()
css = replace_once(
    css,
    '''  min-height: 7rem;
  grid-template-columns: 1.75rem minmax(0, 1fr) 3.5rem;
''',
    '''  min-height: 7rem;
  grid-template-columns: minmax(0, 1fr) 3.5rem;
''',
    "current compact grid",
)

css = replace_once(
    css,
    '''main:has(#now-playing-title)
  [data-testid="current-row"]
  > [data-slot="card-content"]
  > div:first-child {
  padding-top: 1rem;
}

main:has(#now-playing-title)
  [data-testid="current-row"]
  > [data-slot="card-content"]
  > div:first-child
  svg {
  width: 0.875rem;
  height: 0.875rem;
}

''',
    '''''',
    "remove compact grip rules",
)

css = css.replace(
    '''  > [data-slot="card-content"]
  > div:nth-child(2)''',
    '''  > [data-slot="card-content"]
  > div:first-child''',
)
css = replace_once(
    css,
    "  padding: 0.875rem 0.75rem 0.875rem 0.25rem;",
    "  padding: 0.875rem 0.75rem;",
    "current content padding",
)
css = css.replace(
    '''  > [data-slot="card-content"]
  > div:nth-child(3)''',
    '''  > [data-slot="card-content"]
  > div:last-child''',
)
css = css.replace(
    '[data-testid="current-row"] [role="slider"]',
    '[data-testid="current-row"] [data-testid="playback-rail"]',
)
css_path.write_text(css)

tests = test_path.read_text()
tests = replace_once(
    tests,
    '''    await expect(page.getByTestId("current-row")).toHaveCount(1)
    await expect(page.getByTestId("upcoming-row")).toHaveCount(5)
''',
    '''    await expect(page.getByTestId("current-row")).toHaveCount(1)
    await expect(
      page.getByTestId("current-row").locator("svg.lucide-grip-vertical")
    ).toHaveCount(0)
    await expect(page.getByTestId("upcoming-row")).toHaveCount(5)
''',
    "no current grip assertion",
)

seek_test = '''
  test("scrubs finite media with pre-alpha seek semantics and keeps LIVE non-seekable", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Pause" }).click()

    const slider = page.getByRole("slider", { name: "Playback position" })
    const sliderBox = await slider.boundingBox()
    if (!sliderBox) throw new Error("Playback slider has no bounding box")

    const initial = Number(await slider.getAttribute("aria-valuenow"))
    await page.mouse.move(
      sliderBox.x + sliderBox.width * 0.25,
      sliderBox.y + sliderBox.height / 2
    )
    await page.mouse.down()
    await page.mouse.move(
      sliderBox.x + sliderBox.width * 0.75,
      sliderBox.y + sliderBox.height / 2
    )

    const preview = Number(await slider.getAttribute("aria-valuenow"))
    expect(preview).toBeGreaterThan(initial)
    expect(Math.abs(preview - Math.round(4542 * 0.75))).toBeLessThan(8)
    await page.mouse.up()

    const committed = Number(await slider.getAttribute("aria-valuenow"))
    expect(Math.abs(committed - preview)).toBeLessThanOrEqual(1)

    await slider.focus()
    await slider.press("Home")
    await expect(slider).toHaveAttribute("aria-valuenow", "0")
    await slider.press("ArrowRight")
    await expect(slider).toHaveAttribute("aria-valuenow", "5")
    await slider.press("End")
    await expect(slider).toHaveAttribute("aria-valuenow", "4542")
    await slider.press("ArrowLeft")
    await expect(slider).toHaveAttribute("aria-valuenow", "4537")

    const input = page.getByRole("textbox", { name: "Media URL" })
    await input.fill("https://twitch.tv/example-live")
    await input.press("Enter")

    const current = page.getByTestId("current-row")
    const liveRow = page.getByTestId("upcoming-row").last()
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await liveRow.dispatchEvent("dragstart", { dataTransfer })
    await current.dispatchEvent("dragover", { dataTransfer })
    await current.dispatchEvent("drop", { dataTransfer })

    await expect(current).toContainText("https://twitch.tv/example-live")
    await expect(
      page.getByRole("slider", { name: "Playback position" })
    ).toHaveCount(0)
    await expect(page.getByTestId("elapsed-time")).toHaveText("LIVE")
    await expect(page.getByTestId("total-time")).toHaveCount(0)
  })

'''
needle = '  test("disables skip up when there is no Last Played history", async ({\n'
if needle not in tests:
    raise SystemExit("seek test insertion anchor missing")
tests = tests.replace(needle, seek_test + needle, 1)
test_path.write_text(tests)
