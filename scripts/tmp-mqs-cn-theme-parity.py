from pathlib import Path

css_path = Path('src/index.css')
page_path = Path('src/pages/MqsPrototype.tsx')
test_path = Path('tests/mqs-prototype.spec.ts')

css = css_path.read_text()
page = page_path.read_text()
tests = test_path.read_text()

anchor = '''/*
 * MQS prototype density.
 *
 * Keep the approved three-section composition intact while rendering the same
 * shadcn primitives at modal scale instead of desktop-panel scale. The :has()
 * scope is specific to the MQS prototype and does not affect the catalog.
 */
'''

theme = '''/*
 * MQS production palette parity.
 *
 * /cn/ is the source of truth for the live Hubzz palette. Scope the earlier
 * Hubzz semantic dark tokens to this prototype so the catalog-wide neutral
 * shadcn foundation remains untouched.
 */
main:has(#now-playing-title) {
  --background: oklch(0.221 0.009 255.608);
  --foreground: oklch(0.994 0.002 247.839);
  --card: oklch(0.269 0.01 268.313);
  --card-foreground: oklch(0.994 0.002 247.839);
  --popover: oklch(0.269 0.01 268.313);
  --popover-foreground: oklch(0.994 0.002 247.839);
  --primary: oklch(0.592 0.221 283.18);
  --primary-foreground: oklch(0.994 0.002 247.839);
  --secondary: oklch(0.302 0.011 271.028);
  --secondary-foreground: oklch(0.779 0.021 243.496);
  --muted: oklch(0.302 0.011 271.028);
  --muted-foreground: oklch(0.677 0.015 238.128);
  --accent: oklch(0.302 0.011 271.028);
  --accent-foreground: oklch(0.722 0.148 288.272);
  --destructive: oklch(0.576 0.209 29.482);
  --destructive-foreground: oklch(0.994 0.002 247.839);
  --border: oklch(0.282 0.011 278.154);
  --input: oklch(0.361 0.012 252.962);
  --input-background: oklch(0.361 0.012 252.962);
  --ring: oklch(0.592 0.221 283.18);
  --control-hover: oklch(0.361 0.012 252.962);
  --pill-hover: oklch(0.31 0.017 270.822);
}

'''

if theme not in css:
    if anchor not in css:
        raise SystemExit('MQS density anchor not found')
    css = css.replace(anchor, anchor + theme, 1)

page = page.replace('indigo-400', 'primary')

new_test = '''
  test("uses the /cn Hubzz palette without local indigo overrides", async ({
    page,
  }) => {
    const palette = await page.getByTestId("mqs-container").evaluate((element) => {
      const style = getComputedStyle(element)
      const token = (name: string) => style.getPropertyValue(name).trim()
      return {
        background: token("--background"),
        foreground: token("--foreground"),
        card: token("--card"),
        primary: token("--primary"),
        muted: token("--muted"),
        mutedForeground: token("--muted-foreground"),
        border: token("--border"),
        input: token("--input"),
        ring: token("--ring"),
      }
    })

    expect(palette).toEqual({
      background: "oklch(22.1% .009 255.608)",
      foreground: "oklch(99.4% .002 247.839)",
      card: "oklch(26.9% .01 268.313)",
      primary: "oklch(59.2% .221 283.18)",
      muted: "oklch(30.2% .011 271.028)",
      mutedForeground: "oklch(67.7% .015 238.128)",
      border: "oklch(28.2% .011 278.154)",
      input: "oklch(36.1% .012 252.962)",
      ring: "oklch(59.2% .221 283.18)",
    })

    await expect(page.locator('[class*="indigo"]')).toHaveCount(0)
  })
'''

marker = '  test("keeps play and pause between the vertical skip controls", async ({\n'
if 'uses the /cn Hubzz palette without local indigo overrides' not in tests:
    if marker not in tests:
        raise SystemExit('test insertion marker not found')
    tests = tests.replace(marker, new_test + '\n' + marker, 1)

css_path.write_text(css)
page_path.write_text(page)
test_path.write_text(tests)
