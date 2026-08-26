from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected 1 match, found {count}")
    return text.replace(old, new, 1)


source_path = Path("src/pages/MqsPrototype.tsx")
source = source_path.read_text()

# Center the poof on a zero-size fixed origin at the exact center of the
# destructive target. Keeping particles relative to that origin prevents
# layout changes from shifting the animation after drop.
poof_start = source.index("function playRemovalPoof(target: HTMLElement) {")
poof_end = source.index("\nfunction Contributor", poof_start)
new_poof = '''function playRemovalPoof(target: HTMLElement) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

  const rect = target.getBoundingClientRect()
  const origin = document.createElement("span")
  origin.dataset.mqsPoofOrigin = "true"
  Object.assign(origin.style, {
    position: "fixed",
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top + rect.height / 2}px`,
    width: "0px",
    height: "0px",
    pointerEvents: "none",
    zIndex: "9999",
  })
  document.body.appendChild(origin)

  const particles = [
    [-36, 0, 11],
    [-28, -25, 13],
    [0, -34, 15],
    [28, -25, 12],
    [36, 0, 16],
    [28, 25, 11],
    [0, 34, 14],
    [-28, 25, 13],
    [0, 0, 18],
  ] as const
  let remaining = particles.length

  particles.forEach(([x, y, size], index) => {
    const particle = document.createElement("span")
    particle.dataset.mqsPoof = "true"
    Object.assign(particle.style, {
      position: "absolute",
      left: "0px",
      top: "0px",
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "9999px",
      background: "rgba(230, 230, 235, 0.42)",
      boxShadow: "0 0 10px rgba(230, 230, 235, 0.16)",
      pointerEvents: "none",
    })
    origin.appendChild(particle)

    const animation = particle.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(0.2)",
          opacity: 0.78,
          filter: "blur(0px)",
        },
        {
          offset: 0.32,
          transform: `translate(calc(-50% + ${x * 0.35}px), calc(-50% + ${y * 0.35}px)) scale(1)`,
          opacity: 0.58,
          filter: "blur(0.5px)",
        },
        {
          transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1.55)`,
          opacity: 0,
          filter: "blur(2.5px)",
        },
      ],
      {
        duration: 420 + index * 12,
        easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
        fill: "forwards",
      }
    )

    const cleanup = () => {
      particle.remove()
      remaining -= 1
      if (remaining === 0) origin.remove()
    }
    animation.onfinish = cleanup
    animation.oncancel = cleanup
  })
}
'''
source = source[:poof_start] + new_poof + source[poof_end:]

source = replace_once(
    source,
    '      className="dark min-h-screen bg-background px-4 py-6 text-foreground sm:px-8 sm:py-10"',
    '      data-testid="mqs-container"\n      className="dark flex h-dvh min-h-0 bg-background px-4 py-6 text-foreground sm:px-8 sm:py-10"',
    "container sizing",
)

source = replace_once(
    source,
    '          "mx-auto w-full gap-0 overflow-hidden rounded-3xl bg-card py-0 shadow-2xl ring-1 ring-foreground/15 transition-[max-width]",',
    '          "mx-auto flex min-h-0 w-full flex-1 flex-col gap-0 overflow-hidden rounded-3xl bg-card py-0 shadow-2xl ring-1 ring-foreground/15 transition-[max-width]",',
    "modal flex sizing",
)

source = replace_once(
    source,
    '      <Card\n        className={cn(',
    '      <Card\n        data-testid="mqs-modal"\n        className={cn(',
    "modal test id",
)

last_start = source.index(
    '        <section\n          className="border-b px-8 py-7"\n          aria-labelledby="last-played-title"'
)
now_start = source.index(
    '\n\n        <section\n          className="border-b px-8 py-7"\n          aria-labelledby="now-playing-title"',
    last_start,
)
last_block = source[last_start:now_start]
conditional_last = '''        {played.length > 0 ? (
          <section
            data-testid="last-played-section"
            className="shrink-0 border-b px-8 py-7"
            aria-labelledby="last-played-title"
          >
            <h2
              id="last-played-title"
              className="mb-4 text-sm font-semibold tracking-[0.08em] text-muted-foreground uppercase"
            >
              Last Played
            </h2>
            <Card className="gap-0 rounded-xl bg-card py-0 ring-1 ring-foreground/10">
              {played.map((item, index) => (
                <HistoryRow
                  key={item.id}
                  item={item}
                  index={index}
                  onDragStart={handleDragStart}
                />
              ))}
            </Card>
          </section>
        ) : null}'''
source = source[:last_start] + conditional_last + source[now_start:]

source = replace_once(
    source,
    '        <section\n          className="border-b px-8 py-7"\n          aria-labelledby="now-playing-title"',
    '        <section\n          className="shrink-0 border-b px-8 py-7"\n          aria-labelledby="now-playing-title"',
    "now playing shrink",
)

source = replace_once(
    source,
    '        <section className="border-b px-8 py-7" aria-labelledby="up-next-title">',
    '        <section\n          data-testid="up-next-section"\n          className="flex min-h-0 flex-1 flex-col border-b px-8 py-7"\n          aria-labelledby="up-next-title"\n        >',
    "up next flex section",
)

up_next_pos = source.index('aria-labelledby="up-next-title"')
card_pos = source.index(
    '<Card className="gap-0 rounded-xl bg-card py-0 ring-1 ring-foreground/10">',
    up_next_pos,
)
source = (
    source[:card_pos]
    + '<Card\n            data-testid="up-next-scroll"\n            className="min-h-0 flex-1 gap-0 overflow-y-auto rounded-xl bg-card py-0 ring-1 ring-foreground/10"\n          >'
    + source[card_pos + len('<Card className="gap-0 rounded-xl bg-card py-0 ring-1 ring-foreground/10">'):]
)

source = replace_once(
    source,
    '        <div\n          className="flex items-center gap-4 px-8 py-7"',
    '        <div\n          data-testid="queue-composer"\n          className="flex shrink-0 items-center gap-2 px-4 py-3"',
    "composer stable shell",
)

composer_pos = source.index('data-testid="queue-composer"')
inner_pos = source.index('          <div className="relative min-w-0 flex-1">', composer_pos)
source = (
    source[:inner_pos]
    + '          <div className="relative h-9 min-w-0 flex-1">'
    + source[inner_pos + len('          <div className="relative min-w-0 flex-1">'):]
)

source = replace_once(
    source,
    '                  "flex h-9 items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors",',
    '                  "flex h-9 w-full items-center justify-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 text-xs font-medium text-destructive transition-colors",',
    "drop target footprint",
)

source = replace_once(
    source,
    '                  className="pointer-events-none absolute top-1/2 left-4 z-10 size-5 -translate-y-1/2 text-muted-foreground"',
    '                  className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"',
    "composer link icon",
)

source = replace_once(
    source,
    '                  className="h-14 rounded-lg bg-transparent pl-12 text-base"',
    '                  className="h-9 rounded-md bg-transparent pl-9 text-sm"',
    "composer input footprint",
)

if source.count('className="size-14 rounded-lg"') != 2:
    raise RuntimeError("composer action sizing: expected two 56px action buttons")
source = source.replace(
    'className="size-14 rounded-lg"',
    'className="size-9 shrink-0 rounded-md"',
)

source = replace_once(
    source,
    '          {!dragSource ? (\n            inputFocused ? (',
    '          {inputFocused && !dragSource ? (',
    "composer state condition",
)
source = replace_once(
    source,
    '            )\n          ) : null}\n\n          <input',
    '            )}\n\n          <input',
    "composer dropdown during drag",
)

source_path.write_text(source)


css_path = Path("src/index.css")
css = css_path.read_text()

css = replace_once(
    css,
    '''main:has(#now-playing-title) {
  padding: 0.75rem;
}''',
    '''main:has(#now-playing-title) {
  display: flex;
  height: 100dvh;
  min-height: 0;
  padding: 0.75rem;
}''',
    "MQS container CSS",
)

css = replace_once(
    css,
    '''main:has(#now-playing-title) > [data-slot="card"] {
  max-width: 28.75rem;
  max-height: min(40rem, calc(100vh - 1.5rem));
  overflow-y: auto;
  border-radius: var(--radius-xl);
  box-shadow: 0 14px 36px rgb(0 0 0 / 0.28);
  scrollbar-width: thin;
}''',
    '''main:has(#now-playing-title) > [data-slot="card"] {
  display: flex;
  min-height: 0;
  max-width: 28.75rem;
  max-height: none;
  flex: 1 1 auto;
  flex-direction: column;
  overflow: hidden;
  border-radius: var(--radius-xl);
  box-shadow: 0 14px 36px rgb(0 0 0 / 0.28);
}''',
    "MQS modal height CSS",
)

css = replace_once(
    css,
    '''main:has(#now-playing-title) > [data-slot="card"] > section {
  padding: 1rem;
}''',
    '''main:has(#now-playing-title) > [data-slot="card"] > section {
  padding: 1rem;
}

main:has(#now-playing-title)
  > [data-slot="card"]
  > section[aria-labelledby="up-next-title"] {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
}

main:has(#now-playing-title) [data-testid="up-next-scroll"] {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
}''',
    "Up Next scrolling CSS",
)

composer_css_start = css.index(
    'main:has(#now-playing-title)\n  > [data-slot="card"]\n  > div:has([data-slot="input"]) {'
)
composer_css_end_marker = '''main:has(#now-playing-title)
  > [data-slot="card"]
  > div:has([data-slot="input"])
  > [data-slot="button"] {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--radius-md);
}'''
composer_css_end = css.index(composer_css_end_marker, composer_css_start) + len(
    composer_css_end_marker
)
stable_composer_css = '''main:has(#now-playing-title) [data-testid="queue-composer"] {
  flex: 0 0 auto;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}

main:has(#now-playing-title)
  [data-testid="queue-composer"]
  > div:first-child {
  height: 2.25rem;
}

main:has(#now-playing-title)
  [data-testid="queue-composer"]
  > div:first-child
  > svg {
  left: 0.75rem;
  width: 1rem;
  height: 1rem;
}

main:has(#now-playing-title) [data-slot="input"],
main:has(#now-playing-title) [data-testid="remove-drop-target"] {
  height: 2.25rem;
  border-radius: var(--radius-md);
}

main:has(#now-playing-title) [data-slot="input"] {
  padding-left: 2.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

main:has(#now-playing-title)
  [data-testid="queue-composer"]
  > [data-slot="button"] {
  width: 2.25rem;
  height: 2.25rem;
  flex: 0 0 2.25rem;
  border-radius: var(--radius-md);
}'''
css = css[:composer_css_start] + stable_composer_css + css[composer_css_end:]

css_path.write_text(css)


test_path = Path("tests/mqs-prototype.spec.ts")
tests = test_path.read_text()

old_drag_name = '  test("turns the media input into a full-width drag-to-remove target", async ({'
new_drag_name = '  test("keeps composer geometry fixed while dragging and centers the removal poof", async ({'
tests = replace_once(tests, old_drag_name, new_drag_name, "drag remove test name")

old_drag_body = '''    const rows = page.getByTestId("upcoming-row")
    const firstRow = rows.first()
    const mediaInput = page.getByRole("textbox", { name: "Media URL" })
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())

    await expect(rows).toHaveCount(5)
    await firstRow.dispatchEvent("dragstart", { dataTransfer })

    const removeTarget = page.getByTestId("remove-drop-target")
    await expect(mediaInput).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "Queue actions" })
    ).toHaveCount(0)
    await expect(removeTarget).toContainText("Drop to remove")

    await removeTarget.dispatchEvent("dragenter", { dataTransfer })
    await expect(removeTarget).toContainText("Drop here to remove")
    await removeTarget.dispatchEvent("drop", { dataTransfer })

    await expect(rows).toHaveCount(4)
    await expect(page.getByText("Afterlife Tulum 2025")).toHaveCount(0)
    await expect(mediaInput).toBeVisible()
    await expect(page.locator('[data-mqs-poof="true"]')).not.toHaveCount(0)'''
new_drag_body = '''    const rows = page.getByTestId("upcoming-row")
    const firstRow = rows.first()
    const mediaInput = page.getByRole("textbox", { name: "Media URL" })
    const queueActions = page.getByRole("button", { name: "Queue actions" })
    const composer = page.getByTestId("queue-composer")
    const inputBox = await mediaInput.boundingBox()
    const actionsBox = await queueActions.boundingBox()
    const composerBox = await composer.boundingBox()
    const dataTransfer = await page.evaluateHandle(() => new DataTransfer())

    expect(inputBox).not.toBeNull()
    expect(actionsBox).not.toBeNull()
    expect(composerBox).not.toBeNull()
    await expect(rows).toHaveCount(5)
    await firstRow.dispatchEvent("dragstart", { dataTransfer })

    const removeTarget = page.getByTestId("remove-drop-target")
    await expect(mediaInput).toHaveCount(0)
    await expect(queueActions).toBeVisible()
    await expect(removeTarget).toContainText("Drop to remove")

    const removeBox = await removeTarget.boundingBox()
    const dragActionsBox = await queueActions.boundingBox()
    const dragComposerBox = await composer.boundingBox()
    expect(removeBox).not.toBeNull()
    expect(dragActionsBox).not.toBeNull()
    expect(dragComposerBox).not.toBeNull()
    expect(Math.abs((removeBox?.width ?? 0) - (inputBox?.width ?? 0))).toBeLessThan(1)
    expect(Math.abs((removeBox?.height ?? 0) - (inputBox?.height ?? 0))).toBeLessThan(1)
    expect(Math.abs((dragActionsBox?.x ?? 0) - (actionsBox?.x ?? 0))).toBeLessThan(1)
    expect(Math.abs((dragActionsBox?.y ?? 0) - (actionsBox?.y ?? 0))).toBeLessThan(1)
    expect(Math.abs((dragComposerBox?.width ?? 0) - (composerBox?.width ?? 0))).toBeLessThan(1)
    expect(Math.abs((dragComposerBox?.height ?? 0) - (composerBox?.height ?? 0))).toBeLessThan(1)

    await removeTarget.dispatchEvent("dragenter", { dataTransfer })
    await expect(removeTarget).toContainText("Drop here to remove")
    const activeBox = await removeTarget.boundingBox()
    await removeTarget.dispatchEvent("drop", { dataTransfer })

    await expect(rows).toHaveCount(4)
    await expect(page.getByText("Afterlife Tulum 2025")).toHaveCount(0)
    await expect(mediaInput).toBeVisible()
    const poofOrigin = page.locator('[data-mqs-poof-origin="true"]')
    await expect(poofOrigin).toHaveCount(1)
    const poofPosition = await poofOrigin.evaluate((element) => ({
      left: Number.parseFloat((element as HTMLElement).style.left),
      top: Number.parseFloat((element as HTMLElement).style.top),
    }))
    expect(
      Math.abs(poofPosition.left - ((activeBox?.x ?? 0) + (activeBox?.width ?? 0) / 2))
    ).toBeLessThan(1)
    expect(
      Math.abs(poofPosition.top - ((activeBox?.y ?? 0) + (activeBox?.height ?? 0) / 2))
    ).toBeLessThan(1)'''
tests = replace_once(tests, old_drag_body, new_drag_body, "drag remove geometry test")

send_anchor = '''    const input = page.getByRole("textbox", { name: "Media URL" })

    await expect(
      page.getByRole("button", { name: "Queue actions" })
    ).toBeVisible()
    await input.focus()'''
send_replacement = '''    const input = page.getByRole("textbox", { name: "Media URL" })
    const queueActions = page.getByRole("button", { name: "Queue actions" })
    const composer = page.getByTestId("queue-composer")

    await expect(queueActions).toBeVisible()
    const dropdownBox = await queueActions.boundingBox()
    const composerBox = await composer.boundingBox()
    expect(dropdownBox).not.toBeNull()
    expect(composerBox).not.toBeNull()
    await input.focus()'''
tests = replace_once(tests, send_anchor, send_replacement, "send geometry setup")

send_visible_anchor = '''    await expect(
      page.getByRole("button", { name: "Add media to queue" })
    ).toBeVisible()

    await input.fill("https://example.com/focused-send")'''
send_visible_replacement = '''    const sendButton = page.getByRole("button", { name: "Add media to queue" })
    await expect(sendButton).toBeVisible()
    const sendBox = await sendButton.boundingBox()
    const focusedComposerBox = await composer.boundingBox()
    expect(sendBox).not.toBeNull()
    expect(focusedComposerBox).not.toBeNull()
    expect(Math.abs((sendBox?.x ?? 0) - (dropdownBox?.x ?? 0))).toBeLessThan(1)
    expect(Math.abs((sendBox?.y ?? 0) - (dropdownBox?.y ?? 0))).toBeLessThan(1)
    expect(Math.abs((sendBox?.width ?? 0) - (dropdownBox?.width ?? 0))).toBeLessThan(1)
    expect(Math.abs((sendBox?.height ?? 0) - (dropdownBox?.height ?? 0))).toBeLessThan(1)
    expect(Math.abs((focusedComposerBox?.width ?? 0) - (composerBox?.width ?? 0))).toBeLessThan(1)
    expect(Math.abs((focusedComposerBox?.height ?? 0) - (composerBox?.height ?? 0))).toBeLessThan(1)

    await input.fill("https://example.com/focused-send")'''
tests = replace_once(tests, send_visible_anchor, send_visible_replacement, "send geometry assertions")

insert_before = '  test("previews a setlist and replaces the queue in paused state", async ({'
extra_tests = '''  test("removes the Last Played section entirely when history is empty", async ({
    page,
  }) => {
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
    await expect(page.getByTestId("last-played-section")).toHaveCount(0)
    await expect(page.getByRole("heading", { name: "Last Played" })).toHaveCount(0)
  })

  test("fills its host height and keeps long queues scrolling inside Up Next", async ({
    page,
  }) => {
    const file = {
      version: "1.0",
      name: "Long queue",
      segments: Array.from({ length: 32 }, (_, index) => ({
        title: `Queue item ${index + 1}`,
        url: `https://example.com/media-${index + 1}`,
        platform: "Web",
        duration: 5,
      })),
    }

    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "long-queue.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(file)),
    })
    await page.getByRole("button", { name: "Replace queue" }).click()

    const metrics = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="mqs-container"]') as HTMLElement
      const modal = document.querySelector('[data-testid="mqs-modal"]') as HTMLElement
      const upNext = document.querySelector('[data-testid="up-next-scroll"]') as HTMLElement
      const containerStyle = getComputedStyle(container)
      const modalStyle = getComputedStyle(modal)
      const upNextStyle = getComputedStyle(upNext)
      const containerRect = container.getBoundingClientRect()
      const modalRect = modal.getBoundingClientRect()
      return {
        availableHeight:
          containerRect.height -
          Number.parseFloat(containerStyle.paddingTop) -
          Number.parseFloat(containerStyle.paddingBottom),
        modalHeight: modalRect.height,
        modalOverflowY: modalStyle.overflowY,
        upNextClientHeight: upNext.clientHeight,
        upNextScrollHeight: upNext.scrollHeight,
        upNextOverflowY: upNextStyle.overflowY,
      }
    })

    expect(Math.abs(metrics.modalHeight - metrics.availableHeight)).toBeLessThan(1)
    expect(metrics.modalOverflowY).toBe("hidden")
    expect(metrics.upNextOverflowY).toBe("auto")
    expect(metrics.upNextScrollHeight).toBeGreaterThan(metrics.upNextClientHeight)
    await expect(page.getByTestId("upcoming-row")).toHaveCount(31)
  })

''' + insert_before
tests = replace_once(tests, insert_before, extra_tests, "modal integrity tests")

test_path.write_text(tests)
