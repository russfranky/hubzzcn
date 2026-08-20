# @hubzz/ui Component Reference

> Auto-generated from `src/examples/`. Do not edit manually. Run `npm run generate:manifest`.

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

| Name       | Description | Key Props                                                                                                                                                                                                                                                                 |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default    |             | `heroImage="/favicon.svg"` `heroImageAlt="Hubzz profile preview"` `avatars=[{"id":"a","selected":true,"fallback":"A","alt":"Avatar A"},{"id":"b","fallback":"B","alt":"Avatar B"},{"id":"c","fallback":"C","alt":"Avatar C"},{"id":"d","fallback":"D","alt":"Avatar D"}]` |
| No preview |             | `avatars=[{"id":"a","selected":true,"fallback":"A","alt":"Avatar A"},{"id":"b","fallback":"B","alt":"Avatar B"}]`                                                                                                                                                         |

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
