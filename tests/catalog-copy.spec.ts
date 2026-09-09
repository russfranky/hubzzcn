import AxeBuilder from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

const COPY_LABEL = "Copy base install command"
const ERROR_TITLE = "Could not copy command"
const ERROR_HELP = "Select the command text to copy it manually, or try again."
const CLIPBOARD_KEY = "hubzz-ui-copy-recovery-test"

test.describe("Catalog clipboard recovery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("networkidle")
  })

  test("reports denied clipboard access", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async () => {
            throw new DOMException("Clipboard denied", "NotAllowedError")
          },
        },
      })
    })

    const command = page.locator("#overview code")
    const originalText = await command.innerText()
    const copy = page.getByRole("button", { name: COPY_LABEL })
    await copy.focus()
    await copy.press("Enter")

    await expect(page.getByText(ERROR_TITLE, { exact: true })).toBeVisible()
    await expect(page.getByText(ERROR_HELP, { exact: true })).toBeVisible()
    await expect(copy).toBeEnabled()
    await expect(command).toHaveText(originalText)
    await expect(page.getByRole("button", { name: "Copied" })).toHaveCount(0)
    expect(errors).toEqual([])

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze()
    expect(results.violations).toEqual([])
  })

  test("handles a missing clipboard API", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: undefined,
      })
    })

    const copy = page.getByRole("button", { name: COPY_LABEL })
    await copy.click()
    await expect(page.getByText(ERROR_TITLE, { exact: true })).toBeVisible()
    await expect(page.getByText(ERROR_HELP, { exact: true })).toBeVisible()
    await expect(copy).toBeEnabled()
    await expect(page.getByRole("button", { name: "Copied" })).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test("retries a failed copy and clears the error", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.evaluate((key) => {
      let attempts = 0
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value: string) => {
            attempts += 1
            if (attempts === 1) {
              throw new DOMException("Clipboard denied", "NotAllowedError")
            }
            sessionStorage.setItem(key, value)
          },
        },
      })
    }, CLIPBOARD_KEY)

    const command = await page.locator("#overview code").innerText()
    const copy = page.getByRole("button", { name: COPY_LABEL })
    const errorMessage = page.getByText(ERROR_TITLE, { exact: true })
    await copy.click()
    await expect(errorMessage).toBeVisible()
    await copy.click()

    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible()
    await expect
      .poll(() =>
        page.evaluate((key) => sessionStorage.getItem(key), CLIPBOARD_KEY)
      )
      .toBe(command)
    await expect(errorMessage).toHaveCount(0)
    expect(errors).toEqual([])
  })

  test("resets successful copy feedback", async ({ page }) => {
    await page.evaluate(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async () => {} },
      })
    })

    const copy = page.getByRole("button", { name: COPY_LABEL })
    await copy.click()
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible()
    await expect(copy).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(ERROR_TITLE, { exact: true })).toHaveCount(0)
  })

  test("ignores stale copy failures", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    const failPendingCopy = await page.evaluateHandle(() => {
      let rejectPending: (reason: Error) => void = () => {}
      let attempts = 0
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: () => {
            attempts += 1
            if (attempts === 1) {
              return new Promise<void>((_resolve, reject) => {
                rejectPending = reject
              })
            }
            return Promise.resolve()
          },
        },
      })
      return () => rejectPending(new Error("Delayed clipboard failure"))
    })

    const copy = page.getByRole("button", { name: COPY_LABEL })
    await copy.click()
    await copy.click()
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible()
    await failPendingCopy.evaluate((fail) => fail())
    await expect(page.getByText(ERROR_TITLE, { exact: true })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Copied" })).toBeVisible()
    expect(errors).toEqual([])
    await failPendingCopy.dispose()
  })
})
