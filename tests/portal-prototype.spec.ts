import { expect, test } from "@playwright/test"

test("Portal opens Spaces as a filter and keeps discovery available", async ({
  page,
}) => {
  await page.goto("/cn/portal")

  await expect(page.getByText("Spaces", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Back" })).toBeVisible()
  await expect(page).toHaveURL(/portal=hubzz_tower_portal/)
  await expect(
    page.getByText("Hubzz Tower Portal", { exact: true })
  ).toBeVisible()

  await page.getByLabel("Search spaces").fill("Hallway 12")
  await expect(page.getByRole("heading", { name: "Hallway 12" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Hallway 11" })).toHaveCount(0)

  await page.getByLabel("Search spaces").fill("")
  await page
    .getByRole("button", { name: "View Hallway 12 and 15 attached spaces" })
    .click()

  await expect(page).toHaveURL(/attachedTo=hallway-12/)
  await expect(page.getByText("12-01", { exact: true })).toBeVisible()

  await page.getByRole("button", { name: "Back" }).click()
  await expect(page).toHaveURL(/portal=hubzz_tower_portal/)
  await expect(page.getByRole("heading", { name: "Hallway 12" })).toBeVisible()

  await page.getByRole("button", { name: "Filter spaces" }).click()
  await page.getByRole("button", { name: "All spaces" }).click()

  await expect(page).toHaveURL(/scope=all/)
  await expect(page.getByRole("heading", { name: "The Lounge" })).toBeVisible()
})
