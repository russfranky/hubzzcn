from pathlib import Path

source_path = Path("src/pages/MqsPrototype.tsx")
source = source_path.read_text()
old = '''          <div className="mt-8 grid grid-cols-[64px_minmax(0,1fr)_84px] items-center gap-3">
            <span className="text-base text-muted-foreground tabular-nums">
              {hasDuration ? formatTime(elapsed) : "LIVE"}
            </span>

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

            <span className="justify-self-end text-base text-muted-foreground tabular-nums">
              {hasDuration ? formatTime(duration) : "LIVE"}
            </span>
          </div>
'''
new = '''          <div data-testid="playback-progress" className="mt-8">
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
'''
if source.count(old) != 1:
    raise SystemExit(f"progress markup anchor count: {source.count(old)}")
source_path.write_text(source.replace(old, new, 1))

css_path = Path("src/index.css")
css = css_path.read_text()
old_css = '''main:has(#now-playing-title)
  [data-testid="current-row"]
  > [data-slot="card-content"]
  > div:nth-child(2)
  > div:nth-child(3) {
  margin-top: 1rem;
  grid-template-columns: 2.75rem minmax(0, 1fr) 3.25rem;
  gap: 0.5rem;
}

main:has(#now-playing-title)
  [data-testid="current-row"]
  > [data-slot="card-content"]
  > div:nth-child(2)
  > div:nth-child(3)
  > span {
  font-size: 0.6875rem;
  line-height: 1rem;
}
'''
new_css = '''main:has(#now-playing-title)
  [data-testid="current-row"]
  [data-testid="playback-progress"] {
  margin-top: 1rem;
}

main:has(#now-playing-title)
  [data-testid="current-row"]
  [data-testid="playback-times"] {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  line-height: 1rem;
}
'''
if css.count(old_css) != 1:
    raise SystemExit(f"progress css anchor count: {css.count(old_css)}")
css_path.write_text(css.replace(old_css, new_css, 1))

test_path = Path("tests/mqs-prototype.spec.ts")
tests = test_path.read_text()
anchor = '''  test("disables skip up when there is no Last Played history", async ({
    page,
  }) => {'''
test = '''  test("places elapsed and total time under the playback bar", async ({ page }) => {
    const slider = page.getByRole("slider", { name: "Playback position" })
    const elapsed = page.getByTestId("elapsed-time")
    const total = page.getByTestId("total-time")

    const sliderBox = await slider.boundingBox()
    const elapsedBox = await elapsed.boundingBox()
    const totalBox = await total.boundingBox()
    if (!sliderBox || !elapsedBox || !totalBox) {
      throw new Error("Playback geometry is unavailable")
    }

    expect(elapsedBox.y).toBeGreaterThanOrEqual(sliderBox.y + sliderBox.height)
    expect(totalBox.y).toBeGreaterThanOrEqual(sliderBox.y + sliderBox.height)
    expect(Math.abs(elapsedBox.x - sliderBox.x)).toBeLessThan(2)
    expect(
      Math.abs(totalBox.x + totalBox.width - (sliderBox.x + sliderBox.width))
    ).toBeLessThan(2)
  })

'''
if anchor not in tests:
    raise SystemExit("test insertion anchor missing")
test_path.write_text(tests.replace(anchor, test + anchor, 1))
