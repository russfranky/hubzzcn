import assert from "node:assert/strict"
import { test } from "node:test"

import {
  applyMqsDemoCommand as apply,
  parseMqsDemoSetlist as parse,
  replaceMqsDemoSetlist as replace,
  type MqsDemoSnapshot,
} from "../src/pages/mqs-demo-state.ts"
import {
  clampMqsElapsed,
  mqsDurationSeconds,
} from "../src/components/hubzz/mqs-timing.ts"

function snapshot(
  length: number,
  currentIndex: number,
  isPlaying = true,
  isMuted = false
): MqsDemoSnapshot {
  return {
    items: Array.from({ length }, (_, index) => ({
      id: `item-${index}`,
      title: "Duplicate title",
      url: "https://example.com/same-url",
      type: "website",
      addedBy: "test",
      addedByName: "Test",
      duration: 10,
    })),
    currentIndex,
    elapsed: length ? 123 : 0,
    isPlaying: length > 0 && isPlaying,
    isMuted,
  }
}

function freeze(value: MqsDemoSnapshot) {
  value.items.forEach(Object.freeze)
  Object.freeze(value.items)
  return Object.freeze(value)
}

function invariant(value: MqsDemoSnapshot) {
  assert.equal(
    new Set(value.items.map((item) => item.id)).size,
    value.items.length
  )
  assert(Number.isSafeInteger(value.currentIndex))
  assert(value.currentIndex >= -1 && value.currentIndex < value.items.length)
  assert(Number.isSafeInteger(value.elapsed) && value.elapsed >= 0)
  if (value.items.length === 0) {
    assert.equal(value.currentIndex, -1)
    assert.equal(value.isPlaying, false)
    assert.equal(value.elapsed, 0)
  }
}

test("all queue positions preserve active identity through move and removal", () => {
  let moves = 0
  let removals = 0
  for (let length = 1; length <= 8; length += 1) {
    for (let active = 0; active < length; active += 1) {
      for (const playing of [false, true]) {
        for (const muted of [false, true]) {
          const before = freeze(snapshot(length, active, playing, muted))
          const activeId = before.items[active].id
          for (let from = 0; from < length; from += 1) {
            for (let to = 0; to < length; to += 1) {
              const after = apply(before, `--move ${from + 1} ${to + 1}`)
              const expected = before.items.map((item) => item.id)
              expected.splice(to, 0, ...expected.splice(from, 1))
              assert.deepEqual(
                after.items.map((item) => item.id),
                expected
              )
              assert.equal(after.items[after.currentIndex].id, activeId)
              assert.equal(after.elapsed, 123)
              assert.equal(after.isPlaying, playing)
              assert.equal(after.isMuted, muted)
              assert.deepEqual(
                apply(before, `--move ${from + 1} ${to + 1}`),
                after
              )
              invariant(after)
              moves += 1
            }
            const after = apply(before, `--remove ${from + 1}`)
            const expectedId =
              from !== active
                ? activeId
                : (before.items[active + 1]?.id ?? before.items[active - 1]?.id)
            assert.equal(after.items[after.currentIndex]?.id, expectedId)
            assert.equal(after.elapsed, from === active ? 0 : 123)
            assert.equal(after.isPlaying, length > 1 && playing)
            assert.equal(after.isMuted, muted)
            assert.equal(after.items.length, length - 1)
            invariant(after)
            removals += 1
          }
        }
      }
    }
  }
  assert.equal(moves, 5184)
  assert.equal(removals, 816)
})

test("malformed, fractional, overflowing and out-of-range commands are no-ops", () => {
  const before = freeze(snapshot(3, 1))
  const bad = [
    "",
    "--unknown",
    "--move",
    "--remove",
    "--seek",
    "--move 0 2",
    "--move 1 4",
    "--remove 4",
    "--remove 0",
    "--move -1 2",
    "--move 1.5 2",
    "--move 1 2 extra",
    "--remove Infinity",
    "--seek NaN",
    "--seek -1",
    "--seek 1.5",
    "--seek 1e3",
    "--resume extra",
    "--move 1 1",
  ]
  for (const huge of ["9007199254740992", "9".repeat(400)]) {
    bad.push(
      `--seek ${huge}`,
      `--move ${huge} 1`,
      `--move 1 ${huge}`,
      `--remove ${huge}`
    )
  }
  for (const command of bad)
    assert.equal(apply(before, command), before, command)
})

test("empty queues cannot seek or start phantom playback", () => {
  for (const muted of [false, true]) {
    const before = freeze(snapshot(0, -1, false, muted))
    for (const command of [
      "--prev",
      "--skip",
      "--pause",
      "--resume",
      "--clearqueue",
      "--seek 5",
      "--remove 1",
      "--move 1 2",
    ]) {
      const after = apply(before, command)
      invariant(after)
      assert.equal(after.isMuted, muted)
    }
  }
})

test("transport preserves pause/mute and only resets time when the item changes", () => {
  for (let index = 0; index < 3; index += 1) {
    for (const playing of [false, true]) {
      const before = freeze(snapshot(3, index, playing, true))
      for (const [command, delta] of [
        ["--prev", -1],
        ["--skip", 1],
      ] as const) {
        const after = apply(before, command)
        if (index + delta < 0 || index + delta >= 3) assert.equal(after, before)
        else {
          assert.equal(after.currentIndex, index + delta)
          assert.equal(after.elapsed, 0)
        }
        assert.equal(after.isPlaying, playing)
        assert.equal(after.isMuted, true)
        invariant(after)
      }
      const cleared = apply(before, "--clearqueue")
      assert.deepEqual(cleared.items, [before.items[index]])
      assert.equal(cleared.currentIndex, 0)
      assert.equal(cleared.elapsed, 123)
      assert.equal(cleared.isPlaying, playing)
      assert.equal(cleared.isMuted, true)
    }
  }
})

test("seek is finite, bounded, and disabled for unresolved duration modes", () => {
  const before = snapshot(1, 0)
  assert.equal(apply(before, "--seek 0").elapsed, 0)
  assert.equal(apply(before, "--seek 9999").elapsed, 600)
  for (const duration of [
    undefined,
    0,
    -1,
    NaN,
    Infinity,
    Number.MAX_VALUE,
    Number.MIN_VALUE,
  ]) {
    const state = { ...before, items: [{ ...before.items[0], duration }] }
    assert.equal(apply(state, "--seek 20"), state)
    assert.equal(mqsDurationSeconds(state.items[0]), null)
  }
  for (const durationMode of ["percent", "fill"] as const) {
    const state = { ...before, items: [{ ...before.items[0], durationMode }] }
    assert.equal(apply(state, "--seek 20"), state)
  }
  for (const elapsed of [NaN, Infinity, -Infinity, -10])
    assert.equal(clampMqsElapsed(elapsed, 600), 0)
  assert.equal(clampMqsElapsed(900, 600), 600)
  assert.equal(clampMqsElapsed(12.9, null), 12)
})

test("setlists validate structure, limits, safe URLs and invalid rows", () => {
  for (const value of [
    null,
    false,
    [],
    {},
    { segments: [] },
    { segments: "bad" },
    { segments: [null, 1, [], {}] },
    { segments: Array(501).fill({ type: "native" }) },
  ]) {
    assert.equal(parse(value, "batch").ok, false)
  }
  const result = parse(
    {
      segments: [
        null,
        { url: "javascript:alert(1)" },
        { url: "data:text/html,test" },
        { url: "/relative" },
        { url: " https://example.com/a ", title: " Name ", duration: -10 },
        { type: "native" },
        { type: "webcam" },
        { type: "screenshare" },
      ],
    },
    "batch"
  )
  assert(result.ok)
  assert.equal(result.skipped, 4)
  assert.equal(result.items.length, 4)
  assert.equal(result.items[0].title, "Name")
  assert.equal(result.items[0].url, "https://example.com/a")
  assert.equal(result.items[0].duration, undefined)
  assert.equal(new Set(result.items.map((item) => item.id)).size, 4)
  const limit = parse(
    { segments: Array(500).fill({ type: "native" }) },
    "limit"
  )
  assert(limit.ok)
  assert.equal(limit.items.length, 500)
})

test("repeated imports have fresh identity and preserve the latest mute preference", () => {
  const value = {
    segments: [
      { url: "https://example.com", title: "Same" },
      { url: "https://example.com", title: "Same" },
    ],
  }
  const first = parse(value, "first")
  const second = parse(value, "second")
  assert(first.ok && second.ok)
  assert.notEqual(first.items[0].id, second.items[0].id)
  const before = freeze(snapshot(3, 2, false, true))
  const after = replace(before, second.items)
  assert.equal(after.isMuted, true)
  assert.equal(after.isPlaying, true)
  assert.equal(after.currentIndex, 0)
  assert.equal(after.elapsed, 0)
  assert.equal(replace(before, []), before)
  invariant(after)
})

test("mixed command sequences maintain invariants without mutating snapshots", () => {
  let seed = 0x5eed
  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed
  }
  for (let run = 0; run < 100; run += 1) {
    let current = snapshot(8, random() % 8)
    for (let step = 0; step < 100; step += 1) {
      freeze(current)
      const commands = [
        "--prev",
        "--skip",
        "--pause",
        "--resume",
        "--mute",
        "--unmute",
        "--clearqueue",
        `--seek ${random() % 1000}`,
        `--remove ${random() % 10}`,
        `--move ${random() % 10} ${random() % 10}`,
      ]
      current = apply(current, commands[random() % commands.length])
      invariant(current)
    }
  }
})
