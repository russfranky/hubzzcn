# Hubzz UI design contract

Hubzz UI is a code-owned public design system. The canonical implementation is
the registry source, semantic tokens, component examples, and automated tests
in this repository.

The repository does not publish links to private design working files. Public
consumers should be able to understand the system from code and documentation
alone.

## Source of truth

- Semantic foundations: [`docs/FOUNDATIONS.md`](./docs/FOUNDATIONS.md)
- Component ownership: [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)
- Maintenance rules: [`docs/PRINCIPLES.md`](./docs/PRINCIPLES.md)
- Component examples: `src/examples/`
- Live catalog: `https://hubzz.xyz/cn/`
- Generated API reference: `docs/COMPONENTS.md`

## Change order

When changing UI:

1. Change a semantic token when the requirement is global.
2. Keep the upstream shadcn primitive when its API already fits.
3. Add a supported variant or thin composition when the difference is local.
4. Add custom Hubzz source only when Hubzz owns the structure or interaction.
5. Update the catalog example and public registry item.
6. Run `npm run check` and `npm run test:ui`.

## Definition of done

A public component change is complete when:

- Its public API is explicit and typed.
- Keyboard and focus behavior are inherited from upstream primitives or tested.
- Icon-only actions have accessible names.
- Serious and critical automated WCAG violations are clear.
- The example catalog demonstrates the supported states.
- The registry item declares upstream dependencies rather than copying them.
- The package build and registry validate successfully.
- Breaking changes include migration notes and an appropriate version change.

## Deliberate custom contracts

A small number of Hubzz components have product-specific geometry or behavior
that should not be normalized back to a generic primitive without an explicit
API decision.

- `EventTicket` has a fixed ticket geometry and product-specific state model.
- `Capsule` is a Hubzz filter treatment, but its interaction semantics come
  from the upstream Toggle primitive.
- `ProfileHeader` is a product composition built from upstream Avatar and
  Button primitives.

The goal is not to eliminate custom UI. The goal is to make every custom layer
intentional and visible.
