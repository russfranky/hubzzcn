import { expect, test } from "@playwright/test"

test.describe("Stage HUD prototype", () => {
  test("opens the host grid with people rail and leave control", async ({
    page,
  }) => {
    await page.goto("/?prototype=stage")

    await expect(page.getByTestId("stage-hud")).toBeVisible()
    await expect(
      page.getByRole("heading", { name: "Hubzz tower" })
    ).toBeVisible()
    await expect(
      page.getByRole("button", { name: /Jenny Wilson/ })
    ).toBeVisible()
    await expect(page.getByLabel("Hide people")).toBeVisible()
    await expect(page.getByRole("button", { name: "Chat" })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Leave stage" })
    ).toBeVisible()
    await expect(page.getByRole("button", { name: /hang.?up/i })).toHaveCount(0)
  })

  test("collapses the rail and reopens it from the event header", async ({
    page,
  }) => {
    await page.goto("/cn/stage")

    await page.getByLabel("Hide people").click()
    await expect(page.getByLabel("Show panel")).toBeVisible()
    await expect(page.getByLabel("Hide people")).toHaveCount(0)

    await page.getByLabel("Show panel").click()
    await expect(page.getByLabel("Hide people")).toBeVisible()
  })

  test("opens chat exclusively and confirms leave", async ({ page }) => {
    await page.goto("/?prototype=stage")

    await page.getByRole("button", { name: "Chat" }).click()
    await expect(
      page.getByRole("complementary", { name: "Chat" })
    ).toBeVisible()
    await expect(page.getByPlaceholder("Chat along")).toBeVisible()
    await expect(page.getByLabel("Hide people")).toHaveCount(0)

    await page.getByRole("button", { name: "Leave stage" }).click()
    await expect(
      page.getByRole("heading", { name: "Are you sure you want to leave?" })
    ).toBeVisible()
    await page.getByRole("button", { name: "Leave anyway" }).click()
    await expect(
      page.getByRole("heading", { name: "Are you sure you want to leave?" })
    ).toHaveCount(0)
  })
})
