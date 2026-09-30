import * as React from "react"
import { ExternalLink } from "lucide-react"

import { CopyCommand } from "@/catalog/copy-command"
import { Button } from "@/components/ui/button"
import { allExamples } from "@/examples"
import type { ComponentLayer, Example, Meta } from "@/examples/types"

type CatalogProps = Record<string, unknown>
type CatalogComponent = React.ComponentType<CatalogProps>
type CatalogMeta = Meta<CatalogComponent>
type CatalogExample = Example<CatalogProps>
type CatalogModule = {
  meta: CatalogMeta
  examples?: CatalogExample[]
} & Record<string, unknown>

const GROUPS: Array<{
  id: string
  layer: ComponentLayer
  eyebrow: string
  title: string
  description: string
}> = [
  {
    id: "overrides",
    layer: "override",
    eyebrow: "Overrides",
    title: "API-compatible overrides",
    description: "shadcn contracts with Hubzz visual or interaction treatment.",
  },
  {
    id: "components",
    layer: "component",
    eyebrow: "Hubzz components",
    title: "Product components",
    description:
      "Hubzz-specific interface structure built on upstream primitives.",
  },
  {
    id: "patterns",
    layer: "pattern",
    eyebrow: "Patterns",
    title: "Product patterns",
    description: "Reusable arrangements of primitives and Hubzz components.",
  },
]

function isExample(value: unknown): value is CatalogExample {
  if (value === null || typeof value !== "object") return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.name === "string" && "args" in candidate
}

function normalizeModule(module: unknown): {
  meta: CatalogMeta
  examples: CatalogExample[]
} {
  const record = module as CatalogModule
  const examples =
    record.examples ??
    Object.entries(record)
      .filter(
        ([key, value]) =>
          key !== "meta" && key !== "examples" && isExample(value)
      )
      .map(([, value]) => value as CatalogExample)

  return { meta: record.meta, examples }
}

const CATALOG = allExamples.map(normalizeModule)
const SOURCE_REF = import.meta.env.VITE_SOURCE_REF || "main"

export function Catalog() {
  return (
    <div className="space-y-24">
      {GROUPS.map((group) => {
        const modules = CATALOG.filter(
          ({ meta }) => (meta.layer ?? "component") === group.layer
        )

        if (modules.length === 0) return null

        return (
          <section key={group.id} id={group.id} className="scroll-mt-20">
            <SectionIntro {...group} />
            <div className="space-y-10">
              {modules.map(({ meta, examples }) => (
                <ComponentSection
                  key={meta.title}
                  meta={meta}
                  examples={examples}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-8 grid gap-3 border-b border-border pb-7 md:grid-cols-[180px_1fr]">
      <p className="text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <div className="max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-[-0.025em] text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  )
}

function ComponentSection({
  meta,
  examples,
}: {
  meta: CatalogMeta
  examples: CatalogExample[]
}) {
  const slug = meta.slug ?? meta.title.toLowerCase()
  const command = `pnpm dlx shadcn@latest add russfranky/hubzzcn/${slug}`
  const sourceDirectory = meta.category === "shadcn" ? "ui" : "hubzz"
  const sourceUrl = `https://github.com/russfranky/hubzzcn/blob/${SOURCE_REF}/src/components/${sourceDirectory}/${slug}.tsx`

  return (
    <article id={slug} className="scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold tracking-[-0.015em] text-foreground">
            {meta.title}
          </h3>
          {meta.description ? (
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              {meta.description}
            </p>
          ) : null}
        </div>

        <Button variant="ghost" size="sm" asChild>
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
            Source
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        </Button>
      </div>

      <CopyCommand command={command} className="mb-5 max-w-2xl" />

      <div
        className={
          examples.length === 1
            ? "grid gap-4"
            : "grid gap-4 sm:grid-cols-2"
        }
      >
        {examples.map((example) => (
          <ExamplePreview key={example.name} meta={meta} example={example} />
        ))}
      </div>
    </article>
  )
}

function ExamplePreview({
  meta,
  example,
}: {
  meta: CatalogMeta
  example: CatalogExample
}) {
  const rendered = example.render
    ? example.render(example.args)
    : React.createElement(meta.component, example.args)

  return (
    <div
      data-catalog-example={example.name}
      className="flex min-h-44 min-w-0 flex-col rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      <p className="mb-3 text-[11px] font-medium tracking-wide text-muted-foreground">
        {example.name}
      </p>
      <div
        data-catalog-preview={example.name}
        className="flex min-h-32 flex-1 items-center justify-center overflow-x-auto rounded-lg border border-border bg-muted/30 p-6"
      >
        {rendered}
      </div>
    </div>
  )
}
