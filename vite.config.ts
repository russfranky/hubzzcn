import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const isPreviewApp = process.env.VITE_APP_BUILD === "preview"

export default defineConfig({
  base: isPreviewApp ? "/cn/" : undefined,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  ...(isPreviewApp
    ? {}
    : {
        build: {
          lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "HubzzUI",
            formats: ["es", "cjs"],
            fileName: (format: string) =>
              `hubzz-ui.${format === "es" ? "mjs" : "cjs"}`,
            cssFileName: "hubzz-ui",
          },
          rollupOptions: {
            external: ["react", "react-dom", "react/jsx-runtime"],
          },
          cssCodeSplit: false,
        },
      }),
})
