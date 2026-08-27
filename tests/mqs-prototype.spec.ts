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
    await expect(
      page.getByTestId("current-row").locator("svg.lucide-grip-vertical")
    ).toHaveCount(0)
    await expect(page.getByTestId("upcoming-row")).toHaveCount(5)
    await expect(page.locator("img")).toHaveCount(0)

    await expect(page.getByTestId("connection-overlay")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible()
    await expect(
      page.getByRole("button", { name: /Expand queue|Restore queue/ })
    ).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "Queue actions" })
    ).toBeVisible()
    await expect(page.getByRole("button", { name: /Mute|Unmute/ })).toHaveCount(
      0
    )
  })

  test("blocks the queue with the host-style reconnecting overlay", async ({
    page,
  }) => {
    await page.goto("/?prototype=mqs&mqsConnection=reconnecting")

    const modal = page.getByTestId("mqs-modal")
    const overlay = page.getByTestId("connection-overlay")
    await expect(modal).toHaveAttribute("data-connection-state", "reconnecting")
    await expect(modal).toHaveAttribute("aria-busy", "true")
    await expect(overlay).toBeVisible()
    await expect(overlay).toHaveAttribute("role", "alert")
    await expect(overlay).toContainText("Connection lost")
    await expect(overlay).toContainText("Attempting to reconnect…")
    await expect(overlay.locator("svg.lucide-wifi-off")).toHaveCount(1)
    await expect(page.getByRole("button", { name: "Reconnect" })).toHaveCount(0)

    await expect(page.getByTestId("current-row")).toContainText(
      "Tomorrowland 2026 Mainstage W1"
    )
    await expect(overlay).toHaveCSS("backdrop-filter", "blur(2px)")

    const pause = page.getByRole("button", { name: "Pause" })
    const box = await pause.boundingBox()
    if (!box) throw new Error("Pause control has no bounding box")
    const topTargetIsOverlay = await page.evaluate(
      ({ x, y }) =>
        Boolean(
          document
            .elementFromPoint(x, y)
            ?.closest('[data-testid="connection-overlay"]')
        ),
      { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    )
    expect(topTargetIsOverlay).toBe(true)

    await page.keyboard.press("Tab")
    await expect(overlay).toBeFocused()
    await page.keyboard.press("Tab")
    await expect(overlay).toBeFocused()
  })

  test("closes the MQS popout instead of resizing it", async ({ page }) => {
    const modal = page.getByTestId("mqs-modal")
    const close = page.getByRole("button", { name: "Close" })

    await expect(modal).toBeVisible()
    await expect(
      page.getByRole("button", { name: /Expand queue|Restore queue/ })
    ).toHaveCount(0)

    await close.click()

    await expect(modal).toHaveCount(0)
    await expect(page.getByTestId("mqs-container")).toHaveCount(0)
  })

  test("uses the literal Hubzz MQS palette", async ({ page }) => {
    const container = page.getByTestId("mqs-container")
    const modal = page.getByTestId("mqs-modal")
    const mediaInput = page.getByRole("textbox", { name: "Media URL" })
    const contributor = page.getByTestId("current-row").locator("a").first()
    const lastPlayed = page.getByTestId("last-played-section")
    const queueActions = page.getByRole("button", { name: "Queue actions" })

    await expect(container).toHaveCSS("background-color", "rgb(13, 13, 15)")
    await expect(modal).toHaveCSS("background-color", "rgb(20, 20, 22)")
    await expect(mediaInput).toHaveCSS("background-color", "rgb(26, 29, 33)")
    await expect(mediaInput).toHaveCSS(
      "border-color",
      "rgba(255, 255, 255, 0.06)"
    )
    await expect(contributor).toHaveCSS("color", "rgb(115, 95, 250)")
    await expect(lastPlayed).toHaveCSS(
      "border-bottom-color",
      "rgba(255, 255, 255, 0.06)"
    )

    await queueActions.hover()
    await expect(queueActions).toHaveCSS("background-color", "rgb(45, 48, 57)")

    const status = await container.evaluate((element) => {
      const resolve = (name: string) => {
        const probe = document.createElement("span")
        probe.style.color = `var(${name})`
        element.appendChild(probe)
        const value = getComputedStyle(probe).color
        probe.remove()
        return value
      }
      return {
        success: resolve("--success"),
        warning: resolve("--warning"),
        destructive: resolve("--destructive"),
      }
    })

    expect(status).toEqual({
      success: "rgb(76, 195, 138)",
      warning: "rgb(229, 184, 73)",
      destructive: "rgb(255, 90, 90)",
    })
    await expect(page.locator('[class*="indigo"]')).toHaveCount(0)
  })

  test("keeps drag grips visually passive on hover", async ({ page }) => {
    const grip = page.getByTestId("upcoming-row").first().getByRole("button")
    const before = await grip.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
      }
    })

    await grip.hover()

    const after = await grip.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        backgroundColor: style.backgroundColor,
        color: style.color,
      }
    })

    expect(after).toEqual(before)
    await expect(page.getByTestId("upcoming-row").first()).toHaveAttribute(
      "draggable",
      "true"
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

  test("toggles the current item loop with a long press without pausing", async ({
    page,
  }) => {
    const pause = page.getByRole("button", { name: "Pause" })
    const box = await pause.boundingBox()
    if (!box) throw new Error("Pause control has no bounding box")

    const center = {
      x: box.x + box.width / 2,
      y: box.y + box.height / 2,
    }

    await page.mouse.move(center.x, center.y)
    await page.mouse.down()
    await expect(page.getByTestId("loop-hold-progress")).toBeVisible()
    await page.waitForTimeout(650)
    await page.mouse.up()

    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()
    await expect(page.getByTestId("current-loop-badge")).toBeVisible()
    await expect(page.getByTestId("loop-feedback")).toHaveText("Loop on")

    await page.mouse.down()
    await page.waitForTimeout(650)
    await page.mouse.up()

    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()
    await expect(page.getByTestId("current-loop-badge")).toHaveCount(0)
    await expect(page.getByTestId("loop-feedback")).toHaveText("Loop off")
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
    await expect(page.getByTestId("loop-hold-progress")).toBeVisible()
    await page.mouse.move(center.x + 18, center.y)
    await expect(page.getByTestId("loop-hold-progress")).toHaveCount(0)
    await page.waitForTimeout(650)
    await page.mouse.up()

    await expect(page.getByTestId("current-loop-badge")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()
  })

  test("cancels a stale loop hold when the current item changes", async ({
    page,
  }) => {
    const pause = page.getByRole("button", { name: "Pause" })
    const box = await pause.boundingBox()
    if (!box) throw new Error("Pause control has no bounding box")

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down()
    await expect(page.getByTestId("loop-hold-progress")).toBeVisible()

    await page
      .getByRole("button", { name: "Skip down" })
      .evaluate((element) => (element as HTMLButtonElement).click())
    await expect(page.getByTestId("current-row")).toContainText(
      "Afterlife Tulum 2025"
    )
    await expect(page.getByTestId("loop-hold-progress")).toHaveCount(0)

    await page.waitForTimeout(650)
    await page.mouse.up()

    await expect(page.getByTestId("current-loop-badge")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()
  })

  test("loops finite current media when playback reaches the end", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Pause" }).click()
    await page.getByRole("button", { name: "Queue actions" }).click()
    await page.getByRole("menuitem", { name: "Loop current item" }).click()

    await expect(page.getByTestId("current-loop-badge")).toBeVisible()

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

  test("scrubs finite media with pre-alpha seek semantics and keeps LIVE non-seekable", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Pause" }).click()

    const slider = page.getByRole("slider", { name: "Playback position" })
    const sliderBox = await slider.boundingBox()
    if (!sliderBox) throw new Error("Playback slider has no bounding box")

    const initial = Number(await slider.getAttribute("aria-valuenow"))
    await page.mouse.move(
      sliderBox.x + sliderBox.width * 0.25,
      sliderBox.y + sliderBox.height / 2
    )
    await page.mouse.down()
    await page.mouse.move(
      sliderBox.x + sliderBox.width * 0.75,
      sliderBox.y + sliderBox.height / 2
    )

    const preview = Number(await slider.getAttribute("aria-valuenow"))
    expect(preview).toBeGreaterThan(initial)
    expect(Math.abs(preview - Math.round(4542 * 0.75))).toBeLessThan(8)
    await page.mouse.up()

    const committed = Number(await slider.getAttribute("aria-valuenow"))
    expect(Math.abs(committed - preview)).toBeLessThanOrEqual(1)

    await slider.focus()
    await slider.press("Home")
    await expect(slider).toHaveAttribute("aria-valuenow", "0")
    await slider.press("ArrowRight")
    await expect(slider).toHaveAttribute("aria-valuenow", "5")
    await slider.press("End")
    await expect(slider).toHaveAttribute("aria-valuenow", "4542")
    await slider.press("ArrowLeft")
    await expect(slider).toHaveAttribute("aria-valuenow", "4537")

    const input = page.getByRole("textbox", { name: "Media URL" })
    await input.fill("https://twitch.tv/example-live")
    await input.press("Enter")

    const current = page.getByTestId("current-row")
    const liveRow = page.getByTestId("upcoming-row").last()
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await liveRow.dispatchEvent("dragstart", { dataTransfer })
    await current.dispatchEvent("dragover", { dataTransfer })
    await current.dispatchEvent("drop", { dataTransfer })

    await expect(current).toContainText("https://twitch.tv/example-live")
    await expect(
      page.getByRole("slider", { name: "Playback position" })
    ).toHaveCount(0)
    await expect(page.getByTestId("elapsed-time")).toHaveText("LIVE")
    await expect(page.getByTestId("total-time")).toHaveCount(0)
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

  test("validates and normalizes composer URLs without narrowing the MQS contract", async ({
    page,
  }) => {
    const input = page.getByRole("textbox", { name: "Media URL" })
    await expect(input).toHaveAttribute(
      "placeholder",
      "https://youtube.com/watch?v=dQw4w9WgXcQ…"
    )

    await input.press("Enter")
    let error = page.getByTestId("composer-error")
    await expect(error).toContainText(
      "Paste a media URL to add it to the queue."
    )
    await expect(error.locator("svg.lucide-triangle-alert")).toHaveCount(1)

    await input.fill("javascript:alert(1)")
    await input.press("Enter")
    error = page.getByTestId("composer-error")
    await expect(error).toContainText(
      "Invalid URL. Try YouTube, Twitch, Kick, or another http(s) URL."
    )
    await expect(page.getByTestId("upcoming-row")).toHaveCount(5)

    await input.fill("kick.com/example-live")
    await expect(page.getByTestId("composer-error")).toHaveCount(0)
    await input.press("Enter")
    await expect(page.getByTestId("upcoming-row")).toHaveCount(6)
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "https://kick.com/example-live"
    )
    await expect(page.getByTestId("upcoming-row").last()).toContainText("Kick")

    await input.fill("https://example.com/media")
    await input.press("Enter")
    await expect(page.getByTestId("upcoming-row")).toHaveCount(7)
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "https://example.com/media"
    )
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "Website"
    )

    await page.getByRole("button", { name: "Queue actions" }).click()
    await expect(
      page.getByRole("menuitem", { name: "Load setlist" })
    ).toBeVisible()
    await expect(
      page.getByRole("menuitem", { name: "Shuffle upcoming" })
    ).toBeVisible()
    await expect(
      page.getByRole("menuitem", { name: "Mute local audio" })
    ).toBeVisible()
    await expect(
      page.getByRole("menuitem", { name: "Set local volume…" })
    ).toBeVisible()
    await expect(
      page.getByRole("menuitem", { name: "Clear upcoming" })
    ).toBeVisible()
  })

  test("keeps local audio and secondary actions explicit in the ellipsis menu", async ({
    page,
  }) => {
    const modal = page.getByTestId("mqs-modal")
    const actions = page.getByRole("button", { name: "Queue actions" })

    await expect(modal).toHaveAttribute("data-local-muted", "false")
    await expect(modal).toHaveAttribute("data-local-volume", "100")

    await actions.click()
    await expect(
      page.getByRole("menuitem", { name: "Add pasted URL" })
    ).toHaveCount(0)
    await expect(
      page.getByRole("menuitem", { name: "Play pasted URL next" })
    ).toHaveCount(0)
    await expect(
      page.getByRole("menuitem", { name: "Load setlist" })
    ).toBeVisible()
    await page.getByRole("menuitem", { name: "Mute local audio" }).click()
    await expect(modal).toHaveAttribute("data-local-muted", "true")

    await actions.click()
    await expect(
      page.getByRole("menuitem", { name: "Unmute local audio" })
    ).toBeVisible()
    await page.getByRole("menuitem", { name: "Set local volume…" }).click()

    const volumeDialog = page.getByRole("dialog", {
      name: "Local audio volume",
    })
    await expect(volumeDialog).toContainText("this device only")
    await expect(volumeDialog).toContainText("does not affect room volume")
    const slider = page.getByRole("slider", { name: "Local audio volume" })
    await expect(slider).toHaveValue("100")
    await slider.fill("35")
    await expect(page.getByTestId("local-volume-value")).toHaveText("35%")
    await page.getByRole("button", { name: "Apply volume" }).click()
    await expect(modal).toHaveAttribute("data-local-volume", "35")

    const input = page.getByRole("textbox", { name: "Media URL" })
    await input.fill("https://example.com/next")
    await input.press("Escape")
    await actions.click()
    await expect(
      page.getByRole("menuitem", { name: "Play pasted URL next" })
    ).toBeVisible()
    await expect(
      page.getByRole("menuitem", { name: "Add pasted URL" })
    ).toHaveCount(0)
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

  test("swaps dragged media into the non-draggable Now Playing target", async ({
    page,
  }) => {
    const current = page.getByTestId("current-row")
    const upcoming = page.getByTestId("upcoming-row").first()

    await expect(current).toContainText("Tomorrowland 2026 Mainstage W1")
    await expect(current).not.toHaveAttribute("draggable", "true")

    const upcomingTransfer = await page.evaluateHandle(() => new DataTransfer())
    await upcoming.dispatchEvent("dragstart", {
      dataTransfer: upcomingTransfer,
    })
    await expect(page.getByTestId("remove-drop-target")).toBeVisible()

    await current.dispatchEvent("dragover", { dataTransfer: upcomingTransfer })

    await expect(current).toHaveAttribute("data-swap-target", "true")
    await expect(page.getByTestId("current-swap-overlay")).toContainText(
      "Swap with"
    )
    await expect(page.getByTestId("current-swap-overlay")).toContainText(
      "Afterlife Tulum 2025"
    )
    await expect(page.getByTestId("queue-drop-indicator")).toHaveCount(0)

    await current.dispatchEvent("drop", { dataTransfer: upcomingTransfer })

    await expect(current).toContainText("Afterlife Tulum 2025")
    await expect(page.getByTestId("upcoming-row").first()).toContainText(
      "Tomorrowland 2026 Mainstage W1"
    )
    await expect(page.getByTestId("current-swap-overlay")).toHaveCount(0)
    await expect(page.getByRole("textbox", { name: "Media URL" })).toBeVisible()

    const history = page.getByTestId("history-row").first()
    const historyTransfer = await page.evaluateHandle(() => new DataTransfer())
    await history.dispatchEvent("dragstart", { dataTransfer: historyTransfer })
    await current.dispatchEvent("dragover", { dataTransfer: historyTransfer })

    await expect(current).toHaveAttribute("data-swap-target", "true")
    await expect(page.getByTestId("current-swap-overlay")).toContainText(
      "Sunset Drive 2025"
    )

    await current.dispatchEvent("drop", { dataTransfer: historyTransfer })

    await expect(current).toContainText("Sunset Drive 2025")
    await expect(page.getByTestId("history-row").first()).toContainText(
      "Afterlife Tulum 2025"
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
    await page.getByRole("button", { name: "Load setlist" }).click()

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

  test("uses coarse server-authoritative setlist preview and auto-starts replace imports", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Queue actions" }).click()
    await page.getByRole("menuitem", { name: "Load setlist" }).click()

    await expect(
      page.getByRole("heading", { name: "Load prepared setlist" })
    ).toBeVisible()
    await expect(page.getByTestId("setlist-dropzone")).toContainText(
      "Drop a .json setlist here"
    )
    await expect(
      page.getByRole("button", { name: "Browse file" })
    ).toBeVisible()
    await expect(page.getByText("Append to queue")).toHaveCount(0)

    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{not-json"),
    })
    await expect(page.getByRole("alert")).toContainText(
      "That file is not valid setlist JSON."
    )

    const file = {
      version: "1.0",
      name: "Friday",
      exportedAt: "2026-08-27T00:00:00.000Z",
      segments: [
        {
          title: "Opening",
          type: "youtube",
          url: "https://youtu.be/example",
          platform: "YouTube",
          duration: 5,
        },
        {
          title: "Unsafe but still visible to coarse inspection",
          type: "website",
          url: "javascript:alert(1)",
          duration: 2,
        },
        {
          title: "Second",
          type: "twitch",
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

    const preview = page.getByTestId("setlist-preview")
    await expect(preview).toContainText("friday.json")
    await expect(preview).toContainText("3 segments · 17m")
    await expect(
      page.getByText(/valid segments|invalid or capped/)
    ).toHaveCount(0)
    await expect(
      page.getByText(/replace the live queue and start from its first segment/i)
    ).toBeVisible()
    await expect(page.getByText("Append to queue")).toHaveCount(0)

    await page.getByRole("button", { name: "Load setlist" }).click()

    await expect(page.getByTestId("current-row")).toContainText("Opening")
    await expect(page.getByTestId("upcoming-row")).toHaveCount(1)
    await expect(page.getByTestId("upcoming-row").first()).toContainText(
      "Second"
    )
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()
    await expect(page.getByTestId("history-row")).toHaveCount(0)
  })

  test("shows the server 500-segment cap without pretending to validate rows", async ({
    page,
  }) => {
    const file = {
      version: "1.0",
      name: "Oversized",
      exportedAt: "2026-08-27T00:00:00.000Z",
      segments: Array.from({ length: 501 }, (_, index) => ({
        title: `Segment ${index + 1}`,
        type: "website",
        url: `https://example.com/${index + 1}`,
        duration: 1,
      })),
    }

    await page.getByRole("button", { name: "Queue actions" }).click()
    await page.getByRole("menuitem", { name: "Load setlist" }).click()
    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "oversized.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(file)),
    })

    const preview = page.getByTestId("setlist-preview")
    await expect(preview).toContainText("501 segments · 8h 21m")
    await expect(preview).toContainText(
      "The live import is capped at the first 500 segments."
    )
    await expect(
      page.getByText(/valid segments|invalid or capped/)
    ).toHaveCount(0)
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
    const empty = page.getByTestId("empty-current-state")
    await expect(empty).toBeVisible()
    await expect(empty).toContainText("Nothing playing")
    await expect(empty).toContainText(
      "Paste a link below or load a setlist to start."
    )
    await expect(empty.locator("svg.lucide-headphones")).toHaveCount(1)
  })
})
