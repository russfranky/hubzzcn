from pathlib import Path

page_path = Path("src/pages/MqsPrototype.tsx")
test_path = Path("tests/mqs-prototype.spec.ts")

page = page_path.read_text()
tests = test_path.read_text()

# Icons used by the empty and inline validation states.
old_import = '''import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Link2,
'''
new_import = '''import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Headphones,
  Link2,
'''
if old_import not in page:
    raise SystemExit("lucide import anchor not found")
page = page.replace(old_import, new_import, 1)

# Match the live pre-alpha parser's composer behavior: explicit http(s) URLs and
# bare domains normalize to https://. Keep regular websites supported too.
provider_block = '''function providerFromUrl(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\\./, "")
    if (host.includes("youtube") || host === "youtu.be") return "YouTube"
    if (host.includes("twitch")) return "Twitch"
    return host
  } catch {
    return "Web"
  }
}

function isSafeHttpUrl(value: string) {
'''
replacement_provider_block = '''function normalizeMediaUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const candidate =
    trimmed.startsWith("https://") || trimmed.startsWith("http://")
      ? trimmed
      : /^[a-zA-Z0-9]/.test(trimmed) &&
          trimmed.includes(".") &&
          !trimmed.includes(" ")
        ? `https://${trimmed}`
        : null

  if (!candidate) return null

  try {
    const parsed = new URL(candidate)
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null
    return parsed.href
  } catch {
    return null
  }
}

function providerFromUrl(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\\./, "")
    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be"
    ) {
      return "YouTube"
    }
    if (host === "twitch.tv") return "Twitch"
    if (host === "kick.com") return "Kick"
    return "Website"
  } catch {
    return "Website"
  }
}

function isSafeHttpUrl(value: string) {
'''
if provider_block not in page:
    raise SystemExit("provider helper anchor not found")
page = page.replace(provider_block, replacement_provider_block, 1)

add_block = '''  function addUrl(mode: "tail" | "next") {
    const trimmed = url.trim()
    if (!trimmed) return

    if (!isSafeHttpUrl(trimmed)) {
      setError("Use a valid http(s) media URL.")
      return
    }

    const item: QueueItem = {
      id: `url-${Date.now()}`,
      title: trimmed,
      url: trimmed,
      platform: providerFromUrl(trimmed),
      addedBy: "@you",
    }
'''
replacement_add_block = '''  function addUrl(mode: "tail" | "next") {
    const trimmed = url.trim()
    if (!trimmed) {
      setError("Paste a media URL to add it to the queue.")
      return
    }

    const normalizedUrl = normalizeMediaUrl(trimmed)
    if (!normalizedUrl) {
      setError(
        "Invalid URL. Try YouTube, Twitch, Kick, or another http(s) URL."
      )
      return
    }

    const item: QueueItem = {
      id: `url-${Date.now()}`,
      title: normalizedUrl,
      url: normalizedUrl,
      platform: providerFromUrl(normalizedUrl),
      addedBy: "@you",
    }
'''
if add_block not in page:
    raise SystemExit("addUrl anchor not found")
page = page.replace(add_block, replacement_add_block, 1)

empty_block = '''          ) : (
            <Card className="rounded-xl bg-card py-8 text-center text-muted-foreground ring-1 ring-border">
              Nothing is playing.
            </Card>
          )}
'''
replacement_empty_block = '''          ) : (
            <Card
              data-testid="empty-current-state"
              className="rounded-xl bg-card py-0 ring-1 ring-border"
            >
              <CardContent className="flex min-h-36 flex-col items-center justify-center px-6 py-7 text-center">
                <span className="mb-3 flex size-12 items-center justify-center rounded-full border border-border bg-secondary">
                  <Headphones
                    className="size-6 text-muted-foreground"
                    aria-hidden="true"
                  />
                </span>
                <span className="text-base font-semibold text-foreground">
                  Nothing playing
                </span>
                <span className="mt-1 max-w-56 text-sm leading-5 text-muted-foreground">
                  Paste a link below or load a setlist to start.
                </span>
              </CardContent>
            </Card>
          )}
'''
if empty_block not in page:
    raise SystemExit("empty current anchor not found")
page = page.replace(empty_block, replacement_empty_block, 1)

old_placeholder = 'placeholder="Paste YouTube or Twitch URL"'
new_placeholder = 'placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ…"'
if old_placeholder not in page:
    raise SystemExit("composer placeholder anchor not found")
page = page.replace(old_placeholder, new_placeholder, 1)

old_error = '''        {error ? (
          <p role="alert" className="px-8 pb-6 text-sm text-destructive">
            {error}
          </p>
        ) : null}
'''
new_error = '''        {error ? (
          <div
            data-testid="composer-error"
            role="alert"
            className="flex items-center gap-1.5 px-8 pb-6 text-xs font-medium text-destructive"
          >
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}
'''
if old_error not in page:
    raise SystemExit("composer error anchor not found")
page = page.replace(old_error, new_error, 1)

# Update the existing destructive-stop regression to assert the polished empty state.
old_stop_assert = '''    await expect(page.getByTestId("history-row")).toHaveCount(0)
    await expect(page.getByText("Nothing is playing.")).toBeVisible()
'''
new_stop_assert = '''    await expect(page.getByTestId("history-row")).toHaveCount(0)
    const empty = page.getByTestId("empty-current-state")
    await expect(empty).toBeVisible()
    await expect(empty).toContainText("Nothing playing")
    await expect(empty).toContainText(
      "Paste a link below or load a setlist to start."
    )
    await expect(empty.locator("svg.lucide-headphones")).toHaveCount(1)
'''
if old_stop_assert not in tests:
    raise SystemExit("stop empty-state assertion anchor not found")
tests = tests.replace(old_stop_assert, new_stop_assert, 1)

# Expand the existing URL regression instead of creating a second overlapping test.
old_url_test_start = '''  test("adds a safe URL with Enter and keeps actions inside the single menu", async ({
    page,
  }) => {
    const input = page.getByRole("textbox", { name: "Media URL" })

    await input.fill("javascript:alert(1)")
    await input.press("Enter")
    await expect(page.getByText("Use a valid http(s) media URL.")).toBeVisible()
    await expect(page.getByTestId("upcoming-row")).toHaveCount(5)

    await input.fill("https://example.com/media")
    await input.press("Enter")
    await expect(page.getByTestId("upcoming-row")).toHaveCount(6)
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "https://example.com/media"
    )
'''
new_url_test_start = '''  test("validates and normalizes composer URLs without narrowing the MQS contract", async ({
    page,
  }) => {
    const input = page.getByRole("textbox", { name: "Media URL" })
    await expect(input).toHaveAttribute(
      "placeholder",
      "https://youtube.com/watch?v=dQw4w9WgXcQ…"
    )

    await input.press("Enter")
    let error = page.getByTestId("composer-error")
    await expect(error).toContainText("Paste a media URL to add it to the queue.")
    await expect(error.locator("svg.lucide-triangle-alert")).toHaveCount(1)

    await input.fill("javascript:alert(1)")
    await input.press("Enter")
    error = page.getByTestId("composer-error")
    await expect(error).toContainText(
      "Invalid URL. Try YouTube, Twitch, Kick, or another http(s) URL."
    )
    await expect(page.getByTestId("upcoming-row")).toHaveCount(5)

    await input.fill("kick.com/example-live")
    await expect(page.getByTestId("composer-error")).toHaveCount(0)
    await input.press("Enter")
    await expect(page.getByTestId("upcoming-row")).toHaveCount(6)
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "https://kick.com/example-live"
    )
    await expect(page.getByTestId("upcoming-row").last()).toContainText("Kick")

    await input.fill("https://example.com/media")
    await input.press("Enter")
    await expect(page.getByTestId("upcoming-row")).toHaveCount(7)
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "https://example.com/media"
    )
    await expect(page.getByTestId("upcoming-row").last()).toContainText(
      "Website"
    )
'''
if old_url_test_start not in tests:
    raise SystemExit("URL regression anchor not found")
tests = tests.replace(old_url_test_start, new_url_test_start, 1)

page_path.write_text(page)
test_path.write_text(tests)
