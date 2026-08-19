import { allExamples } from "../src/examples"
import { writeFileSync, mkdirSync } from "fs"

// Ensure dist/ and docs/ exist
mkdirSync("dist", { recursive: true })
mkdirSync("docs", { recursive: true })

// ── components.json ──────────────────────────────────────────────────────────

const manifest = {
  version: process.env.npm_package_version ?? "0.0.0",
  generated: new Date().toISOString(),
  components: Object.fromEntries(
    allExamples.map((mod) => {
      const { meta, examples, ...named } = mod as any
      const exampleList = examples ?? Object.values(named).filter(
        (v: any) => v !== null && typeof v === "object" && "name" in v
      )
      const examplesForManifest = (exampleList as any[]).map((ex: any) => ({
        key: ex.name.toLowerCase().replace(/\s+/g, "_"),
        name: ex.name,
        args: ex.args,
      }))
      return [
        meta.title,
        {
          title:       meta.title,
          slug:        meta.slug ?? meta.title.toLowerCase(),
          description: meta.description,
          category:    meta.category,
          notes:       meta.notes ?? [],
          examples:    examplesForManifest,
        },
      ]
    })
  ),
}

writeFileSync("dist/components.json", JSON.stringify(manifest, null, 2))
console.log(`✓ dist/components.json — ${allExamples.length} components`)

// ── COMPONENTS.md ────────────────────────────────────────────────────────────

// Args keys that are shared demo data, not meaningful for package guidance.
// testId is also excluded — it's a test harness prop, not a usage prop.
const NOISE_KEYS = new Set([
  "title", "date", "time", "host", "space", "imageSrc",
  "hostHref", "spaceHref", "testId",
])

const sections = allExamples.map((mod) => {
  const { meta, examples, ...named } = mod as any
  const exampleList = examples ?? Object.values(named).filter(
    (v: any) => v !== null && typeof v === "object" && "name" in v
  )

  const rows = (exampleList as any[]).map((ex: any) => {
    const keyArgs = Object.entries(ex.args as Record<string, unknown>)
      .filter(([k]) => !NOISE_KEYS.has(k))
      .map(([k, v]) => {
        // Skip functions — they're not useful in docs
        if (typeof v === "function") return null
        return `\`${k}=${JSON.stringify(v)}\``
      })
      .filter(Boolean)
      .join(" ")
    return `| ${ex.name} | | ${keyArgs || "—"} |`
  })

  const parts = [
    `## ${meta.title}`,
    "",
    meta.description,
    "",
    meta.composeOnly
      ? `**Import:** Compose multiple exports from \`@hubzz/ui\` (see \`DESIGN.md\`).`
      : `**Import:** \`import { ${meta.title} } from "@hubzz/ui"\``,
    "",
    "### Examples",
    "| Name | Description | Key Props |",
    "|------|-------------|-----------|",
    ...rows,
    meta.notes?.length
      ? `\n### Notes\n${(meta.notes as string[]).map((n) => `- ${n}`).join("\n")}`
      : null,
  ]

  return parts.filter((p) => p !== null).join("\n")
})

const md =
  "# @hubzz/ui Component Reference\n\n" +
  "> Auto-generated from `src/examples/`. Do not edit manually — run `npm run generate:manifest`.\n\n" +
  sections.join("\n\n---\n\n")

writeFileSync("docs/COMPONENTS.md", md)
console.log(`✓ docs/COMPONENTS.md`)
