import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:5173",
    // No screenshots by default — tests use DOM measurement
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 30_000,
  },
  // Run tests serially — single page, no parallelism needed
  workers: 1,
})
