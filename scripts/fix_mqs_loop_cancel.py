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
    """  const loopHoldItemRef = React.useRef<string | null>(null)
  const loopHoldTargetRef = React.useRef<HTMLButtonElement | null>(null)
  const suppressPlaybackClickRef = React.useRef(false)""",
    """  const loopHoldItemRef = React.useRef<string | null>(null)
  const loopHoldTargetRef = React.useRef<HTMLButtonElement | null>(null)
  const loopHoldCanceledRef = React.useRef(false)
  const suppressPlaybackClickRef = React.useRef(false)""",
    "cancel ref",
)

src = replace_once(
    src,
    """    loopHoldPointerRef.current = null
    loopHoldOriginRef.current = null
    loopHoldItemRef.current = null
    loopHoldTargetRef.current = null
  }

  function beginLoopHold""",
    """    loopHoldPointerRef.current = null
    loopHoldOriginRef.current = null
    loopHoldItemRef.current = null
    loopHoldTargetRef.current = null
    loopHoldCanceledRef.current = false
  }

  function beginLoopHold""",
    "reset canceled",
)

src = replace_once(
    src,
    """    loopHoldItemRef.current = item.id
    loopHoldTargetRef.current = event.currentTarget

    try {""",
    """    loopHoldItemRef.current = item.id
    loopHoldTargetRef.current = event.currentTarget
    loopHoldCanceledRef.current = false

    try {""",
    "begin canceled",
)

src = replace_once(
    src,
    """  function moveLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
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
  }""",
    """  function moveLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (loopHoldPointerRef.current !== event.pointerId) return
    if (loopHoldCanceledRef.current) return

    const origin = loopHoldOriginRef.current
    if (!origin) return

    const distance = Math.hypot(
      event.clientX - origin.x,
      event.clientY - origin.y
    )
    if (distance <= LOOP_MOVE_TOLERANCE_PX) return

    loopHoldCanceledRef.current = true
    suppressPlaybackClickRef.current = true
    if (loopHoldTimerRef.current !== null) {
      window.clearTimeout(loopHoldTimerRef.current)
      loopHoldTimerRef.current = null
    }
  }

  function endLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (loopHoldPointerRef.current !== event.pointerId) return

    const suppressClick = suppressPlaybackClickRef.current
    clearLoopHold()
    if (suppressClick) {
      window.setTimeout(() => {
        suppressPlaybackClickRef.current = false
      }, 0)
    }
  }""",
    "movement and release",
)

src = replace_once(
    src,
    """  React.useEffect(() => {
    if (previousItemIdRef.current === item.id) return
    previousItemIdRef.current = item.id

    if (
      loopHoldTimerRef.current !== null ||
      loopHoldPointerRef.current !== null
    ) {
      suppressPlaybackClickRef.current = true
    }
    clearLoopHold()
  }, [item.id])""",
    """  React.useEffect(() => {
    if (previousItemIdRef.current === item.id) return
    previousItemIdRef.current = item.id

    if (loopHoldPointerRef.current === null) return

    loopHoldCanceledRef.current = true
    suppressPlaybackClickRef.current = true
    if (loopHoldTimerRef.current !== null) {
      window.clearTimeout(loopHoldTimerRef.current)
      loopHoldTimerRef.current = null
    }
  }, [item.id])""",
    "item-change cancel",
)

SRC.write_text(src)


test = TEST.read_text()

test = replace_once(
    test,
    """    await page.mouse.move(center.x + 18, center.y)
    await page.waitForTimeout(650)
    await page.mouse.up()

    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(
      "data-looping",
      "false"
    )
  })""",
    """    await page.mouse.move(center.x + 80, center.y)
    await page.waitForTimeout(650)
    await page.mouse.up()

    const stillPaused = page.getByRole("button", { name: "Pause" })
    await expect(stillPaused).toHaveAttribute("data-looping", "false")
    await stillPaused.click()
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible()
  })""",
    "movement cancel test",
)

test = replace_once(
    test,
    """    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(
      "data-looping",
      "false"
    )
  })

  test("loops finite media after the long-press toggle""",
    """    const stillPaused = page.getByRole("button", { name: "Pause" })
    await expect(stillPaused).toHaveAttribute("data-looping", "false")
    await stillPaused.click()
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible()
  })

  test("loops finite media after the long-press toggle""",
    "item change test",
)

TEST.write_text(test)
