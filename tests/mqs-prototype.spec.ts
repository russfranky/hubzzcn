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

  test("places elapsed and total time under the playback bar", async ({
    page,
  }) => {
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

  test("disables skip up when there is no Last Played history", async ({
    page,
  }) => {
    const skipUp = page.getByRole("button", { name: "Skip up" })
    await expect(skipUp).toBeEnabled()

    for (let index = 0; index < 3; index += 1) {
      const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
      await page.getByTestId("history-row").first().dispatchEvent("dragstart", {
        dataTransfer,
      })
      await page.getByTestId("remove-drop-target").dispatchEvent("drop", {
        dataTransfer,
      })
    }

    await expect(page.getByTestId("history-row")).toHaveCount(0)
    await expect(skipUp).toBeDisabled()

    await page.getByRole("button", { name: "Skip down" }).click()
    await expect(skipUp).toBeEnabled()
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

  test("supports slash-to-focus and Escape without losing the media draft", async ({
    page,
  }) => {
    const input = page.getByRole("textbox", { name: "Media URL" })

    await page.keyboard.press("/")
    await expect(input).toBeFocused()
    await expect(
      page.getByRole("button", { name: "Add media to queue" })
    ).toBeVisible()

    await input.fill("https://example.com/draft")
    await input.press("Escape")

    await expect(input).not.toBeFocused()
    await expect(input).toHaveValue("https://example.com/draft")
    await expect(
      page.getByRole("button", { name: "Queue actions" })
    ).toBeVisible()
  })

  test("restores the media input immediately after requeueing history", async ({
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

  test("accepts history drops into an empty Up Next area", async ({ page }) => {
    await page.getByRole("button", { name: "Queue actions" }).click()
    await page.getByRole("menuitem", { name: "Clear upcoming" }).click()
    await expect(page.getByTestId("upcoming-row")).toHaveCount(0)

    const history = page.getByTestId("history-row").first()
    const upNext = page.getByTestId("up-next-scroll")
    const upNextBox = await upNext.boundingBox()
    if (!upNextBox) throw new Error("Up Next has no bounding box")
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())

    await history.dispatchEvent("dragstart", { dataTransfer })
    await upNext.dispatchEvent("dragover", {
      dataTransfer,
      clientX: upNextBox.x + upNextBox.width / 2,
      clientY: upNextBox.y + upNextBox.height / 2,
    })
    await expect(page.getByTestId("queue-tail-drop-indicator")).toBeVisible()

    await upNext.dispatchEvent("drop", {
      dataTransfer,
      clientX: upNextBox.x + upNextBox.width / 2,
      clientY: upNextBox.y + upNextBox.height / 2,
    })

    await expect(page.getByTestId("upcoming-row")).toHaveCount(1)
    await expect(page.getByTestId("upcoming-row").first()).toContainText(
      "Sunset Drive 2025"
    )
  })

  test("keeps composer geometry fixed while dragging and centers the removal poof", async ({
    page,
  }) => {
    const rows = page.getByTestId("upcoming-row")
    const firstRow = rows.first()
    const mediaInput = page.getByRole("textbox", { name: "Media URL" })
    const queueActions = page.getByRole("button", { name: "Queue actions" })
    const composer = page.getByTestId("queue-composer")
    const inputBox = await mediaInput.boundingBox()
    const actionsBox = await queueActions.boundingBox()
    const composerBox = await composer.boundingBox()
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())

    expect(inputBox).not.toBeNull()
    expect(actionsBox).not.toBeNull()
    expect(composerBox).not.toBeNull()
    await expect(rows).toHaveCount(5)
    await firstRow.dispatchEvent("dragstart", { dataTransfer })

    const removeTarget = page.getByTestId("remove-drop-target")
    await expect(mediaInput).toHaveCount(0)
    await expect(queueActions).toBeVisible()
    await expect(removeTarget).toContainText("Drop to remove")

    const removeBox = await removeTarget.boundingBox()
    const dragActionsBox = await queueActions.boundingBox()
    const dragComposerBox = await composer.boundingBox()
    expect(removeBox).not.toBeNull()
    expect(dragActionsBox).not.toBeNull()
    expect(dragComposerBox).not.toBeNull()
    expect(
      Math.abs((removeBox?.width ?? 0) - (inputBox?.width ?? 0))
    ).toBeLessThan(1)
    expect(
      Math.abs((removeBox?.height ?? 0) - (inputBox?.height ?? 0))
    ).toBeLessThan(1)
    expect(
      Math.abs((dragActionsBox?.x ?? 0) - (actionsBox?.x ?? 0))
    ).toBeLessThan(1)
    expect(
      Math.abs((dragActionsBox?.y ?? 0) - (actionsBox?.y ?? 0))
    ).toBeLessThan(1)
    expect(
      Math.abs((dragComposerBox?.width ?? 0) - (composerBox?.width ?? 0))
    ).toBeLessThan(1)
    expect(
      Math.abs((dragComposerBox?.height ?? 0) - (composerBox?.height ?? 0))
    ).toBeLessThan(1)

    await removeTarget.dispatchEvent("dragenter", { dataTransfer })
    await expect(removeTarget).toContainText("Drop here to remove")
    const activeBox = await removeTarget.boundingBox()
    await removeTarget.dispatchEvent("drop", { dataTransfer })

    await expect(rows).toHaveCount(4)
    await expect(page.getByText("Afterlife Tulum 2025")).toHaveCount(0)
    await expect(mediaInput).toBeVisible()
    const poofOrigin = page.locator('[data-mqs-poof-origin="true"]')
    await expect(poofOrigin).toHaveCount(1)
    const poofPosition = await poofOrigin.evaluate((element) => ({
      left: Number.parseFloat((element as HTMLElement).style.left),
      top: Number.parseFloat((element as HTMLElement).style.top),
    }))
    expect(
      Math.abs(
        poofPosition.left - ((activeBox?.x ?? 0) + (activeBox?.width ?? 0) / 2)
      )
    ).toBeLessThan(1)
    expect(
      Math.abs(
        poofPosition.top - ((activeBox?.y ?? 0) + (activeBox?.height ?? 0) / 2)
      )
    ).toBeLessThan(1)
  })

  test("swaps queue actions for a send button while the media input is active", async ({
    page,
  }) => {
    const input = page.getByRole("textbox", { name: "Media URL" })
    const queueActions = page.getByRole("button", { name: "Queue actions" })
    const composer = page.getByTestId("queue-composer")

    await expect(queueActions).toBeVisible()
    const dropdownBox = await queueActions.boundingBox()
    const composerBox = await composer.boundingBox()
    expect(dropdownBox).not.toBeNull()
    expect(composerBox).not.toBeNull()
    await input.focus()
    await expect(
      page.getByRole("button", { name: "Queue actions" })
    ).toHaveCount(0)
    const sendButton = page.getByRole("button", { name: "Add media to queue" })
    await expect(sendButton).toBeVisible()
    const sendBox = await sendButton.boundingBox()
    const focusedComposerBox = await composer.boundingBox()
    expect(sendBox).not.toBeNull()
    expect(focusedComposerBox).not.toBeNull()
    expect(Math.abs((sendBox?.x ?? 0) - (dropdownBox?.x ?? 0))).toBeLessThan(1)
    expect(Math.abs((sendBox?.y ?? 0) - (dropdownBox?.y ?? 0))).toBeLessThan(1)
    expect(
      Math.abs((sendBox?.width ?? 0) - (dropdownBox?.width ?? 0))
    ).toBeLessThan(1)
    expect(
      Math.abs((sendBox?.height ?? 0) - (dropdownBox?.height ?? 0))
    ).toBeLessThan(1)
    expect(
      Math.abs((focusedComposerBox?.width ?? 0) - (composerBox?.width ?? 0))
    ).toBeLessThan(1)
    expect(
      Math.abs((focusedComposerBox?.height ?? 0) - (composerBox?.height ?? 0))
    ).toBeLessThan(1)

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

  test("removes the Last Played section entirely when history is empty", async ({
    page,
  }) => {
    for (let index = 0; index < 3; index += 1) {
      const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
      await page.getByTestId("history-row").first().dispatchEvent("dragstart", {
        dataTransfer,
      })
      await page.getByTestId("remove-drop-target").dispatchEvent("drop", {
        dataTransfer,
      })
    }

    await expect(page.getByTestId("history-row")).toHaveCount(0)
    await expect(page.getByTestId("last-played-section")).toHaveCount(0)
    await expect(
      page.getByRole("heading", { name: "Last Played" })
    ).toHaveCount(0)
  })

  test("fills its host height and keeps long queues scrolling inside Up Next", async ({
    page,
  }) => {
    const file = {
      version: "1.0",
      name: "Long queue",
      segments: Array.from({ length: 32 }, (_, index) => ({
        title: `Queue item ${index + 1}`,
        url: `https://example.com/media-${index + 1}`,
        platform: "Web",
        duration: 5,
      })),
    }

    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "long-queue.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(file)),
    })
    await page.getByRole("button", { name: "Replace queue" }).click()

    const metrics = await page.evaluate(() => {
      const container = document.querySelector(
        '[data-testid="mqs-container"]'
      ) as HTMLElement
      const modal = document.querySelector(
        '[data-testid="mqs-modal"]'
      ) as HTMLElement
      const upNext = document.querySelector(
        '[data-testid="up-next-scroll"]'
      ) as HTMLElement
      const containerStyle = getComputedStyle(container)
      const modalStyle = getComputedStyle(modal)
      const upNextStyle = getComputedStyle(upNext)
      const containerRect = container.getBoundingClientRect()
      const modalRect = modal.getBoundingClientRect()
      return {
        availableHeight:
          containerRect.height -
          Number.parseFloat(containerStyle.paddingTop) -
          Number.parseFloat(containerStyle.paddingBottom),
        modalHeight: modalRect.height,
        modalOverflowY: modalStyle.overflowY,
        upNextClientHeight: upNext.clientHeight,
        upNextScrollHeight: upNext.scrollHeight,
        upNextOverflowY: upNextStyle.overflowY,
      }
    })

    expect(
      Math.abs(metrics.modalHeight - metrics.availableHeight)
    ).toBeLessThan(1)
    expect(metrics.modalOverflowY).toBe("hidden")
    expect(metrics.upNextOverflowY).toBe("auto")
    expect(metrics.upNextScrollHeight).toBeGreaterThan(
      metrics.upNextClientHeight
    )
    await expect(page.getByTestId("upcoming-row")).toHaveCount(31)

    const upNext = page.getByTestId("up-next-scroll")
    const firstRow = page.getByTestId("upcoming-row").first()
    const upNextBox = await upNext.boundingBox()
    if (!upNextBox) throw new Error("Up Next has no bounding box")
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await firstRow.dispatchEvent("dragstart", { dataTransfer })

    const beforeScroll = await upNext.evaluate((element) => element.scrollTop)
    for (let index = 0; index < 8; index += 1) {
      await upNext.dispatchEvent("dragover", {
        dataTransfer,
        clientX: upNextBox.x + upNextBox.width / 2,
        clientY: upNextBox.y + upNextBox.height - 2,
      })
    }
    const afterScroll = await upNext.evaluate((element) => element.scrollTop)
    expect(afterScroll).toBeGreaterThan(beforeScroll)
    await firstRow.dispatchEvent("dragend", { dataTransfer })

    const input = page.getByRole("textbox", { name: "Media URL" })
    await input.fill("https://example.com/reveal-me")
    await input.press("Enter")
    await expect(page.getByTestId("upcoming-row")).toHaveCount(32)
    const added = page.getByTestId("upcoming-row").last()
    await expect(added).toContainText("https://example.com/reveal-me")
    await expect(added).toBeInViewport()
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
