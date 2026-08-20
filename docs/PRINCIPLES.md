# Component principles

Hubzz UI is upstream-first. The system keeps shadcn behavior intact wherever
the product can be expressed through it, then spends custom code only on
genuinely Hubzz-specific structure and interaction.

## 1. Theme before forking

Prefer semantic tokens and supported variants over creating a second component
with the same anatomy.

If a stock shadcn component already has the right behavior and accessibility,
keep its API and theme it. Button is the reference Hubzz override.

## 2. Preserve semantic APIs

Keep familiar shadcn concepts such as `variant`, `size`, `asChild`, and native
HTML states such as `disabled`.

Do not model hover, focus, pressed, or disabled as custom visual props when
CSS, ARIA, or the underlying primitive already expresses them.

## 3. Keep the primitive base explicit

Hubzz UI intentionally uses the Radix-based shadcn implementation.

The public `registry:base` item pins that choice so a future shadcn default
cannot silently change the component substrate. A base migration requires
component-by-component review.

## 4. Use three implementation strategies

### Upstream or theme-only

These stay structurally close to shadcn and are not re-published as parallel
Hubzz components:

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

### Hubzz override

An override keeps the upstream public contract and changes a deliberately
small layer.

Current override:

- Button

### Hubzz composition or custom component

A Hubzz-owned component must add reusable product value that is not already an
upstream primitive.

Current public components:

- HubzzLogo
- BadgeCategory
- Capsule
- ToastBanner
- EventTicket
- ProfileHeader
- DronePhoto

The exact ownership and upstream dependencies are documented in
`docs/ARCHITECTURE.md`.

## 5. Public component rule

A component belongs in the public system when it is reusable across Hubzz
surfaces and does not own product data, authentication, API calls, or
application state.

Consumers pass data and callbacks in. The component owns presentation,
accessible interaction, and reusable local behavior.

## 6. Registry rule

Every public registry item must:

- have a clear title and description;
- declare runtime and registry dependencies explicitly;
- use upstream shadcn registry dependencies instead of copied primitives;
- keep source files reviewable and free of generated content;
- validate with `shadcn registry validate`;
- resolve successfully from the public repository at the tested commit.

The `hubzz` base is the recommended foundation. Individual items exist for
incremental adoption.

## 7. Accessibility is part of the API

Keyboard operation, focus visibility, semantic HTML, accessible names,
disabled behavior, and contrast are acceptance criteria.

Prefer the behavior supplied by the underlying primitive. Custom interaction
must provide equivalent semantics before it is considered complete.

## 8. Catalog rule

The catalog at `hubzz.xyz/cn/` documents the registry and package surfaces that
actually exist.

It explicitly separates:

- foundations;
- upstream primitives;
- Hubzz overrides;
- Hubzz components;
- reusable patterns.

The catalog should not imply that Hubzz owns an upstream component merely
because the product uses it.

## 9. Change discipline

Public API changes require tests and documentation. Breaking changes require a
versioned release and migration notes. Refactors must not silently change
keyboard behavior, DOM semantics, registry install paths, or package exports.
