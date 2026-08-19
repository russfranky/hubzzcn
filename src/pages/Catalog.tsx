import * as React from "react"
import { allExamples } from "@/examples"
import type { Meta, Example } from "@/examples/types"

type CatalogProps = Record<string, unknown>
type CatalogComponent = React.ComponentType<CatalogProps>
type CatalogMeta = Meta<CatalogComponent>
type CatalogExample = Example<CatalogProps>
type CatalogModule = {
  meta: CatalogMeta
  examples?: CatalogExample[]
} & Record<string, unknown>

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

export function Catalog() {
  return (
    <div className="space-y-16">
      {allExamples.map((module) => {
        const { meta, examples } = normalizeModule(module)
        return (
          <ComponentSection key={meta.title} meta={meta} examples={examples} />
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
    <section
      id={meta.slug ?? meta.title.toLowerCase()}
      className="scroll-mt-20"
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-card-foreground">
            {meta.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.description}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/30 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap gap-6">
          {examples.map((example) => (
            <ExamplePreview key={example.name} meta={meta} example={example} />
          ))}
        </div>

        {meta.notes && meta.notes.length > 0 && (
          <ul className="mt-6 space-y-1 border-t border-border/40 pt-4">
            {meta.notes.map((note) => (
              <li key={note} className="text-xs text-muted-foreground">
                · {note}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
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
    <div className="flex flex-col gap-2">
      {rendered}
      <div>
        <p className="text-xs font-medium text-card-foreground">
          {example.name}
        </p>
      </div>
    </div>
  )
}
