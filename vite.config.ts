import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const isPreviewApp = process.env.VITE_APP_BUILD === "preview"

// https://vite.dev/config/
export default defineConfig({
  base: isPreviewApp ? "/shadcn/" : undefined,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  ...(isPreviewApp
    ? {}
    : {
        build: {
          lib: {
            entry: path.resolve(__dirname, "src/index.ts"),
            name: "HubzzUI",
            formats: ["es", "cjs"],
            fileName: (format) => `hubzz-ui.${format === "es" ? "mjs" : "cjs"}`,
          },
          rollupOptions: {
            external: ["react", "react-dom", "react/jsx-runtime"],
            output: {
              globals: {
                react: "React",
                "react-dom": "ReactDOM",
                "react/jsx-runtime": "jsxRuntime",
              },
              assetFileNames: (assetInfo) => {
                if (assetInfo.name === "style.css") return "hubzz-ui.css"
                return assetInfo.name!
              },
            },
          },
          cssCodeSplit: false,
        },
      }),
})
