from pathlib import Path

SRC = Path("src/pages/MqsPrototype.tsx")
TEST = Path("tests/mqs-prototype.spec.ts")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


src = SRC.read_text()

src = replace_once(
    src,
    "  durationSeconds?: number\n}",
    "  durationSeconds?: number\n  looping?: boolean\n}",
    "QueueItem.looping",
)

src = replace_once(
    src,
    "const HISTORY_LIMIT = 3\nconst SETLIST_LIMIT = 500",
    "const HISTORY_LIMIT = 3\nconst SETLIST_LIMIT = 500\nconst LOOP_HOLD_MS = 600\nconst LOOP_MOVE_TOLERANCE_PX = 12",
    "loop constants",
)

src = replace_once(
    src,
    "  onElapsedChange,\n  onTogglePlaying,\n  onSkipUp,",
    "  onElapsedChange,\n  onTogglePlaying,\n  onToggleLooping,\n  onSkipUp,",
    "CurrentCard args",
)

src = replace_once(
    src,
    "  onElapsedChange: (value: number) => void\n  onTogglePlaying: () => void\n  onSkipUp: () => void",
    "  onElapsedChange: (value: number) => void\n  onTogglePlaying: () => void\n  onToggleLooping: (itemId: string) => void\n  onSkipUp: () => void",
    "CurrentCard prop type",
)

src = replace_once(
    src,
    "  const [scrubSeconds, setScrubSeconds] = React.useState<number | null>(null)\n  const duration = item.durationSeconds ?? 0",
    """  const [scrubSeconds, setScrubSeconds] = React.useState<number | null>(null)
  const loopHoldTimerRef = React.useRef<number | null>(null)
  const loopHoldPointerRef = React.useRef<number | null>(null)
  const loopHoldOriginRef = React.useRef<{ x: number; y: number } | null>(null)
  const loopHoldItemRef = React.useRef<string | null>(null)
  const loopHoldTargetRef = React.useRef<HTMLButtonElement | null>(null)
  const suppressPlaybackClickRef = React.useRef(false)
  const latestItemIdRef = React.useRef(item.id)
  const previousItemIdRef = React.useRef(item.id)
  const duration = item.durationSeconds ?? 0""",
    "loop hold refs",
)

src = replace_once(
    src,
    "  const progress = hasDuration\n    ? Math.min(100, Math.max(0, (displayedElapsed / duration) * 100))\n    : 0\n\n  function secondsFromPointer",
    """  const progress = hasDuration
    ? Math.min(100, Math.max(0, (displayedElapsed / duration) * 100))
    : 0

  latestItemIdRef.current = item.id

  function clearLoopHold(releasePointer = true) {
    if (loopHoldTimerRef.current !== null) {
      window.clearTimeout(loopHoldTimerRef.current)
      loopHoldTimerRef.current = null
    }

    const target = loopHoldTargetRef.current
    const pointerId = loopHoldPointerRef.current
    if (releasePointer && target && pointerId !== null) {
      try {
        if (target.hasPointerCapture(pointerId)) {
          target.releasePointerCapture(pointerId)
        }
      } catch {
        // Pointer capture can end before React receives the event.
      }
    }

    loopHoldPointerRef.current = null
    loopHoldOriginRef.current = null
    loopHoldItemRef.current = null
    loopHoldTargetRef.current = null
  }

  function beginLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return

    clearLoopHold()
    suppressPlaybackClickRef.current = false
    loopHoldPointerRef.current = event.pointerId
    loopHoldOriginRef.current = { x: event.clientX, y: event.clientY }
    loopHoldItemRef.current = item.id
    loopHoldTargetRef.current = event.currentTarget

    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Pointer capture is optional.
    }

    const pressedItemId = item.id
    loopHoldTimerRef.current = window.setTimeout(() => {
      if (
        loopHoldPointerRef.current !== event.pointerId ||
        loopHoldItemRef.current !== pressedItemId ||
        latestItemIdRef.current !== pressedItemId
      ) {
        return
      }

      loopHoldTimerRef.current = null
      suppressPlaybackClickRef.current = true
      onToggleLooping(pressedItemId)
    }, LOOP_HOLD_MS)
  }

  function moveLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (loopHoldPointerRef.current !== event.pointerId) return
    const origin = loopHoldOriginRef.current
    if (!origin) return

    const distance = Math.hypot(
      event.clientX - origin.x,
      event.clientY - origin.y
    )
    if (distance <= LOOP_MOVE_TOLERANCE_PX) return

    suppressPlaybackClickRef.current = true
    clearLoopHold()
  }

  function endLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (loopHoldPointerRef.current !== event.pointerId) return
    clearLoopHold()
  }

  function cancelLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (loopHoldPointerRef.current !== event.pointerId) return
    suppressPlaybackClickRef.current = false
    clearLoopHold(false)
  }

  function loseLoopPointerCapture(
    event: React.PointerEvent<HTMLButtonElement>
  ) {
    if (loopHoldPointerRef.current !== event.pointerId) return
    suppressPlaybackClickRef.current = false
    clearLoopHold(false)
  }

  React.useEffect(() => {
    if (previousItemIdRef.current === item.id) return
    previousItemIdRef.current = item.id

    if (
      loopHoldTimerRef.current !== null ||
      loopHoldPointerRef.current !== null
    ) {
      suppressPlaybackClickRef.current = true
    }
    clearLoopHold()
  }, [item.id])

  React.useEffect(() => {
    return () => {
      if (loopHoldTimerRef.current !== null) {
        window.clearTimeout(loopHoldTimerRef.current)
      }
    }
  }, [])

  function secondsFromPointer""",
    "loop hold behavior",
)

src = replace_once(
    src,
    """          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="rounded-full bg-card"
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlaying}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>""",
    """          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            className="touch-manipulation rounded-full bg-card"
            data-looping={item.looping ? "true" : "false"}
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
            onPointerDown={beginLoopHold}
            onPointerMove={moveLoopHold}
            onPointerUp={endLoopHold}
            onPointerCancel={cancelLoopHold}
            onLostPointerCapture={loseLoopPointerCapture}
            onContextMenu={(event) => {
              if (loopHoldPointerRef.current !== null) event.preventDefault()
            }}
            onClick={() => {
              if (suppressPlaybackClickRef.current) {
                suppressPlaybackClickRef.current = false
                return
              }
              onTogglePlaying()
            }}
          >
            {isPlaying ? <Pause /> : <Play />}
          </Button>""",
    "playback button",
)

src = replace_once(
    src,
    """    const timer = window.setInterval(() => {
      setElapsed((value) =>
        Math.min(current.durationSeconds ?? value, value + 1)
      )
    }, 1000)""",
    """    const timer = window.setInterval(() => {
      setElapsed((value) => {
        const duration = current.durationSeconds ?? value
        const next = value + 1
        if (current.looping && next >= duration) return 0
        return Math.min(duration, next)
      })
    }, 1000)""",
    "playback loop",
)

src = replace_once(
    src,
    "  function addUrl(mode: \"tail\" | \"next\") {",
    """  function toggleCurrentLoopForItem(itemId: string) {
    setCurrent((item) =>
      item?.id === itemId ? { ...item, looping: !item.looping } : item
    )
  }

  function addUrl(mode: "tail" | "next") {""",
    "toggle current loop",
)

src = replace_once(
    src,
    """              onElapsedChange={setElapsed}
              onTogglePlaying={() => setIsPlaying((value) => !value)}
              onSkipUp={skipUp}""",
    """              onElapsedChange={setElapsed}
              onTogglePlaying={() => setIsPlaying((value) => !value)}
              onToggleLooping={toggleCurrentLoopForItem}
              onSkipUp={skipUp}""",
    "CurrentCard callback",
)

SRC.write_text(src)


test = TEST.read_text()
anchor = """  test("places elapsed and total time under the playback bar", async ({
    page,
  }) => {"""
insert = """  test("toggles loop with a long press without changing playback", async ({
    page,
  }) => {
    const pause = page.getByRole("button", { name: "Pause" })
    const box = await pause.boundingBox()
    if (!box) throw new Error("Pause control has no bounding box")

    const center = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    }

    await expect(pause).toHaveAttribute("data-looping", "false")
    await page.mouse.move(center.x, center.y)
    await page.mouse.down()
    await page.waitForTimeout(650)
    await page.mouse.up()

    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(
      "data-looping",
      "true"
    )

    await page.mouse.down()
    await page.waitForTimeout(650)
    await page.mouse.up()

    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(
      "data-looping",
      "false"
    )
  })

  test("cancels the loop hold when the pointer moves", async ({ page }) => {
    const pause = page.getByRole("button", { name: "Pause" })
    const box = await pause.boundingBox()
    if (!box) throw new Error("Pause control has no bounding box")

    const center = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    }

    await page.mouse.move(center.x, center.y)
    await page.mouse.down()
    await page.mouse.move(center.x + 18, center.y)
    await page.waitForTimeout(650)
    await page.mouse.up()

    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(
      "data-looping",
      "false"
    )
  })

  test("cancels a loop hold when the current item changes", async ({ page }) => {
    const pause = page.getByRole("button", { name: "Pause" })
    const box = await pause.boundingBox()
    if (!box) throw new Error("Pause control has no bounding box")

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page
      .getByRole("button", { name: "Skip down" })
      .evaluate((element) => (element as HTMLButtonElement).click())

    await expect(page.getByTestId("current-row")).toContainText(
      "Afterlife Tulum 2025"
    )
    await page.waitForTimeout(650)
    await page.mouse.up()

    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(
      "data-looping",
      "false"
    )
  })

  test("loops finite media after the long-press toggle", async ({ page }) => {
    const pause = page.getByRole("button", { name: "Pause" })
    const box = await pause.boundingBox()
    if (!box) throw new Error("Pause control has no bounding box")

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await page.waitForTimeout(650)
    await page.mouse.up()
    await expect(pause).toHaveAttribute("data-looping", "true")

    await pause.click()
    const slider = page.getByRole("slider", { name: "Playback position" })
    await slider.focus()
    await slider.press("End")
    await expect(slider).toHaveAttribute("aria-valuenow", "4542")

    await page.getByRole("button", { name: "Play" }).click()
    await expect
      .poll(async () => Number(await slider.getAttribute("aria-valuenow")), {
        timeout: 2500,
      })
      .toBeLessThan(5)
  })

""" + anchor

test = replace_once(test, anchor, insert, "loop tests")
TEST.write_text(test)
