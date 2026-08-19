import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import { defineConfig, globalIgnores } from "eslint/config"

const recommended = [js.configs.recommended, tseslint.configs.recommended]

export default defineConfig([
  globalIgnores(["dist", "playwright-report", "test-results"]),
  {
    files: ["src/**/*.{ts,tsx}"],
    extends: [...recommended, reactHooks.configs.flat.recommended],
    plugins: {
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
  },
  {
    files: ["src/App.tsx", "src/main.tsx", "src/pages/**/*.tsx"],
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: [
      "scripts/**/*.ts",
      "tests/**/*.ts",
      "playwright.config.ts",
      "vite.config.ts",
    ],
    extends: recommended,
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
])
