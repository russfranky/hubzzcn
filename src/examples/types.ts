import type * as React from "react"

export type ComponentLayer = "override" | "component" | "pattern"

export interface Meta<TComponent extends React.ElementType> {
  title: string
  slug?: string
  navLabel?: string
  component: TComponent
  description: string
  category: "hubzz" | "shadcn"
  layer?: ComponentLayer
  notes?: string[]
  composeOnly?: boolean
}

export interface Example<TArgs = Record<string, unknown>> {
  name: string
  args: TArgs
  render?: (args: TArgs) => React.ReactNode
}
