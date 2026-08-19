import * as React from "react"
import { allExamples } from "@/examples"
import type { Meta, Example } from "@/examples/types"

export function Catalog() {
  return (
    <div className="space-y-16">
      {allExamples.map((mod) => {
        const modObj = mod as unknown as { meta: Meta<any>; examples?: Example[]; [key: string]: any }
        const { meta } = modObj
        const examples: Example[] = modObj.examples ?? Object.entries(modObj)
          .filter(([k, v]) => k !== "meta" && k !== "examples" && v !== null && typeof v === "object" && "name" in v)
          .map(([, v]) => v) as Example[]
        return <ComponentSection key={meta.title} meta={meta} examples={examples} />
      })}
    </div>
  )
}

function ComponentSection({ meta, examples }: { meta: Meta<any>; examples: Example[] }) {
  return (
    <section id={meta.slug ?? meta.title.toLowerCase()} className="scroll-mt-20">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-card-foreground">
            {meta.title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card/30 p-6 backdrop-blur-sm">
        <div className="flex flex-wrap gap-6">
          {examples.map((ex) => (
            <ExamplePreview key={ex.name} meta={meta} example={ex} />
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

function ExamplePreview({ meta, example }: { meta: Meta<any>; example: Example }) {
  const rendered = example.render
    ? example.render(example.args)
    : React.createElement(meta.component, example.args as any)

  return (
    <div className="flex flex-col gap-2">
      {rendered}
      <div>
        <p className="text-xs font-medium text-card-foreground">{example.name}</p>
      </div>
    </div>
  )
}
