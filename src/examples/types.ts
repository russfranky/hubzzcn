import type * as React from "react"

export interface Meta<TComponent extends React.ComponentType<any>> {
  /** Component display name shown in the catalog and manifest. */
  title: string
  /** URL anchor for this section. Defaults to title.toLowerCase().
   *  Override when title.toLowerCase() doesn't match the desired anchor
   *  (e.g. title="EventTicket" → slug="tickets" to preserve the existing #tickets link). */
  slug?: string
  /** Short label for navigation links. Defaults to title when omitted.
   *  Use when title is CamelCase and you want a human-readable nav label. */
  navLabel?: string
  /** Direct reference to the React component. Catalog renders <component {...args} />. */
  component: TComponent
  /** One or two sentences describing purpose and key constraints. Fed into COMPONENTS.md. */
  description: string
  /** "hubzz" for Hubzz-branded components, "shadcn" for stock overrides. */
  category: "hubzz" | "shadcn"
  /** Usage rules shown in the catalog and written into the manifest as-is.
   *  Write these for consumers and maintainers; they are the primary guidance surface. */
  notes?: string[]
  /** Catalog composition only — not exported from @hubzz/ui. Changes COMPONENTS.md import line. */
  composeOnly?: boolean
}

export interface Example<TArgs = Record<string, unknown>> {
  /** Short display name shown under the rendered example. */
  name: string
  /** Props passed to the component. Also serialized into the manifest as usage examples. */
  args: TArgs
  /** Custom render function for cases where args alone can't express the example
   *  (e.g. a row of Capsules, a ToastBanner with long text). Optional. */
  render?: (args: TArgs) => React.ReactNode
}
