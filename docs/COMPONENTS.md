# @hubzz/ui Component Reference

> Auto-generated from `src/examples/`. Do not edit manually. Run `pnpm generate:manifest`.

## Button

Upstream shadcn Button contract with Hubzz geometry, color, focus, and pressed-state treatment.

**Layer:** override

**Import:** `import { Button } from "@hubzz/ui"`

### Examples

| Name           | Description | Key Props                                   |
| -------------- | ----------- | ------------------------------------------- |
| Primary        |             | `children="Continue"`                       |
| Primary + icon |             | `children="Share"`                          |
| Secondary      |             | `children="Cancel"` `variant="secondary"`   |
| Outline        |             | `children="Details"` `variant="outline"`    |
| Destructive    |             | `children="Delete"` `variant="destructive"` |
| Disabled       |             | `children="Unavailable"` `disabled=true`    |
| Small          |             | `children="Small"` `size="sm"`              |
| Large          |             | `children="Large"` `size="lg"`              |
| Icon only      |             | `aria-label="Share"` `size="icon"`          |

### Notes

- Keeps the shadcn variant, size, disabled, and asChild API.
- Use the native disabled attribute instead of a visual disabled variant.
- Prefer this override instead of creating one-off action components.

---

## HubzzLogo

Hubzz mark that inherits the surrounding semantic text color by default.

**Layer:** component

**Import:** `import { HubzzLogo } from "@hubzz/ui"`

### Examples

| Name            | Description | Key Props                   |
| --------------- | ----------- | --------------------------- |
| Current color   |             | `variant="light"` `size=40` |
| Decorative icon |             | `variant="icon"` `size=32`  |
| White mark      |             | `variant="dark"` `size=40`  |

### Notes

- Prefer the default icon variant so host surfaces own color through currentColor.
- Provide title when the mark conveys identity; omit it when the mark is decorative.
- The legacy purple and dark variants remain white-mark compatibility modes and do not define a brand color.

---

## EventTicket

Fixed-size Hubzz event artifact with ready, upcoming, joined, past, and loading states.

**Layer:** component

**Import:** `import { EventTicket } from "@hubzz/ui"`

### Examples

| Name          | Description | Key Props                                                                                       |
| ------------- | ----------- | ----------------------------------------------------------------------------------------------- |
| Ready to join |             | `ticketNumber="#00001/03123"` `state="ready"`                                                   |
| Upcoming      |             | `ticketNumber="#00001/03123"` `state="upcoming"` `countdown={"days":1,"hours":10,"minutes":12}` |
| Joined        |             | `ticketNumber="#00001/03123"` `state="joined"`                                                  |
| Past          |             | `ticketNumber="#00001/03123"` `state="past"`                                                    |
| Long title    |             | `state="joined"` `ticketNumber="#RESERVATION/2024/00001/XTRA"`                                  |
| Loading       |             | `loading=true`                                                                                  |

### Notes

- The 344×184 geometry is part of the public component contract.
- Use loading=true while event data is unresolved.
- Host and space become links when href props are provided.
- The component delegates actions to Button and loading treatment to Skeleton.

---

## BadgeCategory

Hubzz category tag composed from the Button override for optional removal.

**Layer:** component

**Import:** `import { BadgeCategory } from "@hubzz/ui"`

### Examples

| Name               | Description | Key Props                                         |
| ------------------ | ----------- | ------------------------------------------------- |
| Default            |             | `children="Networking"` `emoji="🤝"`              |
| Active             |             | `children="Gaming"` `emoji="🎮"` `state="active"` |
| Default (Music)    |             | `children="Music"` `emoji="🎵"`                   |
| Hover (controlled) |             | `children="Fitness"` `emoji="🏋️"` `state="hover"` |
| Static             |             | `children="Technology"` `emoji="💻"`              |

### Notes

- Use for category and filter labels, not general action buttons.
- onRemove adds an accessible remove action; omit it for a static tag.
- The explicit state prop exists for controlled preview/state surfaces; ordinary hover remains CSS-driven.

---

## Capsule

Hubzz filter pill that delegates pressed semantics and keyboard behavior to the upstream Toggle primitive.

**Layer:** component

**Import:** `import { Capsule } from "@hubzz/ui"`

### Examples

| Name                  | Description | Key Props                              |
| --------------------- | ----------- | -------------------------------------- |
| Active — Music        |             | `active=true` `children="Music"`       |
| Active — Gaming       |             | `active=true` `children="Gaming"`      |
| Inactive — Art        |             | `active=false` `children="Art"`        |
| Inactive — Sports     |             | `active=false` `children="Sports"`     |
| Inactive — Technology |             | `active=false` `children="Technology"` |

### Notes

- Use for filters and selections, not primary actions.
- active maps to Toggle pressed state and therefore exposes aria-pressed semantics.
- Use onActiveChange when the consumer owns the selected state.

---

## ToastBanner

Compact Hubzz status banner with neutral, info, success, warning, and error treatments.

**Layer:** component

**Import:** `import { ToastBanner } from "@hubzz/ui"`

### Examples

| Name    | Description | Key Props                                                          |
| ------- | ----------- | ------------------------------------------------------------------ |
| Neutral |             | `type="neutral"` `children="Your changes have been saved"`         |
| Info    |             | `type="blue"` `children="New update available — refresh to apply"` |
| Success |             | `type="success"` `children="Successfully joined the event"`        |
| Warning |             | `type="warning"` `children="Event starts in 10 minutes"`           |
| Error   |             | `type="error"` `children="Failed to connect to the space"`         |

### Notes

- Error uses alert semantics; other variants use status semantics.
- Provide onDismiss when the message can be dismissed.
- dismissLabel customizes the accessible name when the surrounding context requires more specificity.

---

## ProfileHeader

Profile appearance pattern composed from upstream Avatar and the Hubzz Button override.

**Layer:** pattern

**Import:** `import { ProfileHeader } from "@hubzz/ui"`

### Examples

| Name       | Description | Key Props                                                                             |
| ---------- | ----------- | ------------------------------------------------------------------------------------- |
| Default    |             | `heroImage="/favicon.svg"` `heroImageAlt="Hubzz profile preview"` `avatars=[4 items]` |
| No preview |             | `avatars=[2 items]`                                                                   |

### Notes

- Consumers own avatar data and selection state.
- No network-backed demo avatars are embedded in the component.
- Icon-only controls expose accessible labels and avatar choices expose pressed state.

---

## DronePhoto

Responsive media treatment for in-world captures with optional timestamp and location metadata.

**Layer:** component

**Import:** `import { DronePhoto } from "@hubzz/ui"`

### Examples

| Name          | Description | Key Props                                                                                                                                |
| ------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| With metadata |             | `imageUrl="/favicon.svg"` `alt="Hubzz drone capture placeholder"` `timestamp="06/13/24 11:12 UTC"` `locationUrl="hubzz.xyz/0,0/8,13/-1"` |

### Notes

- Pass meaningful alt text when the image communicates content.
- Metadata is rendered as a figure caption rather than a decorative overlay only.
- The component owns presentation only; capture and upload behavior stays in the product.

---

## AvatarPicker

Hubzz avatar selection surface derived from the pre-alpha wallet avatar picker.

**Layer:** component

**Import:** `import { AvatarPicker } from "@hubzz/ui"`

### Examples

| Name             | Description | Key Props                                                                 |
| ---------------- | ----------- | ------------------------------------------------------------------------- |
| Wallet selection |             | `items=[3 items]` `value="nova"`                                          |
| Large collection |             | `items=[12 items]` `value="avatar-3"`                                     |
| Loading          |             | `items=[0 items]` `loading=true` `density="medium"`                       |
| Empty            |             | `items=[0 items]` `emptyMessage="No avatars found in connected wallets."` |

### Notes

- Pass avatar data and selection callbacks; wallet and session orchestration stay in product code.
- Auto density follows the pre-alpha collection thresholds: large through 3 items, medium through 10, then small.
- Selection is exposed with radiogroup semantics for keyboard and assistive-technology compatibility.

---

## AvatarCarousel

Controlled three-up Hubzz avatar carousel derived from the pre-alpha onboarding chooser.

**Layer:** component

**Import:** `import { AvatarCarousel } from "@hubzz/ui"`

### Examples

| Name          | Description | Key Props                        |
| ------------- | ----------- | -------------------------------- |
| Default       |             | `items=[5 items]` `value="nova"` |
| Single avatar |             | `items=[1 item]` `value="nova"`  |

### Notes

- Product code owns avatar loading, prefetching, validation, and onboarding state.
- The component owns only cyclic previous/current/next navigation and the three-up Hubzz geometry.
- The selected avatar is announced as a carousel slide; side avatars are decorative context.

---

## PresenceIndicator

Stateless Hubzz presence dot that centralizes online, away, and offline semantics across product surfaces.

**Layer:** component

**Import:** `import { PresenceIndicator } from "@hubzz/ui"`

### Examples

| Name         | Description | Key Props                                                              |
| ------------ | ----------- | ---------------------------------------------------------------------- |
| Online       |             | `status="online"`                                                      |
| All statuses |             | `status="online"`                                                      |
| Host sized   |             | `status="idle"` `className="size-3"` `aria-label="Away from keyboard"` |

### Notes

- Host code owns positioning, halo, border, and presence state.
- Use className to size the dot for the local surface instead of adding size variants.
- The component supplies the canonical accessible label unless aria-label is overridden.

---

## SpectatorBanner

Responsive Hubzz spectator-mode notice matched to the pre-alpha world SpectatorPanel.

**Layer:** pattern

**Import:** `import { SpectatorBanner } from "@hubzz/ui"`

### Examples

| Name    | Description | Key Props |
| ------- | ----------- | --------- |
| Default |             | —         |

### Notes

- Visual surface matches pre-alpha SpectatorPanel.module.css (charcoal pill, white mark, gradient CTA).
- Catalog demos stay inline so the panel stays in document flow. Product code can pass placement="overlay" for world positioning (bottom 10vh).
- Authentication and world-readiness timing stay in product code; the banner owns only the visual/action surface.
- Default mark is HubzzLogo without a light tile wrapper; the action is the product gradient pill.

---

## EngagementPoints

Interactive Hubzz engagement points dashboard built from shadcn kit primitives — balance, season chart, earn ways, and activity history.

**Layer:** component

**Import:** `import { EngagementPoints } from "@hubzz/ui"`

### Examples

| Name      | Description | Key Props |
| --------- | ----------- | --------- |
| Dashboard |             | —         |

### Notes

- Catalog demo uses the kit primitives version (same UI as ?prototype=points-kit).
- The Figma-port prototype remains at ?prototype=points and is unchanged.
- Host surfaces own dark shell chrome; the component renders the dashboard body.

---

## Toggle

Hubzz on/off switch from pre-alpha space-cards settings ToggleSwitch — purple track when on, charcoal when off.

**Layer:** component

**Import:** `import { Toggle } from "@hubzz/ui"`

### Examples

| Name           | Description | Key Props                                                          |
| -------------- | ----------- | ------------------------------------------------------------------ |
| On             |             | `checked=true` `aria-label="Notifications on"`                     |
| Off            |             | `checked=false` `aria-label="Notifications off"`                   |
| In setting row |             | `checked=true` `aria-label="Noise suppression"`                    |
| Disabled       |             | `checked=false` `disabled=true` `aria-label="Unavailable setting"` |

### Notes

- Source of truth: packages/client/src/space-cards/components/spaces/settings-shared.tsx (ToggleSwitch).
- Figma UI Elements file hlotzpup9k4CnwhskBVroL had no Toggle component page at port time; product ToggleSwitch was used.
- Not the upstream shadcn Switch/Toggle primitives — this is the Hubzz settings/audio/drone control leaf.
- Host code owns labels and setting rows; this leaf owns track/knob geometry and role=switch semantics.

## MerchModal

Digital Merch store modal: banner, store identity, XP item carousel, and balance bar, ported from the Figma Make Digital Merch Modal project.

**Layer:** component

**Import:** `import { MerchModal } from "@hubzz/ui"`

### Examples

| Name    | Description | Key Props                         |
| ------- | ----------- | --------------------------------- |
| Default |             | `triggerLabel="Open Merch Store"` |

### Notes

- Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/MerchModal.tsx.
- Shell and colors are hubzzcn Dialog and semantic tokens; only the item card artwork gradients keep the source pastel values.
- Balance and purchase state are internal, seeded by initialBalance; purchases report through onPurchase; a bought item reads Owned and unaffordable items disable.
- Cover and avatar are host-supplied image props; without them the modal renders the primary gradient.

---

## BuyItemModal

Buy Item purchase confirmation: item, cost, current and new balance, ported from the Figma Make Digital Merch Modal project.

**Layer:** component

**Import:** `import { BuyItemModal } from "@hubzz/ui"`

### Examples

| Name    | Description | Key Props                 |
| ------- | ----------- | ------------------------- |
| Default |             | `triggerLabel="Buy Item"` |

### Notes

- Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/BuyItemModal.tsx.
- The source card is fixed white; here the card is the Dialog popover surface, so it follows the hubzzcn light and dark themes.
- New balance is computed from balance and cost. The coin mark uses the warning token.
- Item image is a host-supplied prop; without one the tile shows a coin icon.

---

## HBXModal

'What is HBX?' explainer modal with Unlock perks and Collect moments cards, ported from the Figma Make Digital Merch Modal project.

**Layer:** component

**Import:** `import { HBXModal } from "@hubzz/ui"`

### Examples

| Name    | Description | Key Props                     |
| ------- | ----------- | ----------------------------- |
| Default |             | `triggerLabel="What is HBX?"` |

### Notes

- Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/HBXModal.tsx.
- Copy is the Figma source copy. Shell and colors are hubzzcn Dialog and semantic tokens.
- Card actions report through onGoToQuests and onViewStubs; the source buttons were inert.

---

## ManageChannelModal

Manage group menu modal with six channel administration rows, ported from the Figma Make Digital Merch Modal project.

**Layer:** component

**Import:** `import { ManageChannelModal } from "@hubzz/ui"`

### Examples

| Name    | Description | Key Props                       |
| ------- | ----------- | ------------------------------- |
| Default |             | `triggerLabel="Manage Channel"` |

### Notes

- Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/ManageChannelModal.tsx.
- Rows report through onSelect with a stable item id; the source rows only logged to the console.
- Shell and colors are hubzzcn Dialog and semantic tokens.

---

## NoticeModal

Terms notice modal with a single Agree action and a Terms of Service link, ported from the Figma Make Digital Merch Modal project.

**Layer:** component

**Import:** `import { NoticeModal } from "@hubzz/ui"`

### Examples

| Name    | Description | Key Props                     |
| ------- | ----------- | ----------------------------- |
| Default |             | `triggerLabel="Terms Notice"` |

### Notes

- Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/NoticeModal.tsx.
- The demo chains the Terms of Service link into TermsModal, matching the Figma App wiring.
- Agree reports through onAgree and closes; shell and colors are hubzzcn Dialog and semantic tokens.

---

## RoomSettingsModal

Room Settings modal with Cancel/Save header, setting rows, and a Moderation & Design section, ported from the Figma Make Digital Merch Modal project.

**Layer:** component

**Import:** `import { RoomSettingsModal } from "@hubzz/ui"`

### Examples

| Name    | Description | Key Props                      |
| ------- | ----------- | ------------------------------ |
| Default |             | `triggerLabel="Room Settings"` |

### Notes

- Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/RoomSettingsModal.tsx.
- Rows are data-driven and report through onRowClick; Save reports through onSave and closes, as in the source.
- Shell and colors are hubzzcn Dialog and semantic tokens.

---

## TermsModal

Terms of Use modal with scrollable legal copy and a Close action, ported from the Figma Make Digital Merch Modal project.

**Layer:** component

**Import:** `import { TermsModal } from "@hubzz/ui"`

### Examples

| Name    | Description | Key Props                     |
| ------- | ----------- | ----------------------------- |
| Default |             | `triggerLabel="Terms of Use"` |

### Notes

- Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/TermsModal.tsx.
- Legal copy is carried over from the source as-is, including the sections the source itself abbreviates.
- Shell and colors are hubzzcn Dialog and semantic tokens.
