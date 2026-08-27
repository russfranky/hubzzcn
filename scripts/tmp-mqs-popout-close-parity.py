from pathlib import Path

page_path = Path("src/pages/MqsPrototype.tsx")
css_path = Path("src/index.css")
test_path = Path("tests/mqs-prototype.spec.ts")

page = page_path.read_text()
css = css_path.read_text()
tests = test_path.read_text()

page = page.replace(
    "  Maximize2,\n  Minimize2,\n  MoreVertical,",
    "  MoreVertical,\n  X,",
    1,
)

old_state = '  const [expanded, setExpanded] = React.useState(false)\n'
new_state = '  const [windowOpen, setWindowOpen] = React.useState(true)\n'
if old_state not in page:
    raise SystemExit("expanded state anchor not found")
page = page.replace(old_state, new_state, 1)

old_return = '''  return (\n    <main\n      data-testid="mqs-container"'''
new_return = '''  if (!windowOpen) return null\n\n  return (\n    <main\n      data-testid="mqs-container"'''
if old_return not in page:
    raise SystemExit("MQS return anchor not found")
page = page.replace(old_return, new_return, 1)

old_card = '''        className={cn(\n          "mx-auto flex min-h-0 w-full flex-1 flex-col gap-0 overflow-hidden rounded-3xl bg-card py-0 shadow-2xl ring-1 ring-border transition-[max-width]",\n          expanded ? "max-w-[1320px]" : "max-w-[1028px]"\n        )}'''
new_card = '''        className="mx-auto flex min-h-0 w-full max-w-[1028px] flex-1 flex-col gap-0 overflow-hidden rounded-3xl bg-card py-0 shadow-2xl ring-1 ring-border"'''
if old_card not in page:
    raise SystemExit("expanded card class anchor not found")
page = page.replace(old_card, new_card, 1)

old_button = '''          <Button\n            type="button"\n            variant="ghost"\n            size="icon-lg"\n            aria-label={expanded ? "Restore queue" : "Expand queue"}\n            title={expanded ? "Restore queue" : "Expand queue"}\n            onClick={() => setExpanded((value) => !value)}\n          >\n            {expanded ? <Minimize2 /> : <Maximize2 />}\n          </Button>'''
new_button = '''          <Button\n            type="button"\n            variant="ghost"\n            size="icon"\n            className="size-8"\n            aria-label="Close"\n            title="Close"\n            onClick={() => setWindowOpen(false)}\n          >\n            <X />\n          </Button>'''
if old_button not in page:
    raise SystemExit("expand button anchor not found")
page = page.replace(old_button, new_button, 1)

expanded_css = '''\nmain:has(#now-playing-title) > [data-slot="card"][class*="max-w-[1320px]"] {\n  max-width: 40rem;\n}\n'''
if expanded_css not in css:
    raise SystemExit("expanded MQS CSS anchor not found")
css = css.replace(expanded_css, "\n", 1)

old_layout_assertion = '''    await expect(\n      page.getByRole("button", { name: "Expand queue" })\n    ).toBeVisible()'''
new_layout_assertion = '''    await expect(page.getByRole("button", { name: "Close" })).toBeVisible()\n    await expect(\n      page.getByRole("button", { name: /Expand queue|Restore queue/ })\n    ).toHaveCount(0)'''
if old_layout_assertion not in tests:
    raise SystemExit("expand layout assertion anchor not found")
tests = tests.replace(old_layout_assertion, new_layout_assertion, 1)

new_test = '''\n  test("closes the MQS popout instead of resizing it", async ({ page }) => {\n    const modal = page.getByTestId("mqs-modal")\n    const close = page.getByRole("button", { name: "Close" })\n\n    await expect(modal).toBeVisible()\n    await expect(page.getByRole("button", { name: /Expand queue|Restore queue/ })).toHaveCount(0)\n\n    await close.click()\n\n    await expect(modal).toHaveCount(0)\n    await expect(page.getByTestId("mqs-container")).toHaveCount(0)\n  })\n'''
marker = '  test("uses the literal Hubzz MQS palette", async ({ page }) => {'
if 'closes the MQS popout instead of resizing it' not in tests:
    if marker not in tests:
        raise SystemExit("test insertion marker not found")
    tests = tests.replace(marker, new_test + "\n" + marker, 1)

page_path.write_text(page)
css_path.write_text(css)
test_path.write_text(tests)
