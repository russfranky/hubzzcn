from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


source_path = Path("src/pages/MqsPrototype.tsx")
source = source_path.read_text()

source = replace_once(
    source,
    '''  onTogglePlaying,
  onSkipUp,
  onSkipDown,
}: {''',
    '''  onTogglePlaying,
  onSkipUp,
  onSkipDown,
  canSkipUp,
}: {''',
    "CurrentCard props",
)

source = replace_once(
    source,
    '''  onTogglePlaying: () => void
  onSkipUp: () => void
  onSkipDown: () => void
}) {''',
    '''  onTogglePlaying: () => void
  onSkipUp: () => void
  onSkipDown: () => void
  canSkipUp: boolean
}) {''',
    "CurrentCard prop types",
)

source = replace_once(
    source,
    '''            aria-label="Skip up"
            title="Skip up"
            onClick={onSkipUp}''',
    '''            aria-label="Skip up"
            title="Skip up"
            disabled={!canSkipUp}
            onClick={onSkipUp}''',
    "disable Skip up button",
)

source = replace_once(
    source,
    '''              onTogglePlaying={() => setIsPlaying((value) => !value)}
              onSkipUp={skipUp}
              onSkipDown={skipDown}''',
    '''              onTogglePlaying={() => setIsPlaying((value) => !value)}
              onSkipUp={skipUp}
              onSkipDown={skipDown}
              canSkipUp={played.length > 0}''',
    "pass history availability",
)

source_path.write_text(source)


test_path = Path("tests/mqs-prototype.spec.ts")
tests = test_path.read_text()
anchor = '''  test("moves through the vertical queue without changing the layout model", async ({
    page,
  }) => {'''
new_test = '''  test("disables skip up when there is no Last Played history", async ({ page }) => {
    const skipUp = page.getByRole("button", { name: "Skip up" })
    await expect(skipUp).toBeEnabled()

    for (let index = 0; index < 3; index += 1) {
      const dataTransfer = await page.evaluateHandle(() => new DataTransfer())
      await page.getByTestId("history-row").first().dispatchEvent("dragstart", {
        dataTransfer,
      })
      await page.getByTestId("remove-drop-target").dispatchEvent("drop", {
        dataTransfer,
      })
    }

    await expect(page.getByTestId("history-row")).toHaveCount(0)
    await expect(skipUp).toBeDisabled()

    await page.getByRole("button", { name: "Skip down" }).click()
    await expect(skipUp).toBeEnabled()
  })

'''
if tests.count(anchor) != 1:
    raise RuntimeError("test anchor not found exactly once")
tests = tests.replace(anchor, new_test + anchor, 1)
test_path.write_text(tests)
