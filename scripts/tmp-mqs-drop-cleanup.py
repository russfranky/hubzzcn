from pathlib import Path

source_path = Path("src/pages/MqsPrototype.tsx")
source = source_path.read_text()
old = '''  function handleDropSource(source: string, targetIndex: number) {
    const [kind, rawIndex] = source.split(":")
    const sourceIndex = Number(rawIndex)
    if (!Number.isInteger(sourceIndex)) return

    if (kind === "upcoming") moveUpcomingToInsertion(sourceIndex, targetIndex)
    if (kind === "history") insertHistory(sourceIndex, targetIndex)
  }
'''
new = '''  function handleDropSource(source: string, targetIndex: number) {
    const [kind, rawIndex] = source.split(":")
    const sourceIndex = Number(rawIndex)
    if (!Number.isInteger(sourceIndex)) return

    let handled = false
    if (kind === "upcoming") {
      moveUpcomingToInsertion(sourceIndex, targetIndex)
      handled = true
    }
    if (kind === "history") {
      insertHistory(sourceIndex, targetIndex)
      handled = true
    }

    if (handled) {
      setDragSource(null)
      setRemoveTargetActive(false)
      setQueueTailDropActive(false)
    }
  }
'''
if source.count(old) != 1:
    raise SystemExit(f"handleDropSource anchor count: {source.count(old)}")
source_path.write_text(source.replace(old, new, 1))

test_path = Path("tests/mqs-prototype.spec.ts")
tests = test_path.read_text()
anchor = '''  test("previews the exact queue insertion point while dragging", async ({
    page,
  }) => {'''
test = '''  test("restores the media input immediately after requeueing history", async ({
    page,
  }) => {
    const historyRow = page.getByTestId("history-row").first()
    const targetRow = page.getByTestId("upcoming-row").first()
    const targetBox = await targetRow.boundingBox()
    if (!targetBox) throw new Error("Target queue row has no bounding box")

    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await historyRow.dispatchEvent("dragstart", { dataTransfer })
    await expect(page.getByTestId("remove-drop-target")).toBeVisible()

    await targetRow.dispatchEvent("dragover", {
      dataTransfer,
      clientX: targetBox.x + targetBox.width / 2,
      clientY: targetBox.y + 2,
    })
    await targetRow.dispatchEvent("drop", {
      dataTransfer,
      clientX: targetBox.x + targetBox.width / 2,
      clientY: targetBox.y + 2,
    })

    await expect(page.getByRole("textbox", { name: "Media URL" })).toBeVisible()
    await expect(page.getByTestId("remove-drop-target")).toHaveCount(0)
    await expect(page.getByTestId("history-row")).toHaveCount(2)
    await expect(page.getByTestId("upcoming-row").first()).toContainText(
      "Sunset Drive 2025"
    )
  })

'''
if anchor not in tests:
    raise SystemExit("test anchor missing")
test_path.write_text(tests.replace(anchor, test + anchor, 1))
