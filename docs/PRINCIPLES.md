# Component principles

Hubzz UI is upstream-first. The goal is to keep shadcn behavior intact wherever the product can be expressed through it, then spend custom code only on genuinely Hubzz-specific interaction and composition.

## 1. Theme before forking

Prefer design tokens, CVA variants, and size/state styling over copying a primitive into a second component.

If a stock shadcn component already has the right anatomy and accessibility behavior, keep its API and theme it. Button is the reference implementation for this approach.

## 2. Preserve semantic APIs

Keep familiar shadcn concepts such as `variant`, `size`, `asChild`, and native HTML states such as `disabled` while the current Radix base remains in use.

Do not encode transient UI states such as hover, pressed, focus, or disabled as bespoke component props when CSS or native HTML already expresses them.

## 3. Keep the primitive base explicit

Hubzz UI currently uses the Radix-based shadcn implementation. That is an intentional compatibility choice, not an assumption.

The public registry exposes a `registry:base` item so consumers get the same component base and configuration. Do not migrate the primitive base as incidental cleanup. A base migration is a deliberate project with component-by-component verification.

## 4. Three implementation tiers

### Theme-only

These should stay closest to upstream shadcn and primarily differ through Hubzz tokens and variants:

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

## 5. Public component rule

A component belongs in the public system when it is reusable across Hubzz surfaces and does not own product data, authentication, API calls, or application state.

Product code passes data and callbacks in. The component owns presentation, accessible interaction, and reusable local UI behavior.

## 6. Registry rule

Every public registry item must:

- have a clear title and description;
- declare runtime and registry dependencies explicitly;
- keep source files reviewable and free of generated content;
- validate with `shadcn registry validate`;
- use the full GitHub address for same-repository registry dependencies;
- avoid unnecessary dependencies when an upstream shadcn item already provides the behavior.

The complete `hubzz` base is the recommended starting point. Individual items exist for incremental adoption.

## 7. Accessibility is part of the component API

Keyboard operation, focus visibility, semantic HTML, accessible names, disabled behavior, and contrast are acceptance criteria, not optional polish.

Prefer the accessibility behavior already supplied by the underlying primitive. Custom interaction must include equivalent keyboard and screen-reader behavior before it is considered complete.

## 8. Catalog rule

The catalog at `hubzz.xyz/cn/` documents the package and registry that actually exist. Examples demonstrate supported props and states, not one-off mock screens that imply unsupported APIs.

When a design can be represented by an existing shadcn primitive plus Hubzz tokens, add it to the existing primitive rather than creating a parallel Hubzz-named copy.

## 9. Change discipline

Public API changes require tests and documentation. Breaking changes require a versioned release and migration notes. Component refactors should not silently change keyboard behavior, DOM semantics, or registry install paths.
