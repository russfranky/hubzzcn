# Foundations

Hubzz UI uses semantic tokens so component code describes purpose rather than
copying raw colors and measurements across the repository.

## Color

| Token              | Dark value | Purpose                      |
| ------------------ | ---------- | ---------------------------- |
| `background`       | `#181B1F`  | Application background       |
| `card`             | `#24262B`  | Raised surfaces              |
| `accent`           | `#393E44`  | Neutral interactive surface  |
| `foreground`       | `#FCFDFE`  | Primary text and icons       |
| `muted-foreground` | `#7C878E`  | Secondary text               |
| `primary`          | `#735FFA`  | Primary action and selection |
| `destructive`      | `#D92D20`  | Destructive action           |
| `ring`             | `#735FFA`  | Focus indication             |

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
