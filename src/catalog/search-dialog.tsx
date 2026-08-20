import * as React from "react"
import { Search } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

export interface SearchEntry {
  href: string
  label: string
  group: string
  description?: string
}

export function SearchDialog({
  open,
  onOpenChange,
  entries,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  entries: SearchEntry[]
}) {
  const [query, setQuery] = React.useState("")

  React.useEffect(() => {
    if (!open) setQuery("")
  }, [open])

  const normalizedQuery = query.trim().toLowerCase()
  const results = normalizedQuery
    ? entries.filter((entry) =>
        [entry.label, entry.group, entry.description]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalizedQuery))
      )
    : entries

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[18%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogTitle className="sr-only">Search Hubzz UI</DialogTitle>
        <DialogDescription className="sr-only">
          Search foundations, components, and patterns in the public catalog.
        </DialogDescription>

        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the system…"
            aria-label="Search Hubzz UI"
            className="h-12 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            Esc
          </kbd>
        </div>

        <div className="max-h-[420px] overflow-y-auto p-2">
          {results.length ? (
            results.map((entry) => (
              <a
                key={`${entry.group}-${entry.href}`}
                href={entry.href}
                onClick={() => onOpenChange(false)}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 outline-none transition-colors hover:bg-accent focus-visible:bg-accent"
              >
                <span className="mt-0.5 w-20 shrink-0 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  {entry.group}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-foreground">
                    {entry.label}
                  </span>
                  {entry.description ? (
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {entry.description}
                    </span>
                  ) : null}
                </span>
              </a>
            ))
          ) : (
            <div className="px-3 py-10 text-center text-sm text-muted-foreground">
              No matching catalog entry.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
