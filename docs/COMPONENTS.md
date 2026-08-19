# @hubzz/ui Component Reference

> Auto-generated from `src/examples/`. Do not edit manually — run `npm run generate:manifest`.

## EventTicket

Fixed-size ticket card (344×184px) representing a user's relationship to an event. Four interactive states plus a loading skeleton.

**Import:** `import { EventTicket } from "@hubzz/ui"`

### Examples
| Name | Description | Key Props |
|------|-------------|-----------|
| Ready to join | | `ticketNumber="#00001/03123"` `state="ready"` |
| Upcoming | | `ticketNumber="#00001/03123"` `state="upcoming"` `countdown={"days":1,"hours":10,"minutes":12}` |
| Joined | | `ticketNumber="#00001/03123"` `state="joined"` |
| Past | | `ticketNumber="#00001/03123"` `state="past"` |
| Long title | | `state="joined"` `ticketNumber="#RESERVATION/2024/00001/XTRA"` |
| Loading | | `loading=true` |

### Notes
- Always 344×184px — never resize or constrain with a parent container
- Use loading=true while fetching event data; never render an empty ticket
- host and space become <a> links when hostHref/spaceHref are provided
- ticketNumber truncates with ellipsis — no need to shorten it client-side

---

## BadgeCategory

Emoji filter tag with default, hover, and active states. Supports optional remove (X) button.

**Import:** `import { BadgeCategory } from "@hubzz/ui"`

### Examples
| Name | Description | Key Props |
|------|-------------|-----------|
| Default | | `children="Networking"` `emoji="🤝"` |
| Active | | `children="Gaming"` `emoji="🎮"` `state="active"` |
| Default (Music) | | `children="Music"` `emoji="🎵"` |
| Hover (programmatic) | | `children="Fitness"` `emoji="🏋️"` `state="hover"` |
| No remove button | | `children="Technology"` `emoji="💻"` |

### Notes
- Three programmatic states: default (bg=#181B1F), hover (bg=#24262B), active (bg=#392F7D)
- CSS :hover fires the default→hover transition automatically — use state='hover' only for programmatic control (keyboard nav, focus-visible)
- onRemove renders an X button — omit the prop entirely to hide it
- emoji prop renders before the label text

---

## Capsule

Filter pill for category/tag selection. Active state is high-contrast white; inactive is muted.

**Import:** `import { Capsule } from "@hubzz/ui"`

### Examples
| Name | Description | Key Props |
|------|-------------|-----------|
| Active — Music | | `active=true` `children="Music"` |
| Active — Gaming | | `active=true` `children="Gaming"` |
| Inactive — Art | | `active=false` `children="Art"` |
| Inactive — Sports | | `active=false` `children="Sports"` |
| Inactive — Technology | | `active=false` `children="Technology"` |

### Notes
- hover:bg-[#2E3238] is an intentional UX addition — the design spec has no hover state. Do not revert.
- Use for filters and tags only — not for actions (use Button instead).

---

## ToastBanner

Notification banner with 5 type variants: neutral, blue, success, warning, error. Max width 349px. Optional dismiss button.

**Import:** `import { ToastBanner } from "@hubzz/ui"`

### Examples
| Name | Description | Key Props |
|------|-------------|-----------|
| Neutral | | `type="neutral"` `children="Your changes have been saved"` |
| Blue — Info | | `type="blue"` `children="New update available — refresh to apply"` |
| Success | | `type="success"` `children="Successfully joined the event"` |
| Warning | | `type="warning"` `children="Event starts in 10 minutes"` |
| Error | | `type="error"` `children="Failed to connect to the space"` |

### Notes
- Always provide onDismiss unless the banner is intentionally permanent
- max-w-[349px] is fixed — do not override with a wider container
- type='neutral' uses the card background (#24262B) — use for non-urgent confirmations
- Icon is always rendered in a 36×36 black circle regardless of type

---

## ProfileHeader

Profile customizer card with hero image, avatar picker, and save action.

**Import:** `import { ProfileHeader } from "@hubzz/ui"`

### Examples
| Name | Description | Key Props |
|------|-------------|-----------|
| Default Profile Header | | `heroImage="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80"` `avatars=[{"id":"1","selected":true},{"id":"2"},{"id":"3"},{"id":"4"}]` |
| No Hero Image | | `avatars=[{"id":"1","selected":true},{"id":"2"}]` |

### Notes
- Used in the profile settings or customizer flow.
- Expects an array of objects for avatars.

---

## DronePhoto

A display card for drone selfie captures taken inside Hubzz. Shows an image with overlaid metadata (timestamp and location).

**Import:** `import { DronePhoto } from "@hubzz/ui"`

### Examples
| Name | Description | Key Props |
|------|-------------|-----------|
| Default | | `imageUrl="https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=2000&auto=format&fit=crop"` `timestamp="06/13/24 11:12 UTC"` `locationUrl="hubzz.com/0,0/8,13/-1"` |

### Notes
- Used to wrap an image captured from the in-world drone.
- Uses inline Tailwind utility classes only — no shadcn component variants.
- Component is responsive but has a max width and aspect ratio per the design spec.