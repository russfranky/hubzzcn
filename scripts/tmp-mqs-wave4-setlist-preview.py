from pathlib import Path
import re

page_path = Path("src/pages/MqsPrototype.tsx")
test_path = Path("tests/mqs-prototype.spec.ts")
page = page_path.read_text()
tests = test_path.read_text()

page = page.replace(
'''type SetlistSegment = {
  title?: unknown
  url?: unknown
  platform?: unknown
  duration?: unknown
}

type PendingSetlist = {
  items: QueueItem[]
  dropped: number
}
''',
'''type SetlistSegment = {
  title?: unknown
  type?: unknown
  url?: unknown
  platform?: unknown
  duration?: unknown
}

type PendingSetlist = {
  data: unknown
  fileName: string
  count: number
  totalMinutes: number
  cappedCount: number
}
''',
1,
)

new_helpers = r'''function formatRuntimeMinutes(minutes: number) {
  const rounded = Math.round(minutes)
  if (rounded < 60) return `${rounded}m`
  const hours = Math.floor(rounded / 60)
  const rest = rounded % 60
  return `${hours}h${rest ? ` ${rest}m` : ""}`
}

function inspectSetlist(fileName: string, value: unknown): PendingSetlist | null {
  const record =
    value && typeof value === "object" ? (value as Record<string, unknown>) : null
  const segments = Array.isArray(record?.segments) ? record.segments : null
  if (!segments || segments.length === 0) return null

  const totalMinutes = segments.reduce((sum, segment) => {
    if (!segment || typeof segment !== "object") return sum
    const duration = Number((segment as Record<string, unknown>).duration)
    return sum + (Number.isFinite(duration) && duration > 0 ? duration : 0)
  }, 0)

  return {
    data: value,
    fileName,
    count: segments.length,
    totalMinutes,
    cappedCount: Math.min(segments.length, SETLIST_LIMIT),
  }
}

function materializeSetlist(value: unknown): QueueItem[] {
  const record =
    value && typeof value === "object" ? (value as Record<string, unknown>) : null
  if (!Array.isArray(record?.segments)) return []

  return record.segments
    .slice(0, SETLIST_LIMIT)
    .flatMap((rawSegment, index) => {
      if (!rawSegment || typeof rawSegment !== "object") return []
      const segment = rawSegment as SetlistSegment
      const type = typeof segment.type === "string" ? segment.type : ""
      const url = typeof segment.url === "string" ? segment.url : ""

      // Mirror the current engine boundary for this standalone simulation:
      // native rows may omit a URL; every other row needs safe http(s).
      if (type !== "native" && !isSafeHttpUrl(url)) return []

      const durationMinutes = Number(segment.duration)
      const durationSeconds =
        Number.isFinite(durationMinutes) && durationMinutes > 0
          ? Math.round(durationMinutes * 60)
          : undefined
      const platform =
        typeof segment.platform === "string" && segment.platform.trim()
          ? segment.platform.trim()
          : type === "native"
            ? "Native"
            : providerFromUrl(url)

      return [
        {
          id: `upload-${Date.now()}-${index}`,
          title:
            typeof segment.title === "string" && segment.title.trim()
              ? segment.title.trim()
              : "Untitled",
          url,
          platform,
          addedBy: "@you",
          durationSeconds,
        } satisfies QueueItem,
      ]
    })
}

'''
page, count = re.subn(
    r'function normalizeSetlist\(value: unknown\): PendingSetlist \{.*?\n\}\n\n(?=export function MqsPrototype\(\))',
    new_helpers,
    page,
    count=1,
    flags=re.S,
)
if count != 1:
    raise SystemExit(f"normalizeSetlist replacement count: {count}")

page = page.replace(
'''  const [pendingSetlist, setPendingSetlist] =
    React.useState<PendingSetlist | null>(null)
  const [stopOpen, setStopOpen] = React.useState(false)
''',
'''  const [pendingSetlist, setPendingSetlist] =
    React.useState<PendingSetlist | null>(null)
  const [setlistOpen, setSetlistOpen] = React.useState(false)
  const [setlistError, setSetlistError] = React.useState<string | null>(null)
  const [stopOpen, setStopOpen] = React.useState(false)
''',
1,
)

old_read = '''  async function readSetlist(file: File) {
    try {
      setPendingSetlist(
        normalizeSetlist(JSON.parse(await file.text()) as unknown)
      )
      setError(null)
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not read setlist."
      )
    }
  }

  function replaceWithSetlist() {
    if (!pendingSetlist?.items.length) return
    const [nextCurrent, ...nextUpcoming] = pendingSetlist.items
    setPlayed([])
    setCurrent(nextCurrent)
    setUpcoming(nextUpcoming)
    setElapsed(0)
    setIsPlaying(false)
    setPendingSetlist(null)
  }
'''
new_read = '''  async function readSetlist(file: File) {
    let text: string
    try {
      text = await file.text()
    } catch {
      setPendingSetlist(null)
      setSetlistError("The setlist file could not be read.")
      setSetlistOpen(true)
      return
    }

    try {
      const data = JSON.parse(text) as unknown
      const preview = inspectSetlist(file.name, data)
      if (!preview) {
        setPendingSetlist(null)
        setSetlistError("This file does not contain any setlist segments.")
        setSetlistOpen(true)
        return
      }

      setPendingSetlist(preview)
      setSetlistError(null)
      setSetlistOpen(true)
    } catch {
      setPendingSetlist(null)
      setSetlistError("That file is not valid setlist JSON.")
      setSetlistOpen(true)
    }
  }

  function replaceWithSetlist() {
    if (!pendingSetlist) return
    const [nextCurrent, ...nextUpcoming] = materializeSetlist(
      pendingSetlist.data
    )
    setPlayed([])
    setCurrent(nextCurrent ?? null)
    setUpcoming(nextUpcoming)
    setElapsed(0)
    setIsPlaying(Boolean(nextCurrent))
    setPendingSetlist(null)
    setSetlistError(null)
    setSetlistOpen(false)
  }
'''
if old_read not in page:
    raise SystemExit("read/replace setlist anchor not found")
page = page.replace(old_read, new_read, 1)

old_menu = '''                <DropdownMenuItem
                  onSelect={() => fileInputRef.current?.click()}
                >
                  <Upload />
                  Load setlist
                </DropdownMenuItem>
'''
new_menu = '''                <DropdownMenuItem
                  onSelect={() => {
                    setPendingSetlist(null)
                    setSetlistError(null)
                    setSetlistOpen(true)
                  }}
                >
                  <Upload />
                  Load setlist
                </DropdownMenuItem>
'''
if old_menu not in page:
    raise SystemExit("load-setlist menu anchor not found")
page = page.replace(old_menu, new_menu, 1)

old_dialog = '''      <Dialog
        open={Boolean(pendingSetlist)}
        onOpenChange={(open) => {
          if (!open) setPendingSetlist(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load setlist</DialogTitle>
            <DialogDescription>
              {pendingSetlist
                ? `${pendingSetlist.items.length} valid segments · ${pendingSetlist.dropped} invalid or capped`
                : "Review the setlist before replacing the queue."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingSetlist(null)}>
              Cancel
            </Button>
            <Button onClick={replaceWithSetlist}>Replace queue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
'''
new_dialog = '''      <Dialog
        open={setlistOpen}
        onOpenChange={(open) => {
          setSetlistOpen(open)
          if (!open) {
            setPendingSetlist(null)
            setSetlistError(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Load prepared setlist</DialogTitle>
            <DialogDescription>
              Choose a JSON export from Playlister, review how it joins the live
              queue, then commit it.
            </DialogDescription>
          </DialogHeader>

          {!pendingSetlist ? (
            <button
              data-testid="setlist-dropzone"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                const file = event.dataTransfer.files?.[0]
                if (file) void readSetlist(file)
              }}
              className={cn(
                "flex min-h-32 w-full flex-col items-center justify-center rounded-md border bg-muted/50 px-4 text-center transition-colors hover:bg-muted",
                setlistError && "border-destructive"
              )}
            >
              <Upload className="mb-2 size-5" aria-hidden="true" />
              <span className="text-sm font-medium">
                Drop a .json setlist here
              </span>
              <span className="mt-1 text-xs text-muted-foreground">
                or click to browse
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <div
                data-testid="setlist-preview"
                className="rounded-md border bg-muted/30 p-3"
              >
                <div className="text-sm font-medium">
                  {pendingSetlist.fileName}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {pendingSetlist.count} segment
                  {pendingSetlist.count === 1 ? "" : "s"}
                  {pendingSetlist.totalMinutes > 0
                    ? ` · ${formatRuntimeMinutes(pendingSetlist.totalMinutes)}`
                    : ""}
                </div>
                {pendingSetlist.count > pendingSetlist.cappedCount ? (
                  <div className="mt-1 text-xs text-muted-foreground">
                    The live import is capped at the first {pendingSetlist.cappedCount}{" "}
                    segments.
                  </div>
                ) : null}
              </div>

              <div className="text-xs text-muted-foreground">
                This setlist will replace the live queue and start from its first
                segment.
              </div>
            </div>
          )}

          {setlistError ? (
            <div role="alert" className="text-sm text-destructive">
              {setlistError}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSetlistOpen(false)}>
              Cancel
            </Button>
            {pendingSetlist ? (
              <Button onClick={replaceWithSetlist}>Load setlist</Button>
            ) : (
              <Button onClick={() => fileInputRef.current?.click()}>
                Browse file
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
'''
if old_dialog not in page:
    raise SystemExit("setlist dialog anchor not found")
page = page.replace(old_dialog, new_dialog, 1)

# The long-queue test still uses the hidden file input directly; update only the
# commit button label to match the real live import dialog.
tests = tests.replace(
    'await page.getByRole("button", { name: "Replace queue" }).click()',
    'await page.getByRole("button", { name: "Load setlist" }).click()',
    1,
)

new_test = r'''  test("uses coarse server-authoritative setlist preview and auto-starts replace imports", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "Queue actions" }).click()
    await page.getByRole("menuitem", { name: "Load setlist" }).click()

    await expect(
      page.getByRole("heading", { name: "Load prepared setlist" })
    ).toBeVisible()
    await expect(page.getByTestId("setlist-dropzone")).toContainText(
      "Drop a .json setlist here"
    )
    await expect(page.getByRole("button", { name: "Browse file" })).toBeVisible()
    await expect(page.getByText("Append to queue")).toHaveCount(0)

    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{not-json"),
    })
    await expect(page.getByRole("alert")).toContainText(
      "That file is not valid setlist JSON."
    )

    const file = {
      version: "1.0",
      name: "Friday",
      exportedAt: "2026-08-27T00:00:00.000Z",
      segments: [
        {
          title: "Opening",
          type: "youtube",
          url: "https://youtu.be/example",
          platform: "YouTube",
          duration: 5,
        },
        {
          title: "Unsafe but still visible to coarse inspection",
          type: "website",
          url: "javascript:alert(1)",
          duration: 2,
        },
        {
          title: "Second",
          type: "twitch",
          url: "https://twitch.tv/example",
          platform: "Twitch",
          duration: 10,
        },
      ],
    }

    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "friday.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(file)),
    })

    const preview = page.getByTestId("setlist-preview")
    await expect(preview).toContainText("friday.json")
    await expect(preview).toContainText("3 segments · 17m")
    await expect(page.getByText(/valid segments|invalid or capped/)).toHaveCount(0)
    await expect(page.getByText(/replace the live queue and start from its first segment/i)).toBeVisible()
    await expect(page.getByText("Append to queue")).toHaveCount(0)

    await page.getByRole("button", { name: "Load setlist" }).click()

    await expect(page.getByTestId("current-row")).toContainText("Opening")
    await expect(page.getByTestId("upcoming-row")).toHaveCount(1)
    await expect(page.getByTestId("upcoming-row").first()).toContainText("Second")
    await expect(page.getByRole("button", { name: "Pause" })).toBeVisible()
    await expect(page.getByTestId("history-row")).toHaveCount(0)
  })

  test("shows the server 500-segment cap without pretending to validate rows", async ({
    page,
  }) => {
    const file = {
      version: "1.0",
      name: "Oversized",
      exportedAt: "2026-08-27T00:00:00.000Z",
      segments: Array.from({ length: 501 }, (_, index) => ({
        title: `Segment ${index + 1}`,
        type: "website",
        url: `https://example.com/${index + 1}`,
        duration: 1,
      })),
    }

    await page.getByRole("button", { name: "Queue actions" }).click()
    await page.getByRole("menuitem", { name: "Load setlist" }).click()
    await page.getByLabel("Setlist JSON file").setInputFiles({
      name: "oversized.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(file)),
    })

    const preview = page.getByTestId("setlist-preview")
    await expect(preview).toContainText("501 segments · 8h 21m")
    await expect(preview).toContainText(
      "The live import is capped at the first 500 segments."
    )
    await expect(page.getByText(/valid segments|invalid or capped/)).toHaveCount(0)
  })

'''
tests, test_count = re.subn(
    r'  test\("previews a setlist and replaces the queue in paused state".*?\n  \}\)\n\n(?=  test\("keeps destructive stop behind confirmation")',
    new_test,
    tests,
    count=1,
    flags=re.S,
)
if test_count != 1:
    raise SystemExit(f"setlist test replacement count: {test_count}")

page_path.write_text(page)
test_path.write_text(tests)
