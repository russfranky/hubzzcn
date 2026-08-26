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
    '''  const [dragging, setDragging] = React.useState(false)\n\n  return (''',
    '''  const [dragging, setDragging] = React.useState(false)\n  const [dropInsertionIndex, setDropInsertionIndex] = React.useState<number | null>(\n    null\n  )\n\n  return (''',
    "drop indicator state",
)

source = replace_once(
    source,
    '''      onDragEnd={() => setDragging(false)}\n      onDragOver={(event) => {\n        event.preventDefault()\n        event.dataTransfer.dropEffect = "move"\n      }}\n      onDrop={(event) => {\n        event.preventDefault()\n        onDropSource(event.dataTransfer.getData("text/plain"), index)\n      }}\n      className={cn(\n        "grid min-h-16 grid-cols-[32px_minmax(0,1fr)_minmax(180px,280px)_96px] items-center gap-3 border-b border-border/60 px-3 py-2 transition-colors last:border-b-0 hover:bg-accent/25",\n        dragging && "opacity-45"\n      )}\n    >\n      <DragHandle''',
    '''      onDragEnd={() => {\n        setDragging(false)\n        setDropInsertionIndex(null)\n      }}\n      onDragOver={(event) => {\n        event.preventDefault()\n        event.dataTransfer.dropEffect = "move"\n        const rect = event.currentTarget.getBoundingClientRect()\n        const after = event.clientY >= rect.top + rect.height / 2\n        setDropInsertionIndex(index + (after ? 1 : 0))\n      }}\n      onDragLeave={(event) => {\n        const nextTarget = event.relatedTarget as Node | null\n        if (nextTarget && event.currentTarget.contains(nextTarget)) return\n        setDropInsertionIndex(null)\n      }}\n      onDrop={(event) => {\n        event.preventDefault()\n        const targetIndex = dropInsertionIndex ?? index\n        setDropInsertionIndex(null)\n        onDropSource(event.dataTransfer.getData("text/plain"), targetIndex)\n      }}\n      className={cn(\n        "relative grid min-h-16 grid-cols-[32px_minmax(0,1fr)_minmax(180px,280px)_96px] items-center gap-3 border-b border-border/60 px-3 py-2 transition-colors last:border-b-0 hover:bg-accent/25",\n        dragging && "opacity-45"\n      )}\n    >\n      {dropInsertionIndex !== null ? (\n        <span\n          data-testid="queue-drop-indicator"\n          data-position={dropInsertionIndex === index ? "before" : "after"}\n          aria-hidden="true"\n          className={cn(\n            "pointer-events-none absolute right-3 left-3 z-20 h-0.5 rounded-full bg-indigo-400",\n            dropInsertionIndex === index ? "-top-px" : "-bottom-px"\n          )}\n        />\n      ) : null}\n      <DragHandle''',
    "row drop preview behavior",
)

source = replace_once(
    source,
    '''  function insertHistory(index: number, targetIndex: number) {''',
    '''  function moveUpcomingToInsertion(from: number, insertionIndex: number) {\n    setUpcoming((items) => {\n      if (from < 0 || from >= items.length) return items\n\n      const next = [...items]\n      const [moved] = next.splice(from, 1)\n      const adjustedIndex = Math.max(\n        0,\n        Math.min(\n          insertionIndex - (from < insertionIndex ? 1 : 0),\n          next.length\n        )\n      )\n      next.splice(adjustedIndex, 0, moved)\n      return next\n    })\n  }\n\n  function insertHistory(index: number, targetIndex: number) {''',
    "insertion reorder helper",
)

source = replace_once(
    source,
    '''    if (kind === "upcoming") moveUpcoming(sourceIndex, targetIndex)\n    if (kind === "history") insertHistory(sourceIndex, targetIndex)''',
    '''    if (kind === "upcoming")\n      moveUpcomingToInsertion(sourceIndex, targetIndex)\n    if (kind === "history") insertHistory(sourceIndex, targetIndex)''',
    "drop insertion semantics",
)

source_path.write_text(source)


test_path = Path("tests/mqs-prototype.spec.ts")
tests = test_path.read_text()

marker = '''  test("turns the media input into a full-width drag-to-remove target", async ({\n'''
addition = '''  test("previews the exact queue insertion point while dragging", async ({\n    page,\n  }) => {\n    const rows = page.getByTestId("upcoming-row")\n    const sourceRow = rows.nth(0)\n    const targetRow = rows.nth(2)\n    const targetBox = await targetRow.boundingBox()\n    if (!targetBox) throw new Error("Target queue row has no bounding box")\n\n    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())\n    await sourceRow.dispatchEvent("dragstart", { dataTransfer })\n    await targetRow.dispatchEvent("dragover", {\n      dataTransfer,\n      clientX: targetBox.x + targetBox.width / 2,\n      clientY: targetBox.y + targetBox.height - 2,\n    })\n\n    const indicator = targetRow.getByTestId("queue-drop-indicator")\n    await expect(indicator).toBeVisible()\n    await expect(indicator).toHaveAttribute("data-position", "after")\n\n    await targetRow.dispatchEvent("drop", {\n      dataTransfer,\n      clientX: targetBox.x + targetBox.width / 2,\n      clientY: targetBox.y + targetBox.height - 2,\n    })\n\n    await expect(rows.nth(0)).toContainText("Calvin Harris")\n    await expect(rows.nth(1)).toContainText("Anjunadeep Open Air 2025")\n    await expect(rows.nth(2)).toContainText("Afterlife Tulum 2025")\n    await expect(page.getByTestId("queue-drop-indicator")).toHaveCount(0)\n  })\n\n''' + marker

tests = replace_once(tests, marker, addition, "drop preview browser test")
test_path.write_text(tests)
