import { expect, test } from "@playwright/test"

test.describe("MQS final-layout prototype", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?prototype=mqs")
  })

  test("matches the final three-section layout without thumbnails or extra footer chrome", async ({
    page,
  }) => {
    await expect(page.getByText("Rooftop", { exact: true })).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Last Played" })
    ).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Now Playing" })
    ).toBeVisible()
    await expect(page.getByRole("heading", { name: "Up Next" })).toBeVisible()

    await expect(page.getByTestId("history-row")).toHaveCount(3)
    await expect(page.getByTestId("current-row")).toHaveCount(1)
    await expect(page.getByTestId("upcoming-row")).toHaveCount(5)
    await expect(page.locator("img")).toHaveCount(0)

    await expect(
      page.getByRole("button", { name: "Expand queue" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Queue actions" })
    ).toBeVisible()
    await expect(page.getByRole("button", { name: /Mute|Unmute/ })).toHaveCount(
      0
    )
  })

  test("keeps play and pause between the vertical skip controls", async ({
    page,
  }) => {
    await expect(page.getByRole("button", { name: "Previous" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Next" })).toHaveCount(0)

    const pause = page.getByRole("button", { name: "Pause" })
    await expect(pause).toBeVisible()
    await pause.click()
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible()

    await expect(page.getByRole("button", { name: "Skip up" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Skip down" })).toBeVisible()
  })

  test("moves through the vertical queue without changing the layout model", async ({
    page,
  }) => {
    const current = page.getByTestId("current-row")
    await expect(current).toContainText("Tomorrowland 2026 Mainstage W1")

    await page.getByRole("button", { name: "Skip down" }).click()
    await expect(current).toContainText("Afterlife Tulum 2025")

    await page.getByRole("button", { name: "Skip up" }).click()
    await expect(current).toContainText("Tomorrowland 2026 Mainstage W1")
  })

  test("supports keyboard reordering from the visible drag handle", async ({
    page,
  }) => {
    const rows = page.getByTestId("upcoming-row")
    await expect(rows.nth(0)).toContainText("Afterlife Tulum 2025")
    await expect(rows.nth(1)).toContainText("Calvin Harris")

    const handle = rows
      .nth(1)
      .getByRole("button", { name: /Reorder Calvin Harris/ })
    await handle.focus()
    await handle.press("Alt+ArrowUp")

    await expect(rows.nth(0)).toContainText("Calvin Harris")
    await expect(rows.nth(1)).toContainText("Afterlife Tulum 2025")
  })

  test("adds a safe URL with Enter and keeps actions inside the single menu", async ({
    page,
  }) => {
    const input = page.getByRole("textbox", { name: "Media URL" })

    await input.fill("javascript:alert(1)")
    await input.press("Enter")
    await expect(page.getByText("Use a valid http(s) media URL.")).toBeVisible()
    await expect(page.getByTestId("upcoming-row")).toHaveCount(5)

    await input.fill("https://example.com/media")
    await input.press("Enter")
    await expect(page.getByTestId("upcoming-row")).toHaveCount(6)
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "https://example.com/media"
    )

    await page.getByRole("button", { name: "Queue actions" }).click()
    await expect(
      page.getByRole("menuitem", { name: "Upload setlist" })
    ).toBeVisible()
    await expect(
      page.getByRole("menuitem", { name: "Shuffle upcoming" })
    ).toBeVisible()
    await expect(
      page.getByRole("menuitem", { name: "Clear upcoming" })
    ).toBeVisible()
  })

  test("previews the exact queue insertion point while dragging", async ({
    page,
  }) => {
    const rows = page.getByTestId("upcoming-row")
    const sourceRow = rows.nth(0)
    const targetRow = rows.nth(2)
    const targetBox = await targetRow.boundingBox()
    if (!targetBox) throw new Error("Target queue row has no bounding box")

    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await sourceRow.dispatchEvent("dragstart", { dataTransfer })
    await targetRow.dispatchEvent("dragover", {
      dataTransfer,
      clientX: targetBox.x + targetBox.width / 2,
      clientY: targetBox.y + targetBox.height - 2,
    })

    const indicator = targetRow.getByTestId("queue-drop-indicator")
    await expect(indicator).toBeVisible()
    await expect(indicator).toHaveAttribute("data-position", "after")

    await targetRow.dispatchEvent("drop", {
      dataTransfer,
      clientX: targetBox.x + targetBox.width / 2,
      clientY: targetBox.y + targetBox.height - 2,
    })

    await expect(rows.nth(0)).toContainText("Calvin Harris")
    await expect(rows.nth(1)).toContainText("Anjunadeep Open Air 2025")
    await expect(rows.nth(2)).toContainText("Afterlife Tulum 2025")
    await expect(page.getByTestId("queue-drop-indicator")).toHaveCount(0)
  })

  test("turns the media input into a full-width drag-to-remove target", async ({
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
    await expect(
      page.getByRole("button", { name: "Queue actions" })
    ).toHaveCount(0)
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

    await expect(
      page.getByRole("button", { name: "Queue actions" })
    ).toBeVisible()
    await input.focus()
    await expect(
      page.getByRole("button", { name: "Queue actions" })
    ).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "Add media to queue" })
    ).toBeVisible()

    await input.fill("https://example.com/focused-send")
    await page.getByRole("button", { name: "Add media to queue" }).click()
    await expect(page.getByTestId("upcoming-row")).toHaveCount(6)
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "https://example.com/focused-send"
    )
    await expect(
      page.getByRole("button", { name: "Queue actions" })
    ).toBeVisible()
  })

  test("previews a setlist and replaces the queue in paused state", async ({
    page,
  }) => {
    const file = {
      version: "1.0",
      name: "Friday",
      segments: [
        {
          title: "Opening",
          url: "https://youtu.be/example",
          platform: "YouTube",
          duration: 5,
        },
        {
          title: "Bad segment",
          url: "javascript:alert(1)",
          duration: 2,
        },
        {
          title: "Second",
          url: "https://twitch.tv/example",
          platform: "Twitch",
          duration: 10,
        },
      ],
    }

    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "friday.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(file)),
    })

    await expect(
      page.getByRole("heading", { name: "Load setlist" })
    ).toBeVisible()
    await expect(
      page.getByText("2 valid segments · 1 invalid or capped")
    ).toBeVisible()
    await page.getByRole("button", { name: "Replace queue" }).click()

    await expect(page.getByTestId("current-row")).toContainText("Opening")
    await expect(page.getByTestId("upcoming-row")).toHaveCount(1)
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible()
    await expect(page.getByTestId("history-row")).toHaveCount(0)
  })

  test("keeps destructive stop behind confirmation", async ({ page }) => {
    await page.getByRole("button", { name: "Queue actions" }).click()
    await page.getByRole("menuitem", { name: "Stop & clear all" }).click()

    await expect(
      page.getByRole("heading", { name: "Stop and clear MQS?" })
    ).toBeVisible()
    await page.getByRole("button", { name: "Stop & clear all" }).click()

    await expect(page.getByTestId("current-row")).toHaveCount(0)
    await expect(page.getByTestId("upcoming-row")).toHaveCount(0)
    await expect(page.getByTestId("history-row")).toHaveCount(0)
    await expect(page.getByText("Nothing is playing.")).toBeVisible()
  })
})
