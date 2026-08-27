from pathlib import Path

page_path = Path("src/pages/MqsPrototype.tsx")
test_path = Path("tests/mqs-prototype.spec.ts")

page = page_path.read_text()
tests = test_path.read_text()

old = 'className="cursor-grab text-muted-foreground/70 hover:bg-transparent hover:text-foreground active:cursor-grabbing"'
new = 'className="cursor-grab text-muted-foreground/70 hover:!bg-transparent hover:!text-muted-foreground/70 active:cursor-grabbing"'

if old not in page:
    raise SystemExit("drag handle class anchor not found")
page = page.replace(old, new, 1)

marker = '  test("keeps play and pause between the vertical skip controls", async ({\n'
new_test = '''  test("keeps drag grips visually passive on hover", async ({ page }) => {\n    const grip = page.getByTestId("upcoming-row").first().getByRole("button")\n    const before = await grip.evaluate((element) => {\n      const style = getComputedStyle(element)\n      return {\n        backgroundColor: style.backgroundColor,\n        color: style.color,\n      }\n    })\n\n    await grip.hover()\n\n    const after = await grip.evaluate((element) => {\n      const style = getComputedStyle(element)\n      return {\n        backgroundColor: style.backgroundColor,\n        color: style.color,\n      }\n    })\n\n    expect(after).toEqual(before)\n    await expect(page.getByTestId("upcoming-row").first()).toHaveAttribute(\n      "draggable",\n      "true"\n    )\n  })\n\n'''

if "keeps drag grips visually passive on hover" not in tests:
    if marker not in tests:
        raise SystemExit("test insertion marker not found")
    tests = tests.replace(marker, new_test + marker, 1)

page_path.write_text(page)
test_path.write_text(tests)
