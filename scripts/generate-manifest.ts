import { spawnSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import type { ElementType } from "react"
import { format } from "prettier"

import { allExamples } from "../src/examples"
import type { Example, Meta } from "../src/examples/types"
import { loadRegistryGraph } from "./registry-graph"

type ManifestArgs = Record<string, unknown>
type ManifestExample = Example<ManifestArgs>
type ManifestMeta = Meta<ElementType>
type ExampleModule = {
  meta: ManifestMeta
  examples?: ManifestExample[]
} & Record<string, unknown>

function isExample(value: unknown): value is ManifestExample {
  if (value === null || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.name === "string" && "args" in candidate
}

function normalizeModule(module: unknown) {
  const record = module as ExampleModule
  const examples =
    record.examples ??
    Object.entries(record)
      .filter(
        ([key, value]) =>
          key !== "meta" && key !== "examples" && isExample(value)
      )
      .map(([, value]) => value as ManifestExample)

  return { meta: record.meta, examples }
}

function componentIdentity(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "")
}

const catalogEntries = allExamples.map(normalizeModule)
const catalogComponentIdentities = new Set(
  catalogEntries.map(({ meta }) => componentIdentity(meta.title))
)
const uncataloguedPublicComponents = loadRegistryGraph()
  .items.filter((item) => item.type === "registry:component")
  .map((item) => item.name)
  .filter((name) => !catalogComponentIdentities.has(componentIdentity(name)))

if (uncataloguedPublicComponents.length > 0) {
  throw new Error(
    `Public Hubzz registry items missing catalog examples: ${uncataloguedPublicComponents.join(", ")}`
  )
}

const manifest = {
  version: process.env.npm_package_version ?? "0.0.0",
  components: Object.fromEntries(
    catalogEntries.map(({ meta, examples }) => [
      meta.title,
      {
        title: meta.title,
        slug: meta.slug ?? meta.title.toLowerCase(),
        description: meta.description,
        category: meta.category,
        layer: meta.layer ?? "component",
        notes: meta.notes ?? [],
        examples: examples.map((example) => ({
          key: example.name.toLowerCase().replace(/\s+/g, "_"),
          name: example.name,
          args: example.args,
        })),
      },
    ])
  ),
}

const NOISE_KEYS = new Set([
  "title",
  "date",
  "time",
  "host",
  "space",
  "imageSrc",
  "hostHref",
  "spaceHref",
  "testId",
])

function formatArg(key: string, value: unknown): string | null {
  if (NOISE_KEYS.has(key) || typeof value === "function") return null
  if (Array.isArray(value)) {
    return `\`${key}=[${value.length} ${value.length === 1 ? "item" : "items"}]\``
  }
  return `\`${key}=${JSON.stringify(value)}\``
}

const sections = catalogEntries.map(({ meta, examples }) => {
  const rows = examples.map((example) => {
    const keyArgs = Object.entries(example.args)
      .map(([key, value]) => formatArg(key, value))
      .filter((value): value is string => value !== null)
      .join(" ")

    return `| ${example.name} | | ${keyArgs || "—"} |`
  })

  const parts = [
    `## ${meta.title}`,
    "",
    meta.description,
    "",
    `**Layer:** ${meta.layer ?? "component"}`,
    "",
    meta.composeOnly
      ? `**Import:** Compose multiple exports from \`@hubzz/ui\`.`
      : `**Import:** \`import { ${meta.title} } from "@hubzz/ui"\``,
    "",
    "### Examples",
    "| Name | Description | Key Props |",
    "|------|-------------|-----------|",
    ...rows,
    meta.notes?.length
      ? `\n### Notes\n${meta.notes.map((note) => `- ${note}`).join("\n")}`
      : null,
  ]

  return parts.filter((part): part is string => part !== null).join("\n")
})

const rawMarkdown =
  "# @hubzz/ui Component Reference\n\n" +
  "> Auto-generated from `src/examples/`. Do not edit manually. Run `pnpm generate:manifest`.\n\n" +
  sections.join("\n\n---\n\n")

const markdown = await format(rawMarkdown, { parser: "markdown" })
const checkOnly = process.argv.includes("--check")

if (checkOnly) {
  const current = readFileSync("docs/COMPONENTS.md", "utf8")
  if (current !== markdown) {
    const tempDirectory = mkdtempSync(join(tmpdir(), "hubzz-components-"))
    const expectedPath = join(tempDirectory, "COMPONENTS.md")
    writeFileSync(expectedPath, markdown)
    console.error(
      "docs/COMPONENTS.md is out of date. Run `pnpm generate:manifest` and commit the result."
    )
    spawnSync(
      "git",
      ["diff", "--no-index", "--", "docs/COMPONENTS.md", expectedPath],
      { stdio: "inherit" }
    )
    rmSync(tempDirectory, { recursive: true, force: true })
    process.exitCode = 1
  } else {
    console.log(`✓ docs/COMPONENTS.md — ${allExamples.length} components`)
  }
} else {
  mkdirSync("dist", { recursive: true })
  mkdirSync("docs", { recursive: true })
  writeFileSync("dist/components.json", JSON.stringify(manifest, null, 2))
  writeFileSync("docs/COMPONENTS.md", markdown)
  console.log(`✓ dist/components.json — ${allExamples.length} components`)
  console.log("✓ docs/COMPONENTS.md")
}
