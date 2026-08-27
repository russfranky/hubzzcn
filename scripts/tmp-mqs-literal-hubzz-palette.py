from pathlib import Path

css_path = Path("src/index.css")
page_path = Path("src/pages/MqsPrototype.tsx")
test_path = Path("tests/mqs-prototype.spec.ts")

css = css_path.read_text()
page = page_path.read_text()
tests = test_path.read_text()

old_theme = '''/*
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

new_theme = '''/*
 * MQS literal Hubzz palette.
 *
 * Keep the prototype on the pre-alpha Hubzz dark visual language while the
 * catalog-wide foundation remains neutral. These are the literal brand values
 * used by the Hubzz shell/studio token set rather than approximated colors.
 */
main:has(#now-playing-title) {
  --background: #0d0d0f;
  --foreground: #ffffff;
  --card: #141416;
  --card-foreground: #ffffff;
  --popover: #141416;
  --popover-foreground: #ffffff;
  --primary: #735ffa;
  --primary-foreground: #ffffff;
  --secondary: #1a1d21;
  --secondary-foreground: #a1a1aa;
  --muted: #1a1d21;
  --muted-foreground: #71717a;
  --accent: #2d3039;
  --accent-foreground: #ffffff;
  --destructive: #ff5a5a;
  --destructive-foreground: #ffffff;
  --border: rgba(255, 255, 255, 0.06);
  --input: rgba(255, 255, 255, 0.06);
  --input-background: #1a1d21;
  --ring: #735ffa;
  --control-hover: #2d3039;
  --pill-hover: #1a1d21;
  --success: #4cc38a;
  --warning: #e5b849;
}

main:has(#now-playing-title) [data-slot="input"] {
  border-color: var(--border);
  background: var(--input-background);
}

main:has(#now-playing-title) [data-slot="input"]:focus-visible {
  border-color: var(--ring);
}

main:has(#now-playing-title) [data-variant="outline"] {
  border-color: var(--border);
  background: var(--secondary);
}

main:has(#now-playing-title) [data-variant="outline"]:hover,
main:has(#now-playing-title) [data-variant="ghost"]:hover {
  background: var(--accent);
}
'''

if old_theme not in css:
    raise SystemExit("existing MQS palette block not found")
css = css.replace(old_theme, new_theme, 1)

page_replacements = {
    'shadow-2xl ring-1 ring-foreground/15 transition-[max-width]': 'shadow-2xl ring-1 ring-border transition-[max-width]',
    'rounded-xl bg-card py-0 ring-1 ring-foreground/10': 'rounded-xl bg-card py-0 ring-1 ring-border',
    'rounded-xl bg-card py-8 text-center text-muted-foreground ring-1 ring-foreground/10': 'rounded-xl bg-card py-8 text-center text-muted-foreground ring-1 ring-border',
    'relative min-h-0 flex-1 gap-0 overflow-y-auto rounded-xl bg-card py-0 ring-1 ring-foreground/10': 'relative min-h-0 flex-1 gap-0 overflow-y-auto rounded-xl bg-card py-0 ring-1 ring-border',
    'relative gap-0 overflow-hidden rounded-xl bg-card py-0 ring-1 ring-foreground/15 transition-colors': 'relative gap-0 overflow-hidden rounded-xl bg-card py-0 ring-1 ring-border transition-colors',
    'className="h-9 rounded-md bg-transparent pl-9 text-sm"': 'className="h-9 rounded-md border-border bg-secondary pl-9 text-sm dark:bg-secondary"',
}

for old, new in page_replacements.items():
    if old not in page:
        raise SystemExit(f"page anchor not found: {old}")
    page = page.replace(old, new, 1)

start = tests.index('  test("uses the /cn Hubzz palette without local indigo overrides"')
end = tests.index('  test("keeps play and pause between the vertical skip controls"', start)
new_test = '''  test("uses the literal Hubzz MQS palette", async ({ page }) => {
    const container = page.getByTestId("mqs-container")
    const modal = page.getByTestId("mqs-modal")
    const mediaInput = page.getByRole("textbox", { name: "Media URL" })
    const contributor = page.getByTestId("current-row").locator("a").first()
    const lastPlayed = page.getByTestId("last-played-section")
    const queueActions = page.getByRole("button", { name: "Queue actions" })

    await expect(container).toHaveCSS("background-color", "rgb(13, 13, 15)")
    await expect(modal).toHaveCSS("background-color", "rgb(20, 20, 22)")
    await expect(mediaInput).toHaveCSS("background-color", "rgb(26, 29, 33)")
    await expect(mediaInput).toHaveCSS(
      "border-color",
      "rgba(255, 255, 255, 0.06)"
    )
    await expect(contributor).toHaveCSS("color", "rgb(115, 95, 250)")
    await expect(lastPlayed).toHaveCSS(
      "border-bottom-color",
      "rgba(255, 255, 255, 0.06)"
    )

    await queueActions.hover()
    await expect(queueActions).toHaveCSS("background-color", "rgb(45, 48, 57)")

    const status = await container.evaluate((element) => {
      const resolve = (name: string) => {
        const probe = document.createElement("span")
        probe.style.color = `var(${name})`
        element.appendChild(probe)
        const value = getComputedStyle(probe).color
        probe.remove()
        return value
      }
      return {
        success: resolve("--success"),
        warning: resolve("--warning"),
        destructive: resolve("--destructive"),
      }
    })

    expect(status).toEqual({
      success: "rgb(76, 195, 138)",
      warning: "rgb(229, 184, 73)",
      destructive: "rgb(255, 90, 90)",
    })
    await expect(page.locator('[class*="indigo"]')).toHaveCount(0)
  })

'''
tests = tests[:start] + new_test + tests[end:]

css_path.write_text(css)
page_path.write_text(page)
test_path.write_text(tests)
