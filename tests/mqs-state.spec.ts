import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Page } from "@playwright/test"

const active = (page: Page) => page.getByTestId("current-row")
const rows = (page: Page) =>
  page.getByRole("list", { name: "Media queue items" }).getByRole("listitem")
const slider = (page: Page) =>
  page.getByRole("slider", { name: "Playback position" })
const command = (page: Page) => page.getByTestId("last-mqs-command")
const error = (page: Page) =>
  page.getByText("Could not load setlist", { exact: true })
const title = "Tomorrowland 2026 Mainstage W1"

async function upload(page: Page, value: unknown, name = "setlist.json") {
  await page.getByLabel("Setlist JSON file").setInputFiles({
    name,
    mimeType: "application/json",
    buffer: Buffer.from(typeof value === "string" ? value : JSON.stringify(value)),
  })
}

function setlist(name: string, duration = 1) {
  return {
    segments: [
      { title: name, type: "website", url: "https://example.com", duration },
    ],
  }
}

test.describe("MQS state and import edge cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?prototype=mqs")
    await expect(active(page)).toContainText(title)
  })

  test("reorder preserves the active item, time, pause and mute", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Pause", exact: true }).click()
    await page.getByRole("button", { name: "Mute", exact: true }).click()
    const control = active(page).getByRole("button", { name: /^Reorder/ })
    await control.press("Alt+ArrowDown")
    await expect(active(page)).toContainText(title)
    await expect(active(page)).toHaveAttribute("data-queue-index", "2")
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "1938")
    await expect(
      page.getByRole("button", { name: "Play", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Unmute", exact: true })
    ).toBeVisible()
    await expect(control).toBeFocused()
  })

  test("moving another item across the active row preserves playback", async ({
    page,
  }) => {
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await rows(page).nth(0).dispatchEvent("dragstart", { dataTransfer })
    await rows(page).nth(4).dispatchEvent("drop", { dataTransfer })
    await expect(active(page)).toContainText(title)
    await expect(active(page)).toHaveAttribute("data-queue-index", "0")
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "1938")
    await dataTransfer.dispose()
  })

  test("removing rows before and after the active item preserves time", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Remove item 1", exact: true }).click()
    await expect(active(page)).toContainText(title)
    await expect(active(page)).toHaveAttribute("data-queue-index", "0")
    await page.getByRole("button", { name: "Remove item 4", exact: true }).click()
    await expect(active(page)).toContainText(title)
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "1938")
  })

  test("removing the active item chooses its successor without resuming", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Pause", exact: true }).click()
    await page.getByRole("button", { name: "Mute", exact: true }).click()
    await active(page)
      .getByRole("button", { name: /^Remove/ })
      .click()
    await expect(active(page)).toContainText("Afterlife Tulum 2025")
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "0")
    await expect(
      page.getByRole("button", { name: "Play", exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Unmute", exact: true })
    ).toBeVisible()
  })

  test("removing the tail chooses the predecessor with zero elapsed time", async ({
    page,
  }) => {
    await upload(page, {
      segments: [...setlist("First").segments, ...setlist("Last").segments],
    })
    await page.getByRole("button", { name: "Skip", exact: true }).click()
    await slider(page).press("End")
    await active(page)
      .getByRole("button", { name: /^Remove/ })
      .click()
    await expect(active(page)).toContainText("First")
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "0")
    await expect(
      page.getByRole("button", { name: "Skip", exact: true })
    ).toBeDisabled()
    await expect(
      page.getByRole("button", { name: "Previous", exact: true })
    ).toBeDisabled()
  })

  test("an empty queue stops and can recover through import", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Mute", exact: true }).click()
    await page.getByRole("button", { name: "Clear queue", exact: true }).click()
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "1938")
    await active(page)
      .getByRole("button", { name: /^Remove/ })
      .click()
    await expect(page.getByText("Queue is empty.")).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Play", exact: true })
    ).toBeDisabled()
    await expect(
      page.getByRole("button", { name: "Skip", exact: true })
    ).toBeDisabled()
    await expect(slider(page)).toHaveCount(0)
    await upload(page, setlist("Recovered"))
    await expect(active(page)).toContainText("Recovered")
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "0")
    await expect(
      page.getByRole("button", { name: "Pause", exact: true })
    ).toBeEnabled()
    await expect(
      page.getByRole("button", { name: "Unmute", exact: true })
    ).toBeVisible()
  })

  test("seek keyboard boundaries remain valid", async ({ page }) => {
    await slider(page).press("Home")
    await slider(page).press("ArrowLeft")
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "0")
    await slider(page).press("End")
    await slider(page).press("ArrowRight")
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "4542")
    await expect(slider(page)).toHaveAttribute("aria-valuetext", "1:15:42")
    await expect(command(page)).toHaveText("--seek 4542")
  })

  test("live and invalid durations never produce a false seek range", async ({
    page,
  }) => {
    for (const duration of [undefined, 0, -1, 1e308, 0.0001]) {
      await upload(page, {
        segments: [{ type: "native", title: "Live item", duration }],
      })
      await expect(active(page)).toContainText("Live item")
      await expect(slider(page)).toHaveCount(0)
      await expect(page.getByTestId("mqs-window")).not.toContainText(
        /NaN|Infinity/
      )
    }
    for (const durationMode of ["percent", "fill"]) {
      await upload(page, {
        segments: [
          { type: "native", title: "Dynamic", duration: 10, durationMode },
        ],
      })
      await expect(active(page)).toContainText("Dynamic")
      await expect(slider(page)).toHaveCount(0)
    }
  })

  test("invalid imports preserve the queue and allow a retry", async ({
    page,
  }) => {
    const original = await rows(page).allTextContents()
    for (const value of [
      "{",
      {},
      { segments: [] },
      { segments: [{ url: "javascript:alert(1)" }] },
    ]) {
      await upload(page, value)
      await expect(error(page)).toBeVisible()
      await expect(rows(page)).toHaveText(original)
      await expect(slider(page)).toHaveAttribute("aria-valuenow", "1938")
    }
    await upload(page, setlist("Retry"))
    await expect(active(page)).toContainText("Retry")
    await expect(error(page)).toHaveCount(0)
  })

  test("partial imports report skipped rows and preserve mute", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Mute", exact: true }).click()
    await upload(page, { segments: [null, ...setlist("Valid item").segments] })
    await expect(rows(page)).toHaveCount(1)
    await expect(active(page)).toContainText("Valid item")
    await expect(
      page.getByText("Some setlist segments were skipped", { exact: true })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Unmute", exact: true })
    ).toBeVisible()
  })

  test("repeated imports cannot reuse a previous drag identity", async ({
    page,
  }) => {
    const data = {
      segments: [...setlist("Same").segments, ...setlist("Same").segments],
    }
    await upload(page, data)
    await expect(rows(page)).toHaveCount(2)
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
    await rows(page).first().dispatchEvent("dragstart", { dataTransfer })
    await upload(page, data)
    await expect(active(page)).toHaveAttribute("data-queue-index", "0")
    await rows(page).nth(1).dispatchEvent("drop", { dataTransfer })
    await expect(command(page)).toHaveText("")
    await expect(active(page)).toHaveAttribute("data-queue-index", "0")
    await dataTransfer.dispose()
  })

  for (const outcome of ["success", "failure"] as const) {
    test(`a late ${outcome} cannot replace a newer import`, async ({
      page,
    }) => {
      const complete = await page.evaluateHandle(() => {
        const read = File.prototype.text
        let resolve: (value: string) => void = () => {}
        let reject: (value: Error) => void = () => {}
        File.prototype.text = function () {
          if (this.name !== "slow.json") return read.call(this)
          return new Promise<string>((yes, no) => {
            resolve = yes
            reject = no
          })
        }
        return (fail: boolean) =>
          fail
            ? reject(new Error("Delayed read failure"))
            : resolve('{"segments":[{"type":"native","title":"Old result"}]}')
      })
      await upload(page, {}, "slow.json")
      await page.getByRole("button", { name: "Mute", exact: true }).click()
      await upload(page, setlist("New result"), "fast.json")
      await expect(active(page)).toContainText("New result")
      await complete.evaluate(async (finish, fail) => {
        finish(fail)
        await Promise.resolve()
      }, outcome === "failure")
      await expect(active(page)).toContainText("New result")
      await expect(error(page)).toHaveCount(0)
      await expect(
        page.getByRole("button", { name: "Unmute", exact: true })
      ).toBeVisible()
      await complete.dispose()
    })
  }

  test("closing the queue cancels a pending import", async ({ page }) => {
    const complete = await page.evaluateHandle(() => {
      let resolve: (value: string) => void = () => {}
      File.prototype.text = () =>
        new Promise<string>((yes) => {
          resolve = yes
        })
      return () =>
        resolve('{"segments":[{"type":"native","title":"Stale result"}]}')
    })
    await upload(page, {}, "slow.json")
    await page.getByRole("button", { name: "Close", exact: true }).click()
    await expect(page.getByTestId("mqs-window")).toHaveCount(0)
    await page.getByRole("button", { name: "Open queue", exact: true }).click()
    await complete.evaluate(async (finish) => {
      finish()
      await Promise.resolve()
    })
    await expect(active(page)).toContainText(title)
    await expect(slider(page)).toHaveAttribute("aria-valuenow", "1938")
    await complete.dispose()
  })

  test("file-read failures produce feedback without a page error", async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.evaluate(() => {
      File.prototype.text = async () => {
        throw new Error("Read failed")
      }
    })
    await upload(page, {})
    await expect(error(page)).toBeVisible()
    await expect(active(page)).toContainText(title)
    await page.waitForLoadState("networkidle")
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(result.violations).toEqual([])
    expect(errors).toEqual([])
  })

  test("oversized files are rejected before they are read", async ({
    page,
  }) => {
    await page.evaluate(() => {
      File.prototype.text = async () => {
        document.body.dataset.fileRead = "true"
        return "{}"
      }
    })
    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "large.json",
      mimeType: "application/json",
      buffer: Buffer.alloc(2 * 1024 * 1024 + 1, 32),
    })
    await expect(error(page)).toBeVisible()
    await expect(
      page.getByText("Choose a JSON file no larger than 2 MiB.")
    ).toBeVisible()
    await expect(page.locator("body")).not.toHaveAttribute(
      "data-file-read",
      "true"
    )
    await expect(active(page)).toContainText(title)
  })

  test("a file exactly at the size limit is accepted", async ({ page }) => {
    const text = JSON.stringify(setlist("At the file limit"))
    await upload(page, text.padEnd(2 * 1024 * 1024, " "))
    await expect(active(page)).toContainText("At the file limit")
    await expect(error(page)).toHaveCount(0)
  })

  test("the 500-item limit works and excessive imports preserve the queue", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 })
    const segments = Array.from({ length: 500 }, (_, index) => ({
      type: "native",
      title: `Item ${index + 1}`,
    }))
    await upload(page, { segments })
    await expect(rows(page)).toHaveCount(500)
    await page
      .getByRole("button", { name: "Reorder item 500", exact: true })
      .press("Alt+ArrowDown")
    await expect(command(page)).toHaveText("")
    await upload(page, { segments: [...segments, { type: "native" }] })
    await expect(error(page)).toBeVisible()
    await expect(rows(page)).toHaveCount(500)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true)
  })
})
