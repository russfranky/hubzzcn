# Pre-alpha MQS Integration Contract

This document pins the HubzzCN MQS prototype to the live pre-alpha product seam.
It is product integration documentation, not a registry-component specification.

## Source revision

```text
HubzzInc/pre-alpha@9e68e040c34d1fac963751959fe049c9cb7f5f36
```

Verified source contracts:

- `packages/mqs/src/ui/window/MqsQueueWindow.tsx`
- `packages/mqs/src/ui/window/__tests__/MqsQueueWindow.test.tsx`
- `packages/mqs/engine/types.ts`
- `packages/mqs/engine/commands.ts`
- `packages/client/src/space-cards/SpaceHUD.tsx`
- `packages/client/src/profile-panel/host.ts`

## Ownership

### Profile-panel Spaces

Spaces search, browse, Join, Leave, attendance, and navigation are **PRODUCT**.
The pre-alpha profile panel routes Join through:

```ts
onJoinSpace?: (spaceId: string, title: string, path?: string) => void
```

The host performs the world navigation. Spaces does not call MQS.

### MQS window

The queue window is **PRODUCT UI composed from UPSTREAM primitives**. It is not a
Hubzz registry analog.

The production host owns authoritative state. The window receives snapshots and
emits intents only:

```ts
export interface MqsQueueWindowProps {
  items: MqsQueueItem[]
  currentIndex: number
  isPlaying: boolean
  elapsed?: number
  isMuted?: boolean
  title?: string
  onCommand: (command: string) => void
  onImportSetlist?: (file: unknown) => void
  onClose?: () => void
  style?: React.CSSProperties
  className?: string
}
```

HubzzCN `src/components/hubzz/mqs-queue-window.tsx` intentionally matches this
shape structurally. It is product-local even though it currently sits beside the
Hubzz prototypes. Do not add it to the public registry, catalog, package exports,
or component manifest.

## Host wiring

Current pre-alpha `SpaceHUD` supplies the ports as follows:

```ts
onCommand={(command) => connection.send("chat", command)}
onImportSetlist={(file) => connection.send("mqs:import", file, "replace")}
onClose={() => setMqsQueueOpen(false)}
```

After a command, the host requests a fresh `--queue` snapshot. Server `mqs:*`
frames remain authoritative.

## Required command compatibility

The port-ready view emits only server-supported commands:

| UI intent      | Command                              |
| -------------- | ------------------------------------ |
| Previous       | `--prev`                             |
| Pause          | `--pause`                            |
| Resume         | `--resume`                           |
| Skip           | `--skip`                             |
| Mute viewer    | `--mute`                             |
| Unmute viewer  | `--unmute`                           |
| Seek           | `--seek <seconds>`                   |
| Remove row     | `--remove <1-based position>`        |
| Reorder        | `--move <1-based from> <1-based to>` |
| Clear upcoming | `--clearqueue`                       |

Setlist import does not use a chat command. It goes through `onImportSetlist`.

## Deliberate removals from the older HubzzCN MQS prototype

The following behaviors are not part of the portable window contract:

- a duplicate media-URL composer;
- local authoritative queue mutation inside the window;
- the prototype-only long-press Loop state;
- a queue-specific reconnect state machine;
- product actions that do not map to the current pre-alpha host contract.

Media URLs are added through the pre-alpha chat bar with `--play` or `--playnext`.
Connection recovery remains owned by the world/client host.

## Portal → world → MQS sequence

1. The player opens Spaces in the profile panel.
2. Spaces calls `ProfileHostCallbacks.onJoinSpace` for a selected world.
3. The host performs full world navigation and reconnects the player session.
4. `SpaceHUD` mounts in the joined world.
5. A DJ with `world.screen` permission can open MQS.
6. `SpaceHUD` requests `--queue` and passes the server snapshot to the MQS window.
7. MQS actions emit command/import intents back to `SpaceHUD`.
8. New server snapshots flow back into the same window props.

There is no direct Portal-to-MQS state bridge. The joined world and SpaceHUD are
the integration boundary.

## Merge gates

Before porting this UI into pre-alpha:

1. HubzzCN browser tests must pass the MQS contract in Chromium, Firefox, and WebKit.
2. Exact 1-based move/remove commands must remain covered.
3. The window must contain no add-link input.
4. Setlist import must remain optional and must forward parsed JSON unchanged.
5. The window must not own the authoritative queue.
6. The profile-panel Spaces Join path must remain product-owned.
7. The pre-alpha source SHA in this document must be refreshed if MQS or SpaceHUD changes materially.
