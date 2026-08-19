# Component principles

Hubzz UI is upstream-first. The goal is to keep shadcn and Radix behavior intact wherever the product can be expressed through them, then spend custom code only on genuinely Hubzz-specific interaction and composition.

## 1. Theme before forking

Prefer design tokens, CVA variants, and size/state styling over copying a primitive into a second component.

If a stock shadcn component already has the right anatomy and accessibility behavior, keep its API and theme it. Button is the reference implementation for this approach.

## 2. Preserve semantic APIs

Keep familiar shadcn concepts such as `variant`, `size`, `asChild`, and native HTML states like `disabled`.

Do not encode transient UI states such as hover, pressed, or disabled as bespoke component props when CSS or native HTML already expresses them.

## 3. Three implementation tiers

### Theme-only

These should stay closest to upstream shadcn/Radix and primarily differ through Hubzz tokens and variants:

- Button
- Badge
- Avatar
- Input
- Label
- Checkbox
- Switch
- Select
- Tabs
- Dialog
- Sheet
- Dropdown Menu
- Separator
- Breadcrumb
- Textarea
- Toggle
- Form primitives

### Thin composition

These combine primitives into a reusable Hubzz pattern but should still delegate behavior to the underlying shadcn components:

- Sidebar
- Form input
- Search box
- Menu item
- Profile header
- Popup header
- Toast presentation
- Top bar

### Custom product UI

These earn custom components because their structure or interaction is specific to Hubzz rather than a themed generic primitive:

- Space card
- Select badge
- Chat input
- Chat item
- Chat bubble
- Reaction item
- Video area
- Capsule
- Event ticket
- Backpack item
- Group merch
- Payment method presentation

## 4. Registry-first distribution

The public GitHub registry is the primary copy-in distribution path.

- Stock shadcn behavior stays upstream and is pulled with `registryDependencies` when possible.
- Hubzz-wide tokens are distributed as the `hubzz-theme` registry item.
- A Hubzz override is published only when tokens alone cannot express the required behavior or geometry.
- Product-specific compositions depend on stock shadcn items instead of vendoring those primitives into the composition.

The package build can coexist for applications that prefer a package dependency, but registry items should remain source-readable and independently installable.

## 5. Public component rule

A component belongs in the public system when it is reusable across Hubzz surfaces and does not own product data, authentication, API calls, or application state.

Product code passes data and callbacks in. The component owns presentation, accessible interaction, and reusable local UI behavior.

## 6. Catalog rule

The catalog at `hubzz.xyz/cn/` documents the public system that actually exists. Examples should demonstrate supported props and states, not one-off mock screens that imply unsupported APIs.

When a design can be represented by an existing shadcn primitive plus Hubzz tokens, add it to the existing primitive rather than creating a parallel Hubzz-named copy.
