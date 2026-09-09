# Working State

This file is the short handoff between work sessions. Read [`../AGENTS.md`](../AGENTS.md) first.

Last reviewed: 2026-09-08

## Production baseline

- The public catalog remains at `https://hubzz.xyz/cn/`.
- Last verified production code: `f655c7a` after PR #85. Its main CI, CodeQL, and production deployment passed.
- Production includes the Stage HUD at `/cn/stage` and the standalone MQS long-press Loop prototype.
- The pre-alpha Portal and MQS integration in PR #76 is not production code.

## Current focus

- Goal: repair the MQS list accessibility failure in [PR #76](https://github.com/russfranky/hubzzcn/pull/76).
- Branch: `qa/pre-refactor-confidence-95`.
- Scope: `src/components/hubzz/mqs-queue-window.tsx` and `tests/mqs-prototype.spec.ts`.
- Implemented: explicit list-item roles, a named queue list, and regression tests for populated and empty queues.
- Preserved: existing layout, host command strings, and server-owned queue state. No public package or registry additions.
- Verification: inspect the latest PR #76 checks and session comment for exact tested commits and results.
- Remaining: review clearance. A passing CI run does not remove the review-only hold.

## Review holds and other open work

- PR #76 remains review-only. Do not merge or deploy it without explicit review clearance.
- The prior Seer review did not complete. See the PR discussion before retrying or changing the review path.
- [PR #40](https://github.com/russfranky/hubzzcn/pull/40) is a separate older MQS proposal. Do not merge or combine it without reconciling its intent.
- Dependency pull requests are separate maintenance work. Do not mix them into the accessibility repair.
- An empty issue search does not mean there is no unfinished work. Inspect open pull requests and their discussions too.

## Recently completed

- PR #77 added the Stage HUD prototype without expanding the public `@hubzz/ui` package surface.
- PR #84 restored formatting and removed the old MQS render-time ref write.
- PR #85 established the agent guide and session handoff. This review found that the first handoff omitted open product pull requests.

## Known constraints

- Keep ordinary shadcn primitives upstream-first.
- Keep prototype-only code out of `src/index.ts` unless a change explicitly promotes it.
- Preserve keyboard and reduced-motion behavior in interactive prototypes.
- Keep production facts separate from unmerged branch behavior.

## Next action

Review the focused accessibility repair and latest CI results on PR #76, then complete the required review. Keep the integration unmerged until clearance.

## Handoff format

Record the goal, branch or PR, affected files, completed work, remaining work, verification evidence, and next action. Prefer links to live CI over undated claims that checks pass.
