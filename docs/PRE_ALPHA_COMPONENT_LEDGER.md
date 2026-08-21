# Pre-alpha → HubzzCN Component Ledger

This file is the source of truth for translating reusable UI from
`HubzzInc/pre-alpha` into HubzzCN.

Its purpose is to prevent two kinds of drift:

1. porting the same product pattern more than once under different names;
2. turning application orchestration into design-system surface area when an
   upstream shadcn/Radix/Lucide primitive already does the job.

Update this ledger in the same pull request whenever a mapping changes.

## Reduction rules

HubzzCN follows an upstream-first, Unix-style component model:

- **One component, one job.** A Hubzz component should describe one visual or
  interaction contract and accept data/callbacks from the product.
- **Prefer composition over wrapping.** If ordinary shadcn composition is
  enough, use it directly. Do not create a Hubzz wrapper just to rename an
  upstream primitive.
- **Keep orchestration product-side.** Wallet connections, auth/session state,
  world/Three.js bridges, network calls, storage policy, telemetry, retry loops,
  and feature workflows belong in the application.
- **Own only Hubzz-specific contracts.** A custom registry item is justified by
  durable Hubzz geometry, semantics, behavior, or brand treatment that would
  otherwise be duplicated across product code.
- **Use Lucide before custom icons.** Brand marks and truly product-specific
  symbols may be owned by HubzzCN. General-purpose icon libraries are not.
- **No parallel sources of truth.** Each pre-alpha surface maps to exactly one
  outcome below: upstream, Hubzz analog, product-side, or retired/covered.
- **Registry means distributable.** Every Hubzz analog must be exported,
  cataloged, registered, resolved at the exact candidate SHA, installed in the
  clean consumer, and covered by browser/WCAG tests before merge.

## Status vocabulary

- **DONE**: mapping is implemented and verified.
- **NEXT**: the next deliberately selected Hubzz analog.
- **CANDIDATE**: reusable pattern worth evaluating, not approved for port yet.
- **UPSTREAM**: use shadcn/Radix/Lucide directly; do not create a Hubzz analog.
- **PRODUCT**: keep the implementation/state machine in application code.
- **COVERED**: an existing HubzzCN component already owns the role.

## Mapping ledger

| Pre-alpha source                                                                                    | Responsibility                                                                        | Disposition                      | HubzzCN / upstream owner                            | Status       | Required proof / notes                                                                                                                                                                 |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/common/Buttons.module.css`                                                              | generic buttons                                                                       | covered by Hubzz visual override | `Button`                                            | **COVERED**  | Do not recreate CSS button classes.                                                                                                                                                    |
| `components/common/Modal.module.css`                                                                | modal shell/backdrop                                                                  | upstream primitive               | shadcn `Dialog` / `AlertDialog` as appropriate      | **UPSTREAM** | Product composes content and actions.                                                                                                                                                  |
| `components/common/Spinner.tsx`                                                                     | loading indicator                                                                     | upstream/icon-level behavior     | `Skeleton` or Lucide `LoaderCircle`                 | **UPSTREAM** | Pick based on whether layout or operation is loading.                                                                                                                                  |
| `components/game/onboarding/SelectAvatar.tsx`                                                       | avatar list selection view                                                            | Hubzz analog                     | `AvatarPicker`                                      | **DONE**     | Native radios, arrow-key selection, adaptive 3/10+ density thresholds, loading/empty states, registry + clean consumer + browser/WCAG. Product keeps wallet discovery and `setAvatar`. |
| `components/game/onboarding/Onboarding.tsx#OnboardingAvatarCarousel`                                | cyclic previous/current/next avatar chooser                                           | Hubzz analog                     | `AvatarCarousel`                                    | **NEXT**     | Preserve 3-up geometry, cyclic previous/next behavior, selected-avatar announcement, responsive sizing. Product supplies avatar data and selected index.                               |
| `components/game/onboarding/Onboarding.tsx#CloseButton`                                             | icon close action                                                                     | upstream composition             | `Button` with icon sizing + Lucide `X`              | **UPSTREAM** | No dedicated Hubzz close component.                                                                                                                                                    |
| `components/game/onboarding/Onboarding.tsx#ConfirmClose`                                            | destructive confirmation                                                              | upstream composition             | shadcn `AlertDialog` + `Button`                     | **UPSTREAM** | Product owns copy and cancellation flow.                                                                                                                                               |
| `components/game/onboarding/Onboarding.tsx#SubmitButton`                                            | async submit state presentation                                                       | direct composition               | `Button` + status copy/icon                         | **UPSTREAM** | Keep checking/success/error state machine in product. Add a Hubzz analog only if a second independent feature proves the same contract.                                                |
| `components/game/onboarding/Onboarding.tsx` remainder                                               | onboarding workflow, validation, avatar loading/prefetch, submission, telemetry       | application orchestration        | pre-alpha/product                                   | **PRODUCT**  | Do not port Sentry, connection events, manifest fetching, validation, or timers into HubzzCN.                                                                                          |
| `components/game/onboarding/OnboardingIcons.tsx#HubzzLogo`                                          | Hubzz brand mark                                                                      | covered                          | `HubzzLogo`                                         | **COVERED**  | Check/close glyphs use Lucide.                                                                                                                                                         |
| `components/game/world/SpectatorPanel.tsx`                                                          | spectator notice/action surface                                                       | Hubzz analog                     | `SpectatorBanner`                                   | **DONE**     | Responsive pill/stacked geometry, 12px mobile radius, brand/action composition, registry + clean consumer + browser/WCAG. Product keeps auth/world readiness and reveal timing.        |
| `components/game/Notifications.tsx`                                                                 | connection-loss state machine and retry notices                                       | product orchestration            | pre-alpha/product                                   | **PRODUCT**  | Connection events and retry message history remain application code.                                                                                                                   |
| `components/game/Notifications.module.css#disconnectOverlay` + `WebGLCrashOverlay.tsx` visual layer | full-screen technical status/terminal treatment shared by connection and GPU recovery | shared product-local view        | pre-alpha/product                                   | **PRODUCT**  | Reuse audit found only the two recovery flows, which already share `Notifications.module.css`. A cross-repo `SystemStatusOverlay` would add indirection without deleting enough code.  |
| `components/game/WebGLCrashOverlay.tsx` state machine                                               | WebGL recovery, reload guard, countdown                                               | application orchestration        | pre-alpha/product                                   | **PRODUCT**  | Session storage and world events stay product-side.                                                                                                                                    |
| `components/game/world/screen/ScreenContent.tsx`                                                    | Three.js/CSS3D media bridge and in-world playback controls                            | application feature              | pre-alpha/product                                   | **PRODUCT**  | Window-event bridge, CSS3D reparenting, auto-hide and platform detection are product behavior. Reuse `Button`, tooltip, slider, icons directly when refactoring product code.          |
| `components/NotFound.tsx` + `NotFound.css`                                                          | route-level not-found page                                                            | application assembly             | shadcn `Card`/`Button` as needed                    | **PRODUCT**  | A page is not a design-system component.                                                                                                                                               |
| `components/ErrorBoundary.tsx`                                                                      | React error boundary/infrastructure                                                   | application infrastructure       | pre-alpha/product                                   | **PRODUCT**  | Error boundaries carry runtime policy, not reusable visual identity.                                                                                                                   |
| `components/Landing.tsx`                                                                            | route/page assembly                                                                   | application feature              | pre-alpha/product                                   | **PRODUCT**  | No design-system port.                                                                                                                                                                 |
| `components/dev/LightEditorV2.tsx`                                                                  | editor feature shell                                                                  | application feature              | pre-alpha/product                                   | **PRODUCT**  | Decompose only proven repeated visual contracts, not the editor itself.                                                                                                                |
| `components/dev/editor/EditorPublishModal.tsx`                                                      | publish workflow dialog                                                               | upstream composition             | `Dialog`, `Form`, `Input`, `Button`                 | **UPSTREAM** | Workflow stays product-side.                                                                                                                                                           |
| `components/dev/editor/EditorSaveLoadModal.tsx`                                                     | save/load workflow dialog                                                             | upstream composition             | `Dialog`, `Item`, `Button`                          | **UPSTREAM** | No Hubzz wrapper without reuse evidence.                                                                                                                                               |
| `components/dev/editor/EditorUploadModal.tsx`                                                       | upload workflow dialog                                                                | upstream composition             | `Dialog`, `Input`, `Button`                         | **UPSTREAM** | File handling remains product-side.                                                                                                                                                    |
| `components/dev/editor/EditorTools.tsx`                                                             | editor tool orchestration                                                             | application feature              | shadcn controls composed in product                 | **PRODUCT**  | Tool state is editor-specific.                                                                                                                                                         |
| `components/dev/editor/components/InputNumber.tsx`                                                  | numeric input                                                                         | upstream input                   | `Input type="number"` or upstream field composition | **UPSTREAM** | Do not preserve a bespoke numeric wrapper unless product requirements exceed native/shadcn behavior.                                                                                   |
| `components/dev/editor/components/AssetList.tsx`                                                    | editor asset list                                                                     | feature-specific list            | `Item` / scrolling composition in product           | **PRODUCT**  | Revisit only if the same asset-row contract appears outside editor.                                                                                                                    |
| `components/dev/editor/components/TextureList.tsx`                                                  | editor texture list                                                                   | feature-specific list            | `Item` / scrolling composition in product           | **PRODUCT**  | Same rule as `AssetList`.                                                                                                                                                              |
| `components/dev/editor/components/SettingsMenu.tsx`                                                 | editor settings menu                                                                  | upstream menu composition        | `DropdownMenu` / `Popover` as appropriate           | **UPSTREAM** | Editor owns settings state.                                                                                                                                                            |
| `components/dev/editor/components/Icons.tsx`                                                        | large custom editor icon bundle                                                       | upstream icon library            | Lucide                                              | **UPSTREAM** | Migrate individual missing product-specific symbols only after proving Lucide lacks an acceptable analog.                                                                              |
| `components/haicon/line/*` + `components/haicon/solid/*`                                            | general icon library                                                                  | upstream icon library            | Lucide                                              | **UPSTREAM** | Never bulk-port HAIcon into HubzzCN.                                                                                                                                                   |

## Current Hubzz-owned analog set

These are the components intentionally owned by HubzzCN rather than by
upstream shadcn:

- `HubzzLogo`
- `BadgeCategory`
- `Capsule`
- `ToastBanner`
- `EventTicket`
- `ProfileHeader`
- `DronePhoto`
- `AvatarPicker`
- `SpectatorBanner`
- `AvatarCarousel` (**NEXT**, verification in progress)

A new name should not be added to this list until the ledger first shows why
upstream composition is insufficient.

## Work order

1. **AvatarCarousel**: finish registry, clean-consumer, browser/WCAG, and CodeQL
   verification.
2. Stop. There is no approved speculative analog after `AvatarCarousel`.
3. Re-scan pre-alpha only when new repeated product UI creates evidence for a
   smaller shared contract. Do not port editor, screen, or recovery assemblies
   by momentum.

The desired end state is not parity by component count. It is the smallest
stable Hubzz-owned layer that lets product code express the current experience
without copying Hubzz-specific geometry or interaction rules.
