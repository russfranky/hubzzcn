from pathlib import Path

page_path = Path("src/pages/MqsPrototype.tsx")
test_path = Path("tests/mqs-prototype.spec.ts")

page = page_path.read_text()
tests = test_path.read_text()

old_import = '''  Trash2,\n  Upload,\n} from "lucide-react"'''
new_import = '''  Trash2,\n  Upload,\n  WifiOff,\n} from "lucide-react"'''
if old_import not in page:
    raise SystemExit("icon import anchor not found")
page = page.replace(old_import, new_import, 1)

prototype_anchor = '''export function MqsPrototype() {\n  const [played, setPlayed] = React.useState(INITIAL_PLAYED)'''
prototype_replacement = '''export function MqsPrototype() {\n  const connectionState = React.useMemo(() => {\n    const state = new URLSearchParams(window.location.search).get(\n      "mqsConnection"\n    )\n    return state === "reconnecting" ? "reconnecting" : "connected"\n  }, [])\n  const connectionBlocked = connectionState === "reconnecting"\n\n  const [played, setPlayed] = React.useState(INITIAL_PLAYED)'''
if prototype_anchor not in page:
    raise SystemExit("prototype state anchor not found")
page = page.replace(prototype_anchor, prototype_replacement, 1)

card_anchor = '''      <Card\n        data-testid="mqs-modal"\n        className="mx-auto flex min-h-0 w-full max-w-[1028px] flex-1 flex-col gap-0 overflow-hidden rounded-3xl bg-card py-0 shadow-2xl ring-1 ring-border"\n      >\n        <CardHeader className="flex min-h-24 flex-row items-center justify-between border-b px-8 py-6">'''
card_replacement = '''      <Card\n        data-testid="mqs-modal"\n        data-connection-state={connectionState}\n        aria-busy={connectionBlocked || undefined}\n        className="relative mx-auto flex min-h-0 w-full max-w-[1028px] flex-1 flex-col gap-0 overflow-hidden rounded-3xl bg-card py-0 shadow-2xl ring-1 ring-border"\n      >\n        {connectionBlocked ? (\n          <div\n            data-testid="connection-overlay"\n            role="alert"\n            aria-live="assertive"\n            tabIndex={0}\n            onKeyDown={(event) => {\n              if (event.key === "Tab") event.preventDefault()\n            }}\n            className="absolute inset-0 z-50 flex cursor-default select-none flex-col items-center justify-center bg-background/80 px-6 text-center backdrop-blur-[2px] focus-visible:outline-none"\n          >\n            <WifiOff\n              className="mb-4 size-10 text-muted-foreground"\n              strokeWidth={1.7}\n              aria-hidden="true"\n            />\n            <p className="text-lg font-semibold text-foreground">\n              Connection lost\n            </p>\n            <p className="mt-1 text-sm text-muted-foreground">\n              Attempting to reconnect…\n            </p>\n          </div>\n        ) : null}\n\n        <CardHeader className="flex min-h-24 flex-row items-center justify-between border-b px-8 py-6">'''
if card_anchor not in page:
    raise SystemExit("modal anchor not found")
page = page.replace(card_anchor, card_replacement, 1)

test_anchor = '''  test("closes the MQS popout instead of resizing it", async ({ page }) => {'''
new_test = '''  test("blocks the queue with the host-style reconnecting overlay", async ({\n    page,\n  }) => {\n    await page.goto("/?prototype=mqs&mqsConnection=reconnecting")\n\n    const modal = page.getByTestId("mqs-modal")\n    const overlay = page.getByTestId("connection-overlay")\n    await expect(modal).toHaveAttribute("data-connection-state", "reconnecting")\n    await expect(modal).toHaveAttribute("aria-busy", "true")\n    await expect(overlay).toBeVisible()\n    await expect(overlay).toHaveAttribute("role", "alert")\n    await expect(overlay).toContainText("Connection lost")\n    await expect(overlay).toContainText("Attempting to reconnect…")\n    await expect(overlay.locator("svg.lucide-wifi-off")).toHaveCount(1)\n    await expect(page.getByRole("button", { name: "Reconnect" })).toHaveCount(0)\n\n    await expect(page.getByTestId("current-row")).toContainText(\n      "Tomorrowland 2026 Mainstage W1"\n    )\n    await expect(overlay).toHaveCSS("backdrop-filter", "blur(2px)")\n\n    const pause = page.getByRole("button", { name: "Pause" })\n    const box = await pause.boundingBox()\n    if (!box) throw new Error("Pause control has no bounding box")\n    const topTargetIsOverlay = await page.evaluate(\n      ({ x, y }) =>\n        Boolean(\n          document\n            .elementFromPoint(x, y)\n            ?.closest('[data-testid="connection-overlay"]')\n        ),\n      { x: box.x + box.width / 2, y: box.y + box.height / 2 }\n    )\n    expect(topTargetIsOverlay).toBe(true)\n\n    await page.keyboard.press("Tab")\n    await expect(overlay).toBeFocused()\n    await page.keyboard.press("Tab")\n    await expect(overlay).toBeFocused()\n  })\n\n'''
if test_anchor not in tests:
    raise SystemExit("test insertion anchor not found")
tests = tests.replace(test_anchor, new_test + test_anchor, 1)

default_anchor = '''    await expect(page.getByRole("button", { name: "Close" })).toBeVisible()'''
default_replacement = '''    await expect(page.getByTestId("connection-overlay")).toHaveCount(0)\n    await expect(page.getByRole("button", { name: "Close" })).toBeVisible()'''
if default_anchor not in tests:
    raise SystemExit("default overlay assertion anchor not found")
tests = tests.replace(default_anchor, default_replacement, 1)

page_path.write_text(page)
test_path.write_text(tests)
