# Architecture

Hubzz UI is intentionally shadcn-first. The repository does not fork a
primitive simply to give it a Hubzz name.

## Layers

### 1. Upstream primitives

`src/components/ui/` is the checked-in shadcn/Radix substrate and is the source
of truth for which upstream primitives are present. Do not maintain a parallel
primitive inventory in documentation.

These components should stay structurally close to upstream. Hubzz-specific
changes belong in semantic tokens, supported variants, or a narrowly scoped
override when the product requires different behavior.

`Button` is the primary intentional Hubzz override. It keeps the standard
shadcn API while applying Hubzz sizing, geometry, color, focus, and pressed
states.

### 2. Hubzz components

`src/components/hubzz/` contains reusable UI that has a product-specific
shape or interaction that upstream shadcn does not provide directly.

The current public Hubzz-owned inventory is not duplicated here. It is generated
from `src/examples/` into [`COMPONENTS.md`](./COMPONENTS.md), and CI verifies
that generated reference with `pnpm manifest:check`. Install metadata lives in
`src/components/hubzz/registry.json`.

A new file belongs here only when composing or theming existing primitives is
not enough.

### 3. Catalog-only code

The demo application, pages, and examples are not part of `@hubzz/ui` and are
not installable registry surfaces.

This separation keeps example data, demo navigation, and catalog providers out
of the public component API.

## Distribution

The public GitHub registry is the canonical distribution surface.

`registry.json` and its included registry files are the source of truth for the
public registry graph. CI, release verification, and clean-consumer tests derive
the item set from that graph rather than maintaining separate component lists.

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
