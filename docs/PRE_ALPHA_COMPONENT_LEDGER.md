# Pre-alpha → HubzzCN Component Ledger

This file is the source of truth for translating reusable UI from
`HubzzInc/pre-alpha` into HubzzCN.

It exists to prevent two forms of drift:

1. porting the same product pattern more than once under different names;
2. turning application orchestration into design-system surface area when an
   upstream shadcn/Radix/Lucide primitive already does the job.

Update this ledger in the same pull request whenever a mapping changes.

## Census source

The current overhead census is pinned to:

```text
HubzzInc/pre-alpha@98db19e01239d42ce3876de7d1c7cbcf8966ffac
```

The census covers client UI across:

- `packages/client/src/components/**`
- `packages/client/src/profile-panel/**`
- `packages/client/src/space-cards/**`
- `packages/client/src/shell/**`
- `packages/client/src/routes/**`

`packages/client/src/rtc/**` and other non-visual runtime subsystems are outside
this component ledger unless they later expose a reusable visual contract.

When pre-alpha moves materially, update the pinned commit before approving a new
analog. Do not silently compare different source revisions under one ledger
state.

## Reduction rules

HubzzCN follows an upstream-first, Unix-style component model:

- **One component, one job.** A Hubzz component describes one durable visual or
  interaction contract and accepts data/callbacks from the product.
- **Prefer composition over wrapping.** If ordinary shadcn composition is
  enough, use it directly. Do not create a Hubzz wrapper just to rename an
  upstream primitive.
- **Keep orchestration product-side.** Wallet connections, auth/session state,
  world/Three.js bridges, network calls, storage policy, telemetry, retry loops,
  routing, and feature workflows belong in the application.
- **Own only Hubzz-specific contracts.** A custom registry item is justified by
  durable Hubzz geometry, semantics, behavior, or branding that would otherwise
  be duplicated across independent product areas.
- **Use Lucide before custom icons.** Brand marks and truly product-specific
  symbols may be owned by HubzzCN. General-purpose icon libraries are not.
- **No parallel sources of truth.** Every source surface maps to one outcome:
  upstream, Hubzz analog, product-side, or covered by an existing Hubzz analog.
- **Registry means distributable.** Every Hubzz analog must be exported,
  cataloged, registered, resolved at the exact candidate SHA, installed in the
  clean consumer, and covered by browser/WCAG tests before merge.
- **Reuse must delete complexity.** Two call sites are evidence only when one
  small contract can replace duplicated semantics or geometry without importing
  feature state into the design system.

## Status vocabulary

- **DONE**: mapping is implemented and verified.
- **NEXT**: the next deliberately selected Hubzz analog.
- **CANDIDATE**: reusable pattern worth evaluating, not approved for port yet.
- **UPSTREAM**: use shadcn/Radix/Lucide directly; do not create a Hubzz analog.
- **PRODUCT**: keep the implementation/state machine in application code.
- **COVERED**: an existing HubzzCN component already owns the role.

## Implemented Hubzz analogs

| Source contract                            | HubzzCN owner       | Status      | Boundary                                                                                                           |
| ------------------------------------------ | ------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| profile-panel `hubzz-logo.tsx` square mark | `HubzzLogo`         | **COVERED** | Square Hubzz icon mark only.                                                                                       |
| profile-panel `ui/badge-category.tsx`      | `BadgeCategory`     | **COVERED** | Category/filter tag.                                                                                               |
| profile-panel `ui/capsule.tsx`             | `Capsule`           | **COVERED** | Hubzz toggle/filter pill.                                                                                          |
| profile-panel `ui/toast-banner.tsx`        | `ToastBanner`       | **COVERED** | Semantic compact feedback banner.                                                                                  |
| profile-panel `ui/event-ticket.tsx`        | `EventTicket`       | **COVERED** | Event ticket geometry and states.                                                                                  |
| profile-panel `profile-header.tsx`         | `ProfileHeader`     | **COVERED** | Profile appearance chooser, upstream-composed.                                                                     |
| profile-panel `drone-photo.tsx`            | `DronePhoto`        | **COVERED** | Hubzz in-world capture treatment.                                                                                  |
| onboarding `SelectAvatar.tsx`              | `AvatarPicker`      | **DONE**    | Native radio selection, adaptive density, loading/empty states. Product owns wallet discovery and avatar mutation. |
| onboarding `OnboardingAvatarCarousel`      | `AvatarCarousel`    | **DONE**    | Controlled three-up cyclic avatar chooser. Product owns loading/prefetch and onboarding flow.                      |
| profile/chat presence dots                 | `PresenceIndicator` | **DONE**    | Stateless semantic dot only. Product owns size, halo, border, placement, and presence state.                       |
| world `SpectatorPanel.tsx`                 | `SpectatorBanner`   | **DONE**    | Responsive spectator notice/action surface. Product owns auth/world readiness and reveal timing.                   |

## Upstream and product mappings

| Pre-alpha source                                                                          | Status       | Owner / decision                                                                                                                   |
| ----------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `components/common/Buttons.module.css`                                                    | **COVERED**  | Hubzz `Button` visual override.                                                                                                    |
| `components/common/Modal.module.css`                                                      | **UPSTREAM** | shadcn `Dialog` / `AlertDialog`.                                                                                                   |
| `components/common/Spinner.tsx`                                                           | **UPSTREAM** | `Skeleton` for layout loading, Lucide `LoaderCircle` for operation loading.                                                        |
| onboarding `CloseButton`                                                                  | **UPSTREAM** | `Button` + Lucide `X`.                                                                                                             |
| onboarding `ConfirmClose`                                                                 | **UPSTREAM** | `AlertDialog` + `Button`; product owns cancellation flow and copy.                                                                 |
| onboarding `SubmitButton`                                                                 | **UPSTREAM** | `Button` + status copy/icon; product owns checking/success/error state.                                                            |
| onboarding workflow remainder                                                             | **PRODUCT**  | Validation, avatar manifests, prefetch, connection events, telemetry, timers, and submission remain product-side.                  |
| onboarding `OnboardingIcons.tsx#HubzzLogo` / `onboardingBrandSvg.ts`                      | **PRODUCT**  | This is a 119×36 wordmark, not the square `HubzzLogo`. Current evidence is onboarding-only, so do not create `HubzzWordmark` yet.  |
| Notifications connection-loss state machine                                               | **PRODUCT**  | Connection events and retry history remain application state.                                                                      |
| Notifications/WebGL shared technical overlay                                              | **PRODUCT**  | The two recovery flows already share product-local CSS. A registry abstraction would add indirection without deleting enough code. |
| `WebGLCrashOverlay.tsx` recovery state machine                                            | **PRODUCT**  | Session storage, countdown, reload and world events remain product-side.                                                           |
| world `ScreenContent.tsx`                                                                 | **PRODUCT**  | Three.js/CSS3D bridge, playback state, platform handling and auto-hide behavior are application concerns.                          |
| `NotFound`, `ErrorBoundary`, `Landing`                                                    | **PRODUCT**  | Route/runtime assemblies, not design-system contracts.                                                                             |
| dev editor feature shell and tool workflows                                               | **PRODUCT**  | Editor-specific orchestration stays in product.                                                                                    |
| editor publish/save/upload modals                                                         | **UPSTREAM** | Compose `Dialog`, `Form`, `Input`, `Item`, and `Button`.                                                                           |
| editor `InputNumber`                                                                      | **UPSTREAM** | Native/shadcn numeric input unless a future requirement exceeds it.                                                                |
| editor `SettingsMenu`                                                                     | **UPSTREAM** | `DropdownMenu` / `Popover`.                                                                                                        |
| editor icon bundle and HAIcon line/solid trees                                            | **UPSTREAM** | Lucide. Never bulk-port HAIcon.                                                                                                    |
| profile-panel standard `ui/*` primitives                                                  | **UPSTREAM** | Use shadcn registry primitives directly. Only the Hubzz custom entries listed above are covered by Hubzz analogs.                  |
| profile-panel `ScreenHeader`                                                              | **PRODUCT**  | Reused inside one panel system but carries panel/mobile-close layout assumptions. Compose `Button` + heading in product.           |
| profile-panel `EmptyState`                                                                | **UPSTREAM** | Simple empty-state composition; no durable Hubzz-specific contract.                                                                |
| profile-panel small `space-card.tsx`                                                      | **UPSTREAM** | `Item` + `AvatarGroup` + `Button` composition.                                                                                     |
| profile-panel `spaces/SpaceCard.tsx`                                                      | **PRODUCT**  | Space preview framing, attendance, elapsed time, construction/join state and navigation are feature behavior.                      |
| profile-panel `ProfileCard.tsx` / `GuestDetailScreen.tsx`                                 | **PRODUCT**  | Feature assemblies. Reuse their leaf contracts instead of porting the cards wholesale.                                             |
| profile-panel `full-body-img.tsx`                                                         | **PRODUCT**  | The alpha-shadow figure treatment has one implementation used only inside the profile-card family. Public avatar cards/viewers intentionally use ordinary image treatment, so a registry extraction would add a cross-repo abstraction without deleting independent duplication. |
| profile-panel screens: avatar, badges, friends, news, selfies, settings, spaces, wallets  | **PRODUCT**  | Screen/workflow assemblies. Extract a leaf only after independent reuse is proven.                                                 |
| profile-panel `app-sidebar*`, `profile-panel`, `top-bar`, `nav-user`, `theme-provider`    | **PRODUCT**  | Application shell/panel composition and state.                                                                                     |
| badge image/fallback rendering across profile and chat                                    | **UPSTREAM** | Compose image + `Skeleton` + local fallback text. The shared seam is generic presentation, not a Hubzz registry contract.          |
| `space-cards/components/chat/HubzzLevelBadge.tsx`                                         | **PRODUCT**  | XP-domain component: canonical XP math, level palettes, metadata, selection and detail behavior belong with the product/xp subsystem. |
| profile-panel `MetaChip`-style affordance in space-card chat                              | **COVERED**  | The generic toggle-chip contract is `Capsule`; feature code owns icon/label reveal state.                                          |
| `shell/ShellLayout.tsx`                                                                   | **PRODUCT**  | Correctly composes upstream Sidebar but carries portal and world/sidebar event wiring.                                             |
| `routes/*`                                                                                | **PRODUCT**  | Route assemblies.                                                                                                                  |
| space-card `SpaceHUD`, `SpaceCardsOverlay`, chat display/input, modals and voice settings | **PRODUCT**  | Feature UI and orchestration, not registry atoms.                                                                                  |
| space-card generic image fallback                                                         | **PRODUCT**  | Utility behavior, no Hubzz visual identity.                                                                                        |
| RTC/audio/network subsystem                                                               | **PRODUCT**  | Non-visual runtime, outside this ledger.                                                                                           |

## Completed from current census

### PresenceIndicator

**Status: DONE**

Sources:

- `profile-panel/components/StatusPip.tsx`
- `space-cards/components/chat/StatusIndicator.tsx`

The verified contract owns only:

- `PresenceStatus = "online" | "idle" | "offline"`;
- canonical accessible labels `Online`, `Away`, `Offline`;
- canonical status color treatment;
- a compact 8px default dot with host-controlled `className` geometry.

Product code continues to own:

- absolute positioning;
- profile halo and chat border treatments;
- presence fetching or timers;
- user/profile and chat state;
- panel/card layout.

No size, halo, border, or placement variant API was added.

## Candidate review closure

### FullBodyAvatar treatment

**Decision: PRODUCT**

Evidence:

- `full-body-img.tsx` is the only implementation of the `--fb-src` alpha-shadow
  technique;
- its consumers are `ProfileCard` and `GuestDetailScreen`, two views in the
  same profile-card visual family;
- the public avatar viewer and avatar cards intentionally use ordinary
  `object-contain` / `object-cover` image treatment instead;
- the imagery reference documents the shadow as profile-panel behavior and does
  not identify another product area that duplicates it.

Keep the treatment beside the profile-card family. Revisit only if another
independent product surface adopts the same alpha-shadow figure contract.

### Badge visual contract

**Decision: no HubzzCN component**

Evidence:

- the common image-or-fallback seam is generic enough to compose from an image,
  `Skeleton`, and local fallback text;
- `BadgeArt` additionally special-cases the synthetic Hubzz level badge;
- `HubzzLevelBadge` owns XP math from `@hubzz/xp`, level-dependent palettes,
  metadata, selection behavior, and detail/modal presentation;
- collapsing these paths into one registry API would either produce a trivial
  image wrapper or import XP/business behavior into the design system.

Keep the generic art fallback local/upstream-composed and keep Hubzz level
behavior with the XP/product subsystem.

## Current Hubzz-owned analog set

- `HubzzLogo`
- `BadgeCategory`
- `Capsule`
- `ToastBanner`
- `EventTicket`
- `ProfileHeader`
- `DronePhoto`
- `AvatarPicker`
- `AvatarCarousel`
- `PresenceIndicator`
- `SpectatorBanner`

A new name is added only after this ledger first records why upstream
composition is insufficient.

## Work order

There is no approved NEXT or CANDIDATE component at the pinned census revision.

1. Stop extraction work at this boundary.
2. Update the pinned pre-alpha SHA when the product UI moves materially.
3. Re-census new or changed UI for independent duplication before approving any
   additional HubzzCN analog.
4. Prefer deleting or composing product-local wrappers over growing the registry.

The desired end state is not parity by component count. It is the smallest
stable Hubzz-owned layer that lets product code express the current experience
without copying Hubzz-specific semantics, geometry, or interaction rules.
