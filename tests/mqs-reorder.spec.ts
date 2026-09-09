import { expect, test, type Page } from "@playwright/test"

const QUEUE_DRAG_TYPE = "application/x-hubzz-mqs-reorder"
const rows = (page: Page) =>
  page.getByRole("list", { name: "Media queue items" }).getByRole("listitem")
const lastCommand = (page: Page) => page.getByTestId("last-mqs-command")
const handle = (page: Page, index: number) =>
  page.getByRole("button", { name: `Reorder item ${index}` })

test.describe("MQS reorder boundaries", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?prototype=mqs")
    await expect(rows(page)).toHaveCount(5)
  })

  test("blocks moves outside the queue", async ({ page }) => {
    const original = await rows(page).allTextContents()
    await handle(page, 1).press("Alt+ArrowUp")
    await handle(page, 5).press("Alt+ArrowDown")
    await expect(lastCommand(page)).toHaveText("")
    await expect(rows(page)).toHaveText(original)
  })

  test("blocks moves in a single-item queue", async ({ page }) => {
    await page.getByRole("button", { name: "Clear queue" }).click()
    await expect(rows(page)).toHaveCount(1)
    await handle(page, 1).press("Alt+ArrowUp")
    await handle(page, 1).press("Alt+ArrowDown")
    await expect(lastCommand(page)).toHaveText("--clearqueue")
    await expect(rows(page)).toContainText("Tomorrowland 2026 Mainstage W1")
  })

  test("keeps keyboard commands and focus", async ({ page }) => {
    const original = await rows(page).allTextContents()
    const row = rows(page).filter({ hasText: "Afterlife Tulum 2025" })
    const control = row.getByRole("button", { name: /^Reorder item/ })
    await control.press("Alt+ArrowUp")
    await expect(lastCommand(page)).toHaveText("--move 3 2")
    await expect(rows(page).nth(1)).toContainText("Afterlife Tulum 2025")
    await expect(control).toBeFocused()
    await control.press("Alt+ArrowDown")
    await expect(lastCommand(page)).toHaveText("--move 2 3")
    await expect(rows(page)).toHaveText(original)
    await expect(control).toBeFocused()
  })

  test("ignores arrow keys without Alt", async ({ page }) => {
    const original = await rows(page).allTextContents()
    await handle(page, 3).press("ArrowUp")
    await handle(page, 3).press("ArrowDown")
    await expect(lastCommand(page)).toHaveText("")
    await expect(rows(page)).toHaveText(original)
  })

  test("ignores external text and empty drops", async ({ page }) => {
    const original = await rows(page).allTextContents()
    const texts = ["", "0", "2", "-1", "999", "1.5", "https://example.com"]
    for (const text of texts) {
      const dataTransfer = await page.evaluateHandle((value) => {
        const transfer = new DataTransfer()
        if (value) transfer.setData("text/plain", value)
        return transfer
      }, text)
      await rows(page).nth(3).dispatchEvent("dragover", { dataTransfer })
      await rows(page).nth(3).dispatchEvent("drop", { dataTransfer })
      await expect(lastCommand(page)).toHaveText("")
      await expect(rows(page)).toHaveText(original)
      await dataTransfer.dispose()
    }
  })

  test("ignores external files", async ({ page }) => {
    const original = await rows(page).allTextContents()
    const dataTransfer = await page.evaluateHandle(() => {
      const transfer = new DataTransfer()
      transfer.items.add(new File(["0"], "queue.txt", { type: "text/plain" }))
      return transfer
    })
    await rows(page).nth(2).dispatchEvent("dragover", { dataTransfer })
    await rows(page).nth(2).dispatchEvent("drop", { dataTransfer })
    await expect(lastCommand(page)).toHaveText("")
    await expect(rows(page)).toHaveText(original)
    await dataTransfer.dispose()
  })

  test("requires a local drag", async ({ page }) => {
    const original = await rows(page).allTextContents()
    const dataTransfer = await page.evaluateHandle((type) => {
      const transfer = new DataTransfer()
      transfer.setData(type, "not-a-local-drag")
      return transfer
    }, QUEUE_DRAG_TYPE)
    await rows(page).nth(2).dispatchEvent("drop", { dataTransfer })
    await expect(lastCommand(page)).toHaveText("")
    await expect(rows(page)).toHaveText(original)
    await dataTransfer.dispose()
  })

  test("ignores canceled drag payloads", async ({ page }) => {
    const original = await rows(page).allTextContents()
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await rows(page).nth(0).dispatchEvent("dragstart", { dataTransfer })
    await rows(page).nth(0).dispatchEvent("dragend", { dataTransfer })
    await rows(page).nth(2).dispatchEvent("drop", { dataTransfer })
    await expect(lastCommand(page)).toHaveText("")
    await expect(rows(page)).toHaveText(original)
    await dataTransfer.dispose()
  })

  test("rejects and clears mismatched drags", async ({ page }) => {
    const original = await rows(page).allTextContents()
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await rows(page).nth(0).dispatchEvent("dragstart", { dataTransfer })
    const otherTransfer = await page.evaluateHandle((type) => {
      const transfer = new DataTransfer()
      transfer.setData(type, "different-drag")
      return transfer
    }, QUEUE_DRAG_TYPE)
    await rows(page).nth(2).dispatchEvent("drop", {
      dataTransfer: otherTransfer,
    })
    await rows(page).nth(2).dispatchEvent("drop", { dataTransfer })
    await expect(lastCommand(page)).toHaveText("")
    await expect(rows(page)).toHaveText(original)
    await dataTransfer.dispose()
    await otherTransfer.dispose()
  })

  test("consumes a completed drag only once", async ({ page }) => {
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await rows(page).nth(0).dispatchEvent("dragstart", { dataTransfer })
    await rows(page).nth(2).dispatchEvent("drop", { dataTransfer })
    await expect(lastCommand(page)).toHaveText("--move 1 3")
    const afterMove = await rows(page).allTextContents()
    await rows(page).nth(4).dispatchEvent("drop", { dataTransfer })
    await expect(lastCommand(page)).toHaveText("--move 1 3")
    await expect(rows(page)).toHaveText(afterMove)
    await dataTransfer.dispose()
  })

  test("uses the latest host item positions", async ({ page }) => {
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await rows(page).nth(4).dispatchEvent("dragstart", { dataTransfer })
    await page.getByRole("button", { name: "Remove item 1" }).click()
    await expect(rows(page)).toHaveCount(4)
    await rows(page).nth(0).dispatchEvent("drop", { dataTransfer })
    await expect(lastCommand(page)).toHaveText("--move 4 1")
    await expect(rows(page).first()).toContainText("Rooftop Live Stream")
    await dataTransfer.dispose()
  })

  test("ignores a removed source item", async ({ page }) => {
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await rows(page).nth(0).dispatchEvent("dragstart", { dataTransfer })
    await page.getByRole("button", { name: "Remove item 1" }).click()
    await expect(rows(page)).toHaveCount(4)
    const afterRemove = await rows(page).allTextContents()
    await rows(page).nth(2).dispatchEvent("drop", { dataTransfer })
    await expect(lastCommand(page)).toHaveText("--remove 1")
    await expect(rows(page)).toHaveText(afterRemove)
    await dataTransfer.dispose()
  })

  test("discards drags when the window closes", async ({ page }) => {
    const original = await rows(page).allTextContents()
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await rows(page).nth(0).dispatchEvent("dragstart", { dataTransfer })
    await page.getByRole("button", { name: "Close", exact: true }).click()
    await page.getByRole("button", { name: "Open queue" }).click()
    await rows(page).nth(2).dispatchEvent("drop", { dataTransfer })
    await expect(lastCommand(page)).toHaveText("")
    await expect(rows(page)).toHaveText(original)
    await dataTransfer.dispose()
  })

  test("ignores descendant drag starts", async ({ page }) => {
    const original = await rows(page).allTextContents()
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    const title = rows(page).first().getByText("Sunset Drive 2025 – Live Set")
    await title.dispatchEvent("dragstart", { dataTransfer })
    await rows(page).nth(2).dispatchEvent("drop", { dataTransfer })
    await expect(lastCommand(page)).toHaveText("")
    await expect(rows(page)).toHaveText(original)
    await dataTransfer.dispose()
  })

  test("preserves native pointer drag reorder", async ({ page }) => {
    const original = await rows(page).allTextContents()
    await rows(page)
      .nth(0)
      .dragTo(rows(page).nth(2), {
        sourcePosition: { x: 60, y: 12 },
        targetPosition: { x: 60, y: 12 },
      })
    await expect(lastCommand(page)).toHaveText("--move 1 3")
    await expect(rows(page)).toHaveText([
      original[1],
      original[2],
      original[0],
      original[3],
      original[4],
    ])
  })
})
