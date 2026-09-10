# MQS edge-case contract

This describes the local HubzzCN demo host, not the remote pre-alpha engine.
The queue view still receives snapshots and emits the existing command/import
ports. No new package exports, registry entries, or network state exist here.

## Review rule

For every queue change, review empty and single-item states, both boundaries,
invalid input, ordering and cancellation, state preservation, and recovery.
Write an expected result before writing its regression test. A test count alone
is not evidence that every possible environment or failure has been covered.

## Identity and playback

- Reorder preserves the active item by ID, elapsed time, pause, and local mute.
  Moving another item across the active row must also preserve that identity.
- Removing an inactive item preserves the active item and its playback state.
- Removing the active item selects its successor. At the queue tail, it selects
  the predecessor. Both cases reset elapsed time and preserve pause and mute.
- Removing the last item sets index -1, elapsed 0, and playback stopped.
- Previous and Skip select adjacent items and reset time without changing pause.
  At a boundary they are no-ops; the corresponding view control is disabled.
- Clear retains only the active item, including its time, pause, and mute. With
  no active item it produces an empty, stopped queue.
- Closing and reopening the window preserves host state but discards pending
  view interactions. A full page reload intentionally resets this in-memory demo.

## Commands and timing

Move and remove positions remain 1-based. Unknown, malformed, negative,
fractional, overflowing, and out-of-range positions are no-ops. Same-position
moves do not create a new state. Pure transitions must not mutate a snapshot or
produce side effects when React evaluates an updater more than once.

Seek accepts safe integer seconds and clamps to a known fixed duration. Missing,
zero, negative, overflowing, and subsecond-rounded-to-zero durations are
unresolved. Percent/fill durations also remain unresolved until a host computes
an absolute duration. These cases do not expose a false seek range. Non-finite
elapsed values render as zero; valid elapsed values stay within their range.
Home, End, and arrow-key seeks use the same bounds.

## Setlist imports

- The portable view forwards parsed JSON unchanged through the existing port.
  It rejects files over 2 MiB before reading them. Exactly 2 MiB is accepted.
- The demo host accepts 1 to 500 input segments. It rejects an oversized array,
  invalid structure, or a file with no supported rows without clearing the queue.
- Rows with a supplied URL require HTTP or HTTPS. Native, webcam, and screenshare
  rows can omit the URL. Unsupported types fall back to a website row only when
  the URL is valid. Text is rendered as text, not markup.
- Mixed valid/invalid rows load the valid rows and report the skipped count.
  Invalid timing becomes unresolved rather than creating an invalid slider.
- An accepted replacement starts its first item at zero and preserves the latest
  local mute preference. Duplicate titles and URLs are allowed; IDs are unique.
- Every import receives fresh IDs outside the state updater. An old drag cannot
  select a same-position row from a new import.
- A newer file selection supersedes an older pending read. A late success or
  failure cannot replace the newer queue or show a stale error. Closing the
  window or replacing its import callback cancels the pending result.
- A read, JSON, or synchronous host rejection shows error feedback and allows a
  retry. The queue stays intact. No read or parse runs inside a state updater.

## Automated evidence

`pnpm mqs:state:test` runs eight state-test groups as part of `pnpm check`.
It checks all 5,184 move combinations and 816 removal combinations for queue
sizes 1 through 8, every active position, and all pause/mute combinations.
Fixtures deliberately reuse titles and URLs and freeze snapshots. It also checks
10,000 deterministic mixed-command steps, invalid commands, timing, and imports.

`tests/mqs-state.spec.ts` runs browser scenarios in Chromium, Firefox, and
WebKit. The existing MQS contract, reorder, and accessibility suites stay enabled.
The new browser cases include delayed reads, error feedback accessibility, exact
file-size limits, 500-item queues, and a narrow viewport. PR results identify the
exact tested commit and the live deployment evidence.

## Integration boundaries and remaining validation

The host contract requires stable unique IDs. Real server permissions,
out-of-order network snapshots, command acknowledgments, reconnect recovery,
and actual media playback/end events belong to pre-alpha integration tests.
Position commands can still become stale after emission; the server must enforce
its own authoritative ordering. This local demo does not prove those guarantees.

Native touch drag, physical-device behavior, and manual screen-reader checks
need separate device testing. Keyboard reordering remains the supported
non-pointer alternative. Do not treat desktop browser engines or automated axe
checks as proof of all assistive-technology behavior.
