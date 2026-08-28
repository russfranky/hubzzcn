import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const lastCommand = (page: import("@playwright/test").Page) =>
  page.getByTestId("last-mqs-command")

test.describe("MQS pre-alpha port contract", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?prototype=mqs")
  })

  test("renders the server-snapshot view without a duplicate add-link composer", async ({
    page,
  }) => {
    await expect(
      page.getByRole("region", { name: "Rooftop media queue" })
    ).toBeVisible()
    await expect(page.getByText("Tomorrowland 2026 Mainstage W1")).toBeVisible()
    await expect(page.getByText(/total/)).toContainText("+")

    await expect(page.getByLabel("Add link")).toHaveCount(0)
    await expect(page.getByLabel("Add to queue")).toHaveCount(0)
    await expect(page.getByRole("textbox", { name: /media url/i })).toHaveCount(
      0
    )
    await expect(page.getByText(/loop/i)).toHaveCount(0)
  })

  test("emits the current pre-alpha transport command strings", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Previous" }).click()
    await expect(lastCommand(page)).toHaveText("--prev")

    await page.getByRole("button", { name: "Skip" }).click()
    await expect(lastCommand(page)).toHaveText("--skip")
  })

  test("maps play state to --pause and --resume", async ({ page }) => {
    await page.getByRole("button", { name: "Pause" }).click()
    await expect(lastCommand(page)).toHaveText("--pause")
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible()

    await page.getByRole("button", { name: "Play" }).click()
    await expect(lastCommand(page)).toHaveText("--resume")
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()
  })

  test("maps local-audio intent to --mute and --unmute", async ({ page }) => {
    await page.getByRole("button", { name: "Mute" }).click()
    await expect(lastCommand(page)).toHaveText("--mute")
    await expect(page.getByRole("button", { name: "Unmute" })).toBeVisible()

    await page.getByRole("button", { name: "Unmute" }).click()
    await expect(lastCommand(page)).toHaveText("--unmute")
  })

  test("uses 1-based positions for remove", async ({ page }) => {
    const rows = page.locator('[draggable="true"]')
    await expect(rows).toHaveCount(5)

    await page.getByRole("button", { name: "Remove item 3" }).click()
    await expect(lastCommand(page)).toHaveText("--remove 3")
    await expect(rows).toHaveCount(4)
  })

  test("uses 1-based positions for native drag reorder", async ({ page }) => {
    const rows = page.locator('[draggable="true"]')
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())

    await rows.nth(0).dispatchEvent("dragstart", { dataTransfer })
    await rows.nth(2).dispatchEvent("dragover", { dataTransfer })
    await rows.nth(2).dispatchEvent("drop", { dataTransfer })

    await expect(lastCommand(page)).toHaveText("--move 1 3")
  })

  test("does not emit a move when an item is dropped on itself", async ({
    page,
  }) => {
    const rows = page.locator('[draggable="true"]')
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())

    await rows.nth(1).dispatchEvent("dragstart", { dataTransfer })
    await rows.nth(1).dispatchEvent("drop", { dataTransfer })

    await expect(lastCommand(page)).toHaveText("")
  })

  test("emits pre-alpha seek seconds from the playback control", async ({
    page,
  }) => {
    const slider = page.getByRole("slider", { name: "Playback position" })
    await slider.focus()
    await slider.press("ArrowRight")
    await expect(lastCommand(page)).toHaveText("--seek 1943")
  })

  test("forwards parsed setlist JSON through the import port", async ({
    page,
  }) => {
    const file = {
      version: "1.0",
      name: "Friday",
      segments: [
        {
          title: "Imported Twitch",
          type: "twitch",
          url: "https://twitch.tv/imported",
          duration: 5,
          platform: "Twitch",
        },
      ],
    }

    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "friday.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(file)),
    })

    await expect(page.getByText("Imported Twitch")).toBeVisible()
    await expect(page.locator('[draggable="true"]')).toHaveCount(1)
  })

  test("emits --clearqueue and keeps the host snapshot authoritative", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Clear queue" }).click()
    await expect(lastCommand(page)).toHaveText("--clearqueue")
    await expect(page.locator('[draggable="true"]')).toHaveCount(1)
  })

  test("uses the host close port", async ({ page }) => {
    await page.getByRole("button", { name: "Close" }).click()
    await expect(page.getByTestId("mqs-window")).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Open queue" })).toBeVisible()
  })

  test("fits the player HUD at 320px width", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    await page.reload()

    const queue = page.getByTestId("mqs-window")
    const box = await queue.boundingBox()
    if (!box) throw new Error("MQS window has no bounding box")
    expect(box.width).toBeLessThanOrEqual(304)
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Clear queue" })
    ).toBeVisible()
  })

  test("has no WCAG A or AA violations", async ({ page }) => {
    await page.waitForLoadState("networkidle")
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()

    expect(
      results.violations,
      results.violations
        .map(
          (violation) =>
            `${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`
        )
        .join("\n")
    ).toEqual([])
  })
})
