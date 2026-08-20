import { readFileSync, writeFileSync } from "node:fs"

const SOURCE = "src/index.css"
const TARGET = "registry/foundations/registry.json"
const CHECK = process.argv.includes("--check")

function extractBlock(css: string, selector: string) {
  const selectorIndex = css.indexOf(selector)
  if (selectorIndex === -1) {
    throw new Error(`Missing ${selector} block in ${SOURCE}`)
  }

  const openBrace = css.indexOf("{", selectorIndex)
  if (openBrace === -1) {
    throw new Error(`Missing opening brace for ${selector}`)
  }

  let depth = 0
  for (let index = openBrace; index < css.length; index += 1) {
    const char = css[index]
    if (char === "{") depth += 1
    if (char === "}") depth -= 1
    if (depth === 0) {
      return css.slice(openBrace + 1, index)
    }
  }

  throw new Error(`Missing closing brace for ${selector}`)
}

function customProperties(block: string) {
  const withoutComments = block.replace(/\/\*[\s\S]*?\*\//g, "")
  const properties: Record<string, string> = {}
  const pattern = /--([a-z0-9-]+)\s*:\s*([^;]+);/gi

  for (const match of withoutComments.matchAll(pattern)) {
    const [, name, rawValue] = match
    properties[name] = rawValue.replace(/\s+/g, " ").trim()
  }

  return properties
}

function registryItem(
  type: "registry:base" | "registry:theme",
  light: Record<string, string>,
  dark: Record<string, string>
) {
  const isBase = type === "registry:base"

  return {
    name: isBase ? "hubzz" : "hubzz-theme",
    type,
    title: isBase ? "Hubzz UI" : "Hubzz Theme",
    description: isBase
      ? "Complete Hubzz design-system base for shadcn/ui projects using the Radix component base."
      : "Hubzz semantic color, typography, and interaction tokens for existing shadcn/ui projects.",
    author: "Hubzz",
    ...(isBase
      ? {
          config: {
            style: "radix-nova",
            iconLibrary: "lucide",
            rsc: false,
            tsx: true,
            rtl: false,
            menuColor: "default-translucent",
            menuAccent: "subtle",
            tailwind: { baseColor: "neutral" },
          },
          dependencies: [
            "class-variance-authority",
            "clsx",
            "lucide-react",
            "radix-ui",
            "tailwind-merge",
            "tw-animate-css",
          ],
          registryDependencies: ["utils", "font-inter"],
        }
      : { registryDependencies: ["font-inter"] }),
    cssVars: {
      theme: {
        radius: light.radius,
        "font-sans": "'Inter Variable', sans-serif",
        "font-heading": "'Inter Variable', sans-serif",
        "font-display": "'Inter Variable', sans-serif",
      },
      light,
      dark,
    },
    ...(isBase
      ? {
          css: {
            '@import "tw-animate-css"': {},
            "@layer base": {
              "*": { "@apply border-border outline-ring/50": {} },
              body: { "@apply bg-background text-foreground": {} },
            },
          },
        }
      : {}),
    categories: isBase ? ["design-system", "theme"] : ["theme"],
    meta: isBase
      ? { base: "radix", stability: "beta", source: SOURCE }
      : { stability: "beta", source: SOURCE },
  }
}

const css = readFileSync(SOURCE, "utf8")
const light = customProperties(extractBlock(css, ":root"))
const dark = customProperties(extractBlock(css, ".dark"))

if (!light.background || !dark.background || !light.primary || !dark.primary) {
  throw new Error("Theme source is missing required semantic tokens")
}

const output = `${JSON.stringify(
  {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    items: [
      registryItem("registry:base", light, dark),
      registryItem("registry:theme", light, dark),
    ],
  },
  null,
  2
)}\n`

if (CHECK) {
  const current = readFileSync(TARGET, "utf8")
  if (current !== output) {
    console.error(`${TARGET} is out of sync with ${SOURCE}.`)
    console.error("Run `pnpm registry:sync` and commit the generated file.")
    process.exit(1)
  }
  console.log(`✓ ${TARGET} matches ${SOURCE}`)
} else {
  writeFileSync(TARGET, output)
  console.log(`✓ synced ${TARGET} from ${SOURCE}`)
}
