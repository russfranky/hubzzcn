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
    """  const loopHoldCanceledRef = React.useRef(false)
  const suppressPlaybackClickRef = React.useRef(false)
  const latestItemIdRef = React.useRef(item.id)""",
    """  const loopHoldCanceledRef = React.useRef(false)
  const suppressPlaybackClickRef = React.useRef(false)
  const loopKeyTimerRef = React.useRef<number | null>(null)
  const loopKeyRef = React.useRef<{
    key: string
    itemId: string
    toggled: boolean
  } | null>(null)
  const latestItemIdRef = React.useRef(item.id)""",
    "keyboard refs",
)

src = replace_once(
    src,
    """  function cancelLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (loopHoldPointerRef.current !== event.pointerId) return
    suppressPlaybackClickRef.current = false
    clearLoopHold(false)
  }

  function loseLoopPointerCapture(""",
    """  function cancelLoopHold(event: React.PointerEvent<HTMLButtonElement>) {
    if (loopHoldPointerRef.current !== event.pointerId) return
    suppressPlaybackClickRef.current = false
    clearLoopHold(false)
  }

  function clearLoopKeyHold() {
    if (loopKeyTimerRef.current !== null) {
      window.clearTimeout(loopKeyTimerRef.current)
      loopKeyTimerRef.current = null
    }
    loopKeyRef.current = null
  }

  function beginLoopKeyHold(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== " " && event.key !== "Enter") return
    if (event.repeat || loopKeyRef.current !== null) return

    event.preventDefault()
    const hold = { key: event.key, itemId: item.id, toggled: false }
    loopKeyRef.current = hold
    loopKeyTimerRef.current = window.setTimeout(() => {
      if (
        loopKeyRef.current !== hold ||
        latestItemIdRef.current !== hold.itemId
      ) {
        return
      }

      loopKeyTimerRef.current = null
      hold.toggled = true
      onToggleLooping(hold.itemId)
    }, LOOP_HOLD_MS)
  }

  function endLoopKeyHold(event: React.KeyboardEvent<HTMLButtonElement>) {
    const hold = loopKeyRef.current
    if (!hold || hold.key !== event.key) return

    event.preventDefault()
    if (loopKeyTimerRef.current !== null) {
      window.clearTimeout(loopKeyTimerRef.current)
      loopKeyTimerRef.current = null
    }
    loopKeyRef.current = null

    if (!hold.toggled && latestItemIdRef.current === hold.itemId) {
      onTogglePlaying()
    }
  }

  function loseLoopKeyFocus() {
    clearLoopKeyHold()
  }

  function loseLoopPointerCapture(""",
    "keyboard handlers",
)

src = replace_once(
    src,
    """    if (loopHoldPointerRef.current === null) return

    loopHoldCanceledRef.current = true
    suppressPlaybackClickRef.current = true
    if (loopHoldTimerRef.current !== null) {
      window.clearTimeout(loopHoldTimerRef.current)
      loopHoldTimerRef.current = null
    }
  }, [item.id])""",
    """    if (loopKeyRef.current !== null) {
      clearLoopKeyHold()
    }

    if (loopHoldPointerRef.current === null) return

    loopHoldCanceledRef.current = true
    suppressPlaybackClickRef.current = true
    if (loopHoldTimerRef.current !== null) {
      window.clearTimeout(loopHoldTimerRef.current)
      loopHoldTimerRef.current = null
    }
  }, [item.id])""",
    "item change keyboard cancel",
)

src = replace_once(
    src,
    """      if (loopHoldTimerRef.current !== null) {
        window.clearTimeout(loopHoldTimerRef.current)
      }
    }
  }, [])""",
    """      if (loopHoldTimerRef.current !== null) {
        window.clearTimeout(loopHoldTimerRef.current)
      }
      if (loopKeyTimerRef.current !== null) {
        window.clearTimeout(loopKeyTimerRef.current)
      }
    }
  }, [])""",
    "keyboard cleanup",
)

src = replace_once(
    src,
    """            data-looping={item.looping ? "true" : "false"}
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
            onPointerDown={beginLoopHold}""",
    """            data-looping={item.looping ? "true" : "false"}
            aria-label={isPlaying ? "Pause" : "Play"}
            aria-description={`Hold Space or Enter to toggle Loop. Loop is ${item.looping ? "on" : "off"}.`}
            title={isPlaying ? "Pause" : "Play"}
            onKeyDown={beginLoopKeyHold}
            onKeyUp={endLoopKeyHold}
            onBlur={loseLoopKeyFocus}
            onPointerDown={beginLoopHold}""",
    "button keyboard props",
)

SRC.write_text(src)


test = TEST.read_text()
anchor = """  test("cancels the loop hold when the pointer moves", async ({ page }) => {"""
insert = """  test("supports the same Loop hold from the keyboard", async ({ page }) => {
    const pause = page.getByRole("button", { name: "Pause" })
    await pause.focus()
    await expect(pause).toHaveAttribute(
      "aria-description",
      "Hold Space or Enter to toggle Loop. Loop is off."
    )

    await page.keyboard.down("Space")
    await page.waitForTimeout(650)
    await page.keyboard.up("Space")

    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(
      "data-looping",
      "true"
    )
    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(
      "aria-description",
      "Hold Space or Enter to toggle Loop. Loop is on."
    )

    await page.keyboard.press("Enter")
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible()
  })

""" + anchor

test = replace_once(test, anchor, insert, "keyboard test")
TEST.write_text(test)
