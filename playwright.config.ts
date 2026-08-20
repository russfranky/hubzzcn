import { defineConfig, devices } from "@playwright/test"

const catalogSmoke = /(?:accessibility|catalog)\.spec\.ts/
const previewPort = 4173
const previewUrl = `http://127.0.0.1:${previewPort}`

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: previewUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox-catalog",
      testMatch: catalogSmoke,
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit-catalog",
      testMatch: catalogSmoke,
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: {
    command: `pnpm build:vercel && pnpm exec vite preview --host 127.0.0.1 --port ${previewPort} --strictPort`,
    url: previewUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
