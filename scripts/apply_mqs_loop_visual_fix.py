from pathlib import Path
import re

source_path = Path("src/pages/MqsPrototype.tsx")
source = source_path.read_text()

source = source.replace(
    '            className="relative touch-manipulation rounded-full bg-card"\n',
    '''            className={cn(\n              "relative touch-manipulation rounded-full bg-card",\n              item.looping &&\n                "border-primary/60 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"\n            )}\n''',
    1,
)

source = source.replace(
    '            title={`${isPlaying ? "Pause" : "Play"} · Hold to toggle loop`}\n',
    '            title={`${isPlaying ? "Pause" : "Play"} · Hold to ${item.looping ? "turn loop off" : "turn loop on"}`}\n',
    1,
)

source = source.replace('                viewBox="0 0 56 56"\n', '                viewBox="0 0 44 44"\n', 1)
source = source.replace(
    '                className="pointer-events-none absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 -rotate-90 overflow-visible text-primary"\n',
    '                className="pointer-events-none absolute -inset-0.5 size-11 -rotate-90 overflow-visible text-primary"\n',
    1,
)
source = source.replace('                  cx="28"\n', '                  cx="22"\n', 1)
source = source.replace('                  cy="28"\n', '                  cy="22"\n', 1)
source = source.replace('                  r="24"\n', '                  r="20"\n', 1)

source, badge_count = re.subn(
    r'''            \{item\.looping \? \(\n              <span\n                data-testid="current-loop-badge".*?              </span>\n            \) : null\}\n''',
    "",
    source,
    count=1,
    flags=re.S,
)
if badge_count != 1:
    raise SystemExit(f"badge removal count: {badge_count}")

source_path.write_text(source)

test_path = Path("tests/mqs-prototype.spec.ts")
tests = test_path.read_text()

tests = tests.replace(
    '''    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()\n    await expect(page.getByTestId("current-loop-badge")).toBeVisible()\n    await expect(page.getByTestId("loop-feedback")).toHaveText("Loop on")\n''',
    '''    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(\n      "data-looping",\n      "true"\n    )\n    await expect(page.getByTestId("current-loop-badge")).toHaveCount(0)\n    await expect(page.getByTestId("loop-feedback")).toHaveText("Loop on")\n''',
    1,
)

tests = tests.replace(
    '''    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()\n    await expect(page.getByTestId("current-loop-badge")).toHaveCount(0)\n    await expect(page.getByTestId("loop-feedback")).toHaveText("Loop off")\n''',
    '''    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(\n      "data-looping",\n      "false"\n    )\n    await expect(page.getByTestId("current-loop-badge")).toHaveCount(0)\n    await expect(page.getByTestId("loop-feedback")).toHaveText("Loop off")\n''',
    1,
)

tests = tests.replace(
    '''    await expect(page.getByTestId("current-loop-badge")).toHaveCount(0)\n    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()\n''',
    '''    await expect(page.getByTestId("current-loop-badge")).toHaveCount(0)\n    await expect(page.getByRole("button", { name: "Pause" })).toHaveAttribute(\n      "data-looping",\n      "false"\n    )\n''',
    2,
)

tests = tests.replace(
    '''    await expect(page.getByTestId("current-loop-badge")).toBeVisible()\n\n    const slider = page.getByRole("slider", { name: "Playback position" })\n''',
    '''    await expect(page.getByRole("button", { name: "Play" })).toHaveAttribute(\n      "data-looping",\n      "true"\n    )\n    await expect(page.getByTestId("current-loop-badge")).toHaveCount(0)\n\n    const slider = page.getByRole("slider", { name: "Playback position" })\n''',
    1,
)

test_path.write_text(tests)
