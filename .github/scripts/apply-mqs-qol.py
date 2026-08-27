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
    '''      data-testid="upcoming-row"\n      draggable''',
    '''      data-testid="upcoming-row"\n      data-queue-id={item.id}\n      draggable''',
    "queue row id",
)

source = replace_once(
    source,
    '''      onDrop={(event) => {\n        event.preventDefault()\n        const targetIndex = dropInsertionIndex ?? index''',
    '''      onDrop={(event) => {\n        event.preventDefault()\n        event.stopPropagation()\n        const targetIndex = dropInsertionIndex ?? index''',
    "row drop propagation",
)

source = replace_once(
    source,
    '''  const [removeTargetActive, setRemoveTargetActive] = React.useState(false)\n  const [inputFocused, setInputFocused] = React.useState(false)\n  const fileInputRef = React.useRef<HTMLInputElement>(null)''',
    '''  const [removeTargetActive, setRemoveTargetActive] = React.useState(false)\n  const [inputFocused, setInputFocused] = React.useState(false)\n  const [queueTailDropActive, setQueueTailDropActive] = React.useState(false)\n  const [pendingRevealId, setPendingRevealId] = React.useState<string | null>(null)\n  const fileInputRef = React.useRef<HTMLInputElement>(null)''',
    "QoL state",
)

playback_effect = '''  React.useEffect(() => {\n    if (!isPlaying || !current?.durationSeconds) return\n\n    const timer = window.setInterval(() => {\n      setElapsed((value) =>\n        Math.min(current.durationSeconds ?? value, value + 1)\n      )\n    }, 1000)\n\n    return () => window.clearInterval(timer)\n  }, [current, isPlaying])'''
qol_effects = playback_effect + '''\n\n  React.useEffect(() => {\n    function focusComposer(event: KeyboardEvent) {\n      if (\n        event.key !== "/" ||\n        event.metaKey ||\n        event.ctrlKey ||\n        event.altKey ||\n        document.querySelector('[role="dialog"]')\n      ) {\n        return\n      }\n\n      const target = event.target\n      if (\n        target instanceof HTMLElement &&\n        target.closest('input, textarea, select, [contenteditable="true"]')\n      ) {\n        return\n      }\n\n      const input = document.querySelector<HTMLInputElement>(\n        'input[aria-label="Media URL"]'\n      )\n      if (!input) return\n\n      event.preventDefault()\n      input.focus()\n    }\n\n    window.addEventListener("keydown", focusComposer)\n    return () => window.removeEventListener("keydown", focusComposer)\n  }, [])\n\n  React.useEffect(() => {\n    if (!pendingRevealId) return\n\n    const frame = window.requestAnimationFrame(() => {\n      const row = Array.from(\n        document.querySelectorAll<HTMLElement>("[data-queue-id]")\n      ).find((element) => element.dataset.queueId === pendingRevealId)\n\n      row?.scrollIntoView({ block: "nearest" })\n      setPendingRevealId(null)\n    })\n\n    return () => window.cancelAnimationFrame(frame)\n  }, [pendingRevealId, upcoming])'''
source = replace_once(
    source,
    playback_effect,
    qol_effects,
    "QoL effects",
)

source = replace_once(
    source,
    '''  function insertHistory(index: number, targetIndex: number) {\n    const item = played[index]\n    if (!item) return\n\n    setPlayed''',
    '''  function insertHistory(index: number, targetIndex: number) {\n    const item = played[index]\n    if (!item) return\n\n    setPendingRevealId(item.id)\n    setPlayed''',
    "reveal requeued history",
)

source = replace_once(
    source,
    '''    setDragSource(source)\n    setRemoveTargetActive(false)''',
    '''    setDragSource(source)\n    setRemoveTargetActive(false)\n    setQueueTailDropActive(false)''',
    "drag start cleanup",
)

source = replace_once(
    source,
    '''    setRemoveTargetActive(false)\n    setDragSource(null)\n  }\n\n  function handleDropSource''',
    '''    setRemoveTargetActive(false)\n    setQueueTailDropActive(false)\n    setDragSource(null)\n  }\n\n  function handleDropSource''',
    "remove drop cleanup",
)

source = replace_once(
    source,
    '''    setUpcoming((items) =>\n      mode === "next" ? [item, ...items] : [...items, item]\n    )\n    setUrl("")''',
    '''    setUpcoming((items) =>\n      mode === "next" ? [item, ...items] : [...items, item]\n    )\n    setPendingRevealId(item.id)\n    setUrl("")''',
    "reveal added URL",
)

source = replace_once(
    source,
    '''      onDragEnd={() => {\n        setDragSource(null)\n        setRemoveTargetActive(false)\n      }}''',
    '''      onDragEnd={() => {\n        setDragSource(null)\n        setRemoveTargetActive(false)\n        setQueueTailDropActive(false)\n      }}''',
    "root drag cleanup",
)

source = replace_once(
    source,
    '''          <Card\n            data-testid="up-next-scroll"\n            className="min-h-0 flex-1 gap-0 overflow-y-auto rounded-xl bg-card py-0 ring-1 ring-foreground/10"\n          >''',
    '''          <Card\n            data-testid="up-next-scroll"\n            className="relative min-h-0 flex-1 gap-0 overflow-y-auto rounded-xl bg-card py-0 ring-1 ring-foreground/10"\n            onDragOver={(event) => {\n              if (!dragSource) return\n\n              event.preventDefault()\n              event.dataTransfer.dropEffect = "move"\n\n              const rect = event.currentTarget.getBoundingClientRect()\n              const edge = Math.min(48, rect.height * 0.2)\n              if (event.clientY <= rect.top + edge) {\n                event.currentTarget.scrollTop -= 24\n              } else if (event.clientY >= rect.bottom - edge) {\n                event.currentTarget.scrollTop += 24\n              }\n\n              const row = (event.target as HTMLElement).closest(\n                '[data-testid="upcoming-row"]'\n              )\n              setQueueTailDropActive(!row)\n            }}\n            onDragLeave={(event) => {\n              const next = event.relatedTarget as Node | null\n              if (next && event.currentTarget.contains(next)) return\n              setQueueTailDropActive(false)\n            }}\n            onDrop={(event) => {\n              if ((event.target as HTMLElement).closest('[data-testid="upcoming-row"]')) {\n                return\n              }\n\n              event.preventDefault()\n              const source =\n                event.dataTransfer.getData("text/plain") || dragSource || ""\n              handleDropSource(source, upcoming.length)\n              setQueueTailDropActive(false)\n            }}\n          >\n            {queueTailDropActive ? (\n              <span\n                data-testid="queue-tail-drop-indicator"\n                aria-hidden="true"\n                className={cn(\n                  "pointer-events-none absolute right-2 left-2 z-30 h-0.5 rounded-full bg-indigo-400",\n                  upcoming.length === 0 ? "top-2" : "bottom-0"\n                )}\n              />\n            ) : null}''',
    "Up Next QoL drop surface",
)

source = replace_once(
    source,
    '''                  onKeyDown={(event) => {\n                    if (event.key === "Enter") {\n                      event.preventDefault()\n                      addUrl("tail")\n                    }\n                  }}\n                  aria-label="Media URL"''',
    '''                  onKeyDown={(event) => {\n                    if (event.key === "Escape") {\n                      event.preventDefault()\n                      event.currentTarget.blur()\n                      setInputFocused(false)\n                      setError(null)\n                      return\n                    }\n\n                    if (event.key === "Enter") {\n                      event.preventDefault()\n                      addUrl("tail")\n                    }\n                  }}\n                  aria-label="Media URL"\n                  aria-keyshortcuts="/"''',
    "composer keyboard QoL",
)

source_path.write_text(source)


test_path = Path("tests/mqs-prototype.spec.ts")
tests = test_path.read_text()

keyboard_test_anchor = '''  test("previews the exact queue insertion point while dragging", async ({\n    page,\n  }) => {'''
keyboard_test = '''  test("supports slash-to-focus and Escape without losing the media draft", async ({\n    page,\n  }) => {\n    const input = page.getByRole("textbox", { name: "Media URL" })\n\n    await page.keyboard.press("/")\n    await expect(input).toBeFocused()\n    await expect(\n      page.getByRole("button", { name: "Add media to queue" })\n    ).toBeVisible()\n\n    await input.fill("https://example.com/draft")\n    await input.press("Escape")\n\n    await expect(input).not.toBeFocused()\n    await expect(input).toHaveValue("https://example.com/draft")\n    await expect(\n      page.getByRole("button", { name: "Queue actions" })\n    ).toBeVisible()\n  })\n\n'''+keyboard_test_anchor
tests = replace_once(
    tests,
    keyboard_test_anchor,
    keyboard_test,
    "keyboard QoL test",
)

empty_drop_anchor = '''  test("keeps composer geometry fixed while dragging and centers the removal poof", async ({\n    page,\n  }) => {'''
empty_drop_test = '''  test("accepts history drops into an empty Up Next area", async ({ page }) => {\n    await page.getByRole("button", { name: "Queue actions" }).click()\n    await page.getByRole("menuitem", { name: "Clear upcoming" }).click()\n    await expect(page.getByTestId("upcoming-row")).toHaveCount(0)\n\n    const history = page.getByTestId("history-row").first()\n    const upNext = page.getByTestId("up-next-scroll")\n    const upNextBox = await upNext.boundingBox()\n    if (!upNextBox) throw new Error("Up Next has no bounding box")\n    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())\n\n    await history.dispatchEvent("dragstart", { dataTransfer })\n    await upNext.dispatchEvent("dragover", {\n      dataTransfer,\n      clientX: upNextBox.x + upNextBox.width / 2,\n      clientY: upNextBox.y + upNextBox.height / 2,\n    })\n    await expect(page.getByTestId("queue-tail-drop-indicator")).toBeVisible()\n\n    await upNext.dispatchEvent("drop", {\n      dataTransfer,\n      clientX: upNextBox.x + upNextBox.width / 2,\n      clientY: upNextBox.y + upNextBox.height / 2,\n    })\n\n    await expect(page.getByTestId("upcoming-row")).toHaveCount(1)\n    await expect(page.getByTestId("upcoming-row").first()).toContainText(\n      "Sunset Drive 2025"\n    )\n  })\n\n'''+empty_drop_anchor
tests = replace_once(
    tests,
    empty_drop_anchor,
    empty_drop_test,
    "empty Up Next drop test",
)

long_queue_count_anchor = '''    await expect(page.getByTestId("upcoming-row")).toHaveCount(31)\n  })'''
long_queue_qol = '''    await expect(page.getByTestId("upcoming-row")).toHaveCount(31)\n\n    const upNext = page.getByTestId("up-next-scroll")\n    const firstRow = page.getByTestId("upcoming-row").first()\n    const upNextBox = await upNext.boundingBox()\n    if (!upNextBox) throw new Error("Up Next has no bounding box")\n    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())\n    await firstRow.dispatchEvent("dragstart", { dataTransfer })\n\n    const beforeScroll = await upNext.evaluate((element) => element.scrollTop)\n    for (let index = 0; index < 8; index += 1) {\n      await upNext.dispatchEvent("dragover", {\n        dataTransfer,\n        clientX: upNextBox.x + upNextBox.width / 2,\n        clientY: upNextBox.y + upNextBox.height - 2,\n      })\n    }\n    const afterScroll = await upNext.evaluate((element) => element.scrollTop)\n    expect(afterScroll).toBeGreaterThan(beforeScroll)\n    await firstRow.dispatchEvent("dragend", { dataTransfer })\n\n    const input = page.getByRole("textbox", { name: "Media URL" })\n    await input.fill("https://example.com/reveal-me")\n    await input.press("Enter")\n    await expect(page.getByTestId("upcoming-row")).toHaveCount(32)\n    const added = page.getByTestId("upcoming-row").last()\n    await expect(added).toContainText("https://example.com/reveal-me")\n    await expect(added).toBeInViewport()\n  })'''
tests = replace_once(
    tests,
    long_queue_count_anchor,
    long_queue_qol,
    "long queue QoL assertions",
)

test_path.write_text(tests)
