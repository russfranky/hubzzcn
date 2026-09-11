# Portal source consolidation

The Portal UI from `russfranky/acre-cinder-cloud-branch` is maintained in
`russfranky/hubzzcn` following the owner's 2026-09-11 repository cleanup decision.
Source snapshot:
[`64ddb92395eb08a133c9df19a6e0c5634cdecdbd`](https://github.com/russfranky/acre-cinder-cloud-branch/tree/64ddb92395eb08a133c9df19a6e0c5634cdecdbd).

## Organization

- `src/components/portal/`: rooftop scene, current-space HUD, space cards, and
  discovery navigation composed from shared shadcn primitives.
- `src/lib/portal/`: catalog fixtures, types, scope helpers, and floor search.
- `src/pages/PortalPrototype.tsx`: catalog host, URL state, join callback, and
  the shared Sheet composition.
- `src/pages/portal-scene.css`: scoped decorative rooftop styles using the
  existing Portal semantic tokens.

These are catalog compositions, following the Stage prototype's organization.
They are not new package exports or registry items.

## Reconciliation

| Source behavior                                                                       | Canonical result                                                                                |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Rooftop, skyline, terrace, elevator, hallway door                                     | Adapted into `RooftopScene`; native shared Buttons and Tooltip provide keyboard access.         |
| Current location HUD and join-then-close behavior                                     | Catalog host updates current space, dismisses Sheet, and returns focus to its elevator trigger. |
| Custom Sheet variant and duplicate primitives                                         | Existing shared Sheet, Button, Input, DropdownMenu, and Tooltip are used.                       |
| Numeric floor search                                                                  | Whole floor numbers match hallway and room IDs within the selected scope.                       |
| Old `floor-N`, `room-N-NN`, and rooftop fixture IDs                                   | Existing `hallway-N`, `N-NN`, and `rooftop` IDs remain canonical.                               |
| Older structure chip and expanded mock catalog                                        | Existing Portal / All / attached-room discovery and availability rules remain canonical.        |
| Fixed mock timer                                                                      | Current card says “Here”; no elapsed-time claim is invented.                                    |
| Standalone app framework, server, migrations, generated output, and agent scaffolding | Retained in source history; not required by this client-only catalog prototype.                 |

The source repository remains the historical snapshot. Its archive flag should
be set only after the migration's required checks, merge, and production
deployment are verified. Do not delete its history.

## Interaction contract

All existing routes work: `/cn/portal`, `/portal`, and `/?prototype=portal`.
The panel initially opens and preserves its scope and search in the URL.
Back returns from attached/all scopes to Portal; Back at Portal closes the panel.
Escape dismisses the Sheet. Reopening restores the URL's discovery state.

The host callback remains `onJoinSpace(spaceId, title, path?)`.
The catalog host owns the selected destination and closes after joining.
Under-construction rooms stay unavailable. Mock navigation is not a live
pre-alpha or Xxpanse transport integration.

## Verification

Run `pnpm check` and `pnpm test:ui`. Portal browser coverage includes the existing
URL, count, search, menu, callback, accessibility, and 320px layout cases, plus
Sheet dismissal/focus return, current-space updates, keyboard door activation,
floor search, and the closed rooftop's accessibility.
