# Architecture

Hubzz UI is intentionally shadcn-first. The repository does not fork a
primitive simply to give it a Hubzz name.

## Layers

### 1. Upstream primitives

`src/components/ui/` is the shadcn/Radix substrate.

These components should stay structurally close to upstream. Hubzz-specific
changes belong in semantic tokens, supported variants, or a narrowly scoped
override when the product requires different behavior.

Current upstream-first primitives include:

- Alert
- Avatar
- Badge
- Breadcrumb
- Card
- Checkbox
- Collapsible
- Dialog
- Dropdown Menu
- Form
- Input
- Item
- Label
- Select
- Separator
- Sheet
- Sidebar
- Skeleton
- Sonner
- Switch
- Tabs
- Textarea
- Toggle
- Tooltip

`Button` is the primary intentional Hubzz override. It keeps the standard
shadcn API while applying Hubzz sizing, geometry, color, focus, and pressed
states.

### 2. Hubzz components

`src/components/hubzz/` contains reusable UI that has a product-specific
shape or interaction that upstream shadcn does not provide directly.

Current public Hubzz components:

| Component     | Strategy            | Upstream dependencies |
| ------------- | ------------------- | --------------------- |
| HubzzLogo     | Custom brand asset  | None                  |
| BadgeCategory | Thin composition    | Button                |
| Capsule       | Thin composition    | Toggle                |
| ToastBanner   | Thin composition    | Button                |
| EventTicket   | Custom component    | Button, Skeleton      |
| ProfileHeader | Product composition | Avatar, Button        |
| DronePhoto    | Product component   | None                  |

A new file belongs here only when composing or theming existing primitives is
not enough.

### 3. Catalog-only code

The demo application, pages, and examples are not part of `@hubzz/ui` and are
not installable registry surfaces.

This separation keeps example data, demo navigation, and catalog providers out
of the public component API.

## Distribution

The public GitHub registry is the canonical distribution surface.

- `registry:base` installs the Hubzz shadcn base.
- `registry:theme` applies Hubzz tokens to an existing shadcn project.
- Upstream primitives are referenced by their shadcn item names instead of
  copied into the Hubzz registry.
- Hubzz-owned components are installable individually from this repository.

The package build exists for release artifacts and consumers that prefer a
compiled library, but registry source remains the clearest representation of
component ownership.

## Ownership test

Before adding a component, answer these questions in order:

1. Does shadcn already provide the behavior?
2. Can Hubzz achieve the design with tokens?
3. Can an existing primitive accept a supported variant?
4. Can the UI be a thin composition of existing primitives?
5. Only then, does Hubzz need custom source?

That order is part of the public API policy, not a suggestion.
