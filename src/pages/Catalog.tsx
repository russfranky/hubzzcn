import * as React from "react"

import { Badge } from "@/components/ui/badge"
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
    title: "Change the visual layer, keep the upstream contract.",
    description:
      "Overrides are rare. They preserve an upstream shadcn API and change only the Hubzz-specific layer that cannot live in theme tokens alone.",
  },
  {
    id: "components",
    layer: "component",
    eyebrow: "Hubzz components",
    title: "Own only the UI that is actually Hubzz-specific.",
    description:
      "These components add reusable product structure while delegating commodity behavior to upstream primitives wherever possible.",
  },
  {
    id: "patterns",
    layer: "pattern",
    eyebrow: "Patterns",
    title: "Compose primitives into repeatable product patterns.",
    description:
      "Patterns are larger reusable arrangements. They receive data and callbacks from the application and do not own product services or state.",
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

export function Catalog() {
  return (
    <div className="space-y-24">
      {GROUPS.map((group) => {
        const modules = CATALOG.filter(
          ({ meta }) => (meta.layer ?? "component") === group.layer
        )

        if (modules.length === 0) return null

        return (
          <section key={group.id} id={group.id} className="scroll-mt-24">
            <div className="mb-10 max-w-2xl">
              <Badge variant="outline">{group.eyebrow}</Badge>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
                {group.title}
              </h2>
              <p className="mt-3 text-muted-foreground">{group.description}</p>
            </div>

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

function ComponentSection({
  meta,
  examples,
}: {
  meta: CatalogMeta
  examples: CatalogExample[]
}) {
  return (
    <article
      id={meta.slug ?? meta.title.toLowerCase()}
      className="scroll-mt-24 rounded-2xl border border-border bg-card/30 p-5 sm:p-6"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              {meta.title}
            </h3>
            <Badge variant="secondary">
              {meta.category === "shadcn" ? "shadcn override" : "Hubzz"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {meta.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6 rounded-xl border border-border/60 bg-background/40 p-5">
        {examples.map((example) => (
          <ExamplePreview key={example.name} meta={meta} example={example} />
        ))}
      </div>

      {meta.notes?.length ? (
        <ul className="mt-5 space-y-1.5 border-t border-border/50 pt-4">
          {meta.notes.map((note) => (
            <li key={note} className="text-xs leading-5 text-muted-foreground">
              {note}
            </li>
          ))}
        </ul>
      ) : null}
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
    <div className="flex max-w-full flex-col gap-2">
      {rendered}
      <p className="text-xs font-medium text-muted-foreground">
        {example.name}
      </p>
    </div>
  )
}
