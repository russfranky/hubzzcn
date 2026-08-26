import { expect, test } from "@playwright/test"

test.describe("MQS shadcn port-ready prototype", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?prototype=mqs")
  })

  test("opens on Now Playing with the last three picks above the initial viewport", async ({
    page,
  }) => {
    const viewport = page.getByTestId("queue-scroll-area")
    const current = page.getByTestId("current-row")
    const history = page.getByTestId("history-row")

    await expect(current).toBeInViewport()
    await expect(history).toHaveCount(3)
    await expect(history.last()).not.toBeInViewport()
    await expect.poll(() => viewport.evaluate((node) => node.scrollTop)).toBeGreaterThan(0)

    await viewport.evaluate((node) => {
      node.scrollTop = 0
    })

    await expect(history.last()).toBeInViewport()
  })

  test("uses no thumbnails, tabs, volume button, or per-row overflow menus", async ({
    page,
  }) => {
    await expect(page.locator("img")).toHaveCount(0)
    await expect(page.getByRole("tab")).toHaveCount(0)
    await expect(page.getByRole("button", { name: /mute|volume/i })).toHaveCount(0)

    const rows = page.getByTestId("upcoming-row")
    await expect(rows).toHaveCount(5)
    await expect(page.getByRole("button", { name: "Queue actions" })).toHaveCount(1)
  })

  test("keeps play/pause on the playhead and skip controls vertical on the card edge", async ({
    page,
  }) => {
    const pause = page.getByRole("button", { name: "Pause" })
    await expect(pause).toBeVisible()
    await expect(page.getByRole("button", { name: "Skip up" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Skip down" })).toBeVisible()

    await pause.click()
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible()
  })

  test("supports seeking without adding a second visible playback control", async ({ page }) => {
    const slider = page.getByRole("slider", { name: "Playback position" })
    await expect(slider).toBeVisible()
    await slider.focus()
    const before = await slider.getAttribute("aria-valuenow")
    await slider.press("ArrowRight")
    const after = await slider.getAttribute("aria-valuenow")
    expect(Number(after)).toBeGreaterThan(Number(before))
  })

  test("keeps reorder affordances hidden until hover or focus and supports keyboard movement", async ({
    page,
  }) => {
    const rows = page.getByTestId("upcoming-row")
    await expect(rows.nth(0)).toContainText("Afterlife Tulum 2025")
    await expect(rows.nth(1)).toContainText("Calvin Harris")

    const handle = rows.nth(1).getByRole("button", { name: /Reorder Calvin Harris/ })
    await expect(handle).toHaveCSS("opacity", "0")
    await rows.nth(1).hover()
    await expect(handle).toHaveCSS("opacity", "1")
    await handle.focus()
    await handle.press("Alt+ArrowUp")

    await expect(rows.nth(0)).toContainText("Calvin Harris")
    await expect(rows.nth(1)).toContainText("Afterlife Tulum 2025")
  })

  test("can requeue a last-played item from its hover handle", async ({ page }) => {
    const viewport = page.getByTestId("queue-scroll-area")
    await viewport.evaluate((node) => {
      node.scrollTop = 0
    })

    const history = page.getByTestId("history-row")
    const first = history.first()
    await first.hover()
    await first.getByRole("button", { name: /Add Sunset Drive 2025/ }).click()

    await expect(page.getByTestId("upcoming-row")).toHaveCount(6)
    await expect(page.getByTestId("upcoming-row").last()).toContainText("Sunset Drive 2025")
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

  test("previews a setlist and replaces the queue in paused state", async ({ page }) => {
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

    await expect(page.getByRole("heading", { name: "Stop and clear MQS?" })).toBeVisible()
    await page.getByRole("button", { name: "Stop & clear all" }).click()

    await expect(page.getByTestId("current-row")).toHaveCount(0)
    await expect(page.getByTestId("upcoming-row")).toHaveCount(0)
    await expect(page.getByTestId("history-row")).toHaveCount(0)
    await expect(page.getByText("Nothing is playing.", { exact: false })).toBeVisible()
  })
})
