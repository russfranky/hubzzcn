import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const appBuild = process.env.VITE_APP_BUILD
const isProductionCatalog = appBuild === "preview"
const isVercelCatalog = appBuild === "vercel"
const isCatalogBuild = isProductionCatalog || isVercelCatalog

export default defineConfig({
  base: isProductionCatalog ? "/cn/" : undefined,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  ...(isCatalogBuild
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
