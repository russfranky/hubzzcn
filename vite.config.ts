import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const directory = path.dirname(fileURLToPath(import.meta.url))
const packageJson = JSON.parse(
  readFileSync(path.resolve(directory, "package.json"), "utf8")
) as {
  dependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
}
const externalPackages = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
]
const isPackageExternal = (id: string) =>
  externalPackages.some(
    (dependency) => id === dependency || id.startsWith(`${dependency}/`)
  )

const appBuild = process.env.VITE_APP_BUILD
const isProductionCatalog = appBuild === "preview"
const isVercelCatalog = appBuild === "vercel"
const isCatalogBuild = isProductionCatalog || isVercelCatalog
const sourceRef =
  process.env.VITE_SOURCE_REF ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.GITHUB_SHA ??
  "main"

export default defineConfig({
  base: isProductionCatalog ? "/cn/" : undefined,
  define: {
    "import.meta.env.VITE_SOURCE_REF": JSON.stringify(sourceRef),
  },
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(directory, "./src") } },
  ...(isCatalogBuild
    ? {}
    : {
        build: {
          lib: {
            entry: path.resolve(directory, "src/index.ts"),
            name: "HubzzUI",
            formats: ["es", "cjs"],
            fileName: (format: string) =>
              `hubzz-ui.${format === "es" ? "mjs" : "cjs"}`,
            cssFileName: "hubzz-ui",
          },
          rollupOptions: {
            external: isPackageExternal,
          },
          cssCodeSplit: false,
        },
      }),
})
