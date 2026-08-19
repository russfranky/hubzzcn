import type * as React from "react"

export interface Meta<TComponent extends React.ElementType> {
  title: string
  slug?: string
  navLabel?: string
  component: TComponent
  description: string
  category: "hubzz" | "shadcn"
  notes?: string[]
  composeOnly?: boolean
}

export interface Example<TArgs = Record<string, unknown>> {
  name: string
  args: TArgs
  render?: (args: TArgs) => React.ReactNode
}
