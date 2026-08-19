import { mkdirSync, writeFileSync } from "node:fs"
import type { ElementType } from "react"

import { allExamples } from "../src/examples"
import type { Example, Meta } from "../src/examples/types"

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

mkdirSync("dist", { recursive: true })
mkdirSync("docs", { recursive: true })

const manifest = {
  version: process.env.npm_package_version ?? "0.0.0",
  components: Object.fromEntries(
    allExamples.map((module) => {
      const { meta, examples } = normalizeModule(module)
      return [
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
      ]
    })
  ),
}

writeFileSync("dist/components.json", JSON.stringify(manifest, null, 2))
console.log(`✓ dist/components.json — ${allExamples.length} components`)

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

const sections = allExamples.map((module) => {
  const { meta, examples } = normalizeModule(module)
  const rows = examples.map((example) => {
    const keyArgs = Object.entries(example.args)
      .filter(([key]) => !NOISE_KEYS.has(key))
      .map(([key, value]) => {
        if (typeof value === "function") return null
        return `\`${key}=${JSON.stringify(value)}\``
      })
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

const markdown =
  "# @hubzz/ui Component Reference\n\n" +
  "> Auto-generated from `src/examples/`. Do not edit manually. Run `npm run generate:manifest`.\n\n" +
  sections.join("\n\n---\n\n")

writeFileSync("docs/COMPONENTS.md", markdown)
console.log("✓ docs/COMPONENTS.md")
