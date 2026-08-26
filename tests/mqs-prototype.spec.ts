import { expect, test } from "@playwright/test"

test.describe("MQS scroll queue prototype", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?prototype=mqs")
  })

  test("opens anchored on current playback with the last three picks above the viewport", async ({
    page,
  }) => {
    const viewport = page.getByTestId("queue-scroll-area")
    const current = page.getByTestId("current-row")
    const history = page.getByTestId("history-row")

    await expect(current).toBeInViewport()
    await expect(history).toHaveCount(3)
    await expect(history.last()).not.toBeInViewport()
    await expect
      .poll(() => viewport.evaluate((node) => node.scrollTop))
      .toBeGreaterThan(0)

    await viewport.evaluate((node) => {
      node.scrollTop = 0
    })

    await expect(history.last()).toBeInViewport()
  })

  test("uses one continuous queue with no history tab or per-row overflow menus", async ({
    page,
  }) => {
    await expect(page.getByRole("tab")).toHaveCount(0)
    await expect(page.getByText("History", { exact: true })).toHaveCount(0)

    const rows = page.getByTestId("upcoming-row")
    await expect(rows).toHaveCount(5)

    for (let index = 0; index < 5; index += 1) {
      await expect(rows.nth(index).getByRole("button")).toHaveCount(1)
      await expect(
        rows.nth(index).getByRole("button", { name: /Reorder/ })
      ).toBeVisible()
    }
  })

  test("keeps play and pause on the progress playhead and has no previous/next buttons", async ({
    page,
  }) => {
    await expect(page.getByRole("button", { name: "Previous" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Next" })).toHaveCount(0)

    const pause = page.getByRole("button", { name: "Pause" })
    await expect(pause).toBeVisible()
    await pause.click()
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible()
  })

  test("supports keyboard reordering without adding another visible action", async ({
    page,
  }) => {
    const rows = page.getByTestId("upcoming-row")
    await expect(rows.nth(0)).toContainText("The Pretender")
    await expect(rows.nth(1)).toContainText("Sabotage")

    const handle = rows.nth(1).getByRole("button", { name: /Reorder Sabotage/ })
    await handle.focus()
    await handle.press("Alt+ArrowUp")

    await expect(rows.nth(0)).toContainText("Sabotage")
    await expect(rows.nth(1)).toContainText("The Pretender")
  })

  test("adds safe URLs and rejects unsafe schemes", async ({ page }) => {
    const input = page.getByRole("textbox", { name: "Media URL" })
    const add = page.getByRole("button", { name: "Add to queue" })

    await input.fill("javascript:alert(1)")
    await add.click()
    await expect(page.getByText("Use a valid http(s) media URL.")).toBeVisible()
    await expect(page.getByTestId("upcoming-row")).toHaveCount(5)

    await input.fill("https://example.com/media")
    await add.click()
    await expect(page.getByTestId("upcoming-row")).toHaveCount(6)
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "https://example.com/media"
    )
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

    await expect(page.getByRole("heading", { name: "Load setlist" })).toBeVisible()
    await expect(page.getByText("2 valid segments · 1 invalid or capped")).toBeVisible()
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
    await expect(page.getByText("Nothing is playing.", { exact: false })).toBeVisible()
  })
})
