# Hubzz UI design source of truth

There is no live design-file export pipeline. **Code is the spec:** tokens in `src/index.css`, component behavior in `src/components/`, and the local catalog at `npm run dev` (`http://localhost:5173/`).

## Canonical tokens

| Role | Hex | CSS variable / Tailwind |
|------|-----|-------------------------|
| Background | `#181B1F` | `--background`, `bg-background` |
| Card / panel | `#24262B` | `--card`, `bg-card` |
| Primary (Hubzz purple) | `#735FFA` | `--primary`, `bg-primary`, `text-hubzz-purple` |
| Muted text | `#7C878E` | `--muted-foreground` |
| Secondary text | `#ACB9C4` | `--secondary-foreground`, `text-hubzz-muted` |
| Control border | `#393E44` | `--input-border`, `border-hubzz-border` |
| Pill / badge hover (UX) | `#2E3238` | `hover:bg-hubzz-pill-hover` |
| Control hover | `#2D3039` | `hover:bg-hubzz-hover` |

Full oklch definitions and comments: `src/index.css` (search for `Hubzz Brand Tokens`).

## How to change UI

1. Edit tokens in `src/index.css` when the change is global.
2. Edit the component under `src/components/` (Hubzz) or `src/components/ui/` (primitives).
3. Update or add an example in `src/examples/*.examples.tsx`.
4. Run `npm run generate:manifest` and commit `docs/COMPONENTS.md`.
5. Verify: `npm run build:preview`, `npm run test:ui`.

## Definition of done (per component)

- [ ] Example renders in the catalog without layout overflow at default viewport.
- [ ] `docs/COMPONENTS.md` lists props and notes (regenerated).
- [ ] Playwright spec exists under `tests/components/` **or** the component is covered by the catalog smoke test.
- [ ] Colors and spacing match this doc and `index.css` (no one-off hex unless documented in example `notes`).

## Intentional deviations from “stock” patterns

Document these in example `meta.notes` — do not “fix” them back without product sign-off.

| Component | Deviation |
|-----------|-----------|
| Capsule | `hover:bg-[#2E3238]` — design spec has no hover; kept for UX |
| EventTicket | Fixed 344×184 layout; SVG clip paths for ticket shape |

## References

| Resource | Purpose |
|----------|---------|
| `README.md` | Project overview and usage |
| `docs/COMPONENTS.md` | API + example args (generated) |
| Catalog (`npm run dev`) | Visual review |
| `npm run test:ui` | Automated checks |

## Out of scope here

- **discord-bot/channel-dashboard** — separate demo app; not the driver for `@hubzz/ui` API.
- External design tools — not used in this repo.
