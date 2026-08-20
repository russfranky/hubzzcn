# Foundations

Hubzz UI uses semantic tokens so component code describes purpose rather than
copying raw colors and measurements across the repository.

## Color

`src/index.css` is the canonical source for light and dark semantic color
values. The generated registry foundation must remain in parity with that
source; documentation should describe roles rather than duplicate raw values.

| Token              | Purpose                      |
| ------------------ | ---------------------------- |
| `background`       | Application background       |
| `card`             | Raised surfaces              |
| `accent`           | Neutral interactive surface  |
| `foreground`       | Primary text and icons       |
| `muted-foreground` | Secondary text               |
| `primary`          | Primary action and selection |
| `destructive`      | Destructive action           |
| `ring`             | Focus indication             |

Component-specific status colors may exist when they communicate semantic
state, but ordinary interaction states should resolve through semantic tokens.

## Typography

- Inter is the default interface typeface.
- Component text should use the shared Tailwind scale before arbitrary values.
- Display typography is reserved for catalog and product display surfaces.
- Text size is not used as the only signal of hierarchy.

## Radius

The system base radius is `0.75rem`.

Use standard shadcn radius utilities first. Pill controls may use a full radius
when their interaction model is genuinely pill-shaped, such as Button or
Capsule.

## Focus and keyboard behavior

Interactive components must expose a visible `focus-visible` state. Custom
Hubzz components should inherit keyboard behavior from upstream primitives
wherever possible rather than recreating it with `div` click handlers.

## Motion

Motion communicates state change, not decoration.

- Prefer color, opacity, and small transform transitions.
- Respect platform reduced-motion behavior.
- Do not make animation a requirement for understanding component state.

## Responsive behavior

Components should size from their container unless the product artifact has a
deliberate fixed contract. Fixed dimensions must be documented as part of the
component API.

## Accessibility baseline

Public components should meet WCAG 2.2 AA expectations for semantics,
keyboard operation, focus visibility, accessible names, and contrast.
Automated axe checks run alongside browser interaction tests, but manual
review remains required for interaction and content semantics.
