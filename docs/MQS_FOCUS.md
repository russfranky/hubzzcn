# MQS focus recovery

The queue owns DOM focus recovery, not playback state or server acknowledgments.
The host still supplies snapshots and receives the unchanged command/import ports.

## Expected behavior

- Capture actual focus immediately before a committed update changes the DOM.
  Sending a command alone must not move focus. Rejected or delayed commands leave
  the existing control usable until the host supplies a different snapshot.
- When a focused row disappears, prefer the next surviving row in the preceding
  snapshot, then a surviving predecessor. Use stable IDs, not labels or positions.
  After complete replacement, prefer the first new row.
- Focus the surviving row's reorder grip, not its Remove button. Another Enter
  press must not accidentally delete another row.
- For an empty queue, prefer Load setlist, then Close, then Mute. Optional host
  callbacks can be absent. All fallback controls must be enabled and rendered.
- When a focused transport/seek control becomes disabled or ceases to be focusable,
  prefer an enabled Play/Pause control, then Mute. Do not change media state.
- Recover focus from a removed row's portaled action panel. Do not let a stale
  popover close callback restore focus to a removed trigger or another queue.
- Preserve deliberate outside focus, explicit blur, and another queue's focus.
  No focus history, timers, or deferred restoration survives a window unmount.
- Same-ID rows keep their DOM focus through reorder or reinsertion of other IDs.
  IDs can contain punctuation or Unicode; never interpolate them into selectors.

## Implementation choice

`MqsFocusBoundary` renders the existing section, without an extra DOM wrapper.
React's `getSnapshotBeforeUpdate` reads actual focus before mutation; its matching
`componentDidUpdate` restores focus only when that control is no longer usable.
This avoids global focus listeners, speculative command-time focus, stale intent
refs, and asynchronous restoration races. Radix still owns normal popover focus
and dismissal. The queue only cancels close autofocus for a disconnected trigger.

React documents no exact function-component equivalent of this pre-mutation
snapshot lifecycle. The class is limited to this imperative DOM boundary; the
queue's data and interaction components remain functions.

## Test coverage and scope

`tests/mqs-focus.spec.ts` exercises the production-built demo. The separate
`tests/mqs-focus-host.spec.ts` controls snapshots through a dev-only fixture on
port 4174. The fixture runs under React Strict Mode, has two queue instances with
the same IDs, and does not apply commands until the test supplies a new snapshot.

The fixture covers delayed/rejected commands, user navigation before delivery,
batch removals, reordered survivors, replacement, empty queues without optional
callbacks, disabled controls, open panels, remount, and special-character IDs.
It does not implement a server, network permissions, or command acknowledgments.

The main Vite production build includes only its normal entry point. It does not
publish the fixture, test controls, or the fixture's development server. Existing
production behavior, accessibility, drag, and import tests remain enabled.

References:

- React snapshot lifecycle: https://react.dev/reference/react/Component#getSnapshotBeforeUpdate
- Keyboard focus persistence: https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- Radix popover focus hooks: https://www.radix-ui.com/primitives/docs/components/popover
