import * as React from "react"
import {
  Box,
  CheckCircle2,
  Github,
  Layers3,
  Moon,
  Search,
  ShieldCheck,
  Sun,
} from "lucide-react"

import { CopyCommand } from "@/catalog/copy-command"
import { SearchDialog, type SearchEntry } from "@/catalog/search-dialog"
import { useTheme } from "@/catalog/theme-provider"
import { HubzzLogo } from "@/components/hubzz/hubzz-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { allExamples } from "@/examples"
import { Catalog } from "@/pages/Catalog"
import { Foundations } from "@/pages/Foundations"

const NAV = [
  { href: "#overview", label: "Overview" },
  { href: "#foundations", label: "Foundations" },
  { href: "#upstream", label: "Primitives" },
  { href: "#overrides", label: "Overrides" },
  { href: "#components", label: "Components" },
  { href: "#patterns", label: "Patterns" },
]

const BASE_COMMAND = "pnpm dlx shadcn@latest add russfranky/hubzzcn/hubzz"

const COMPONENT_ENTRIES: SearchEntry[] = allExamples.map((module) => {
  const meta = (
    module as {
      meta: {
        title: string
        slug?: string
        layer?: string
        description: string
      }
    }
  ).meta

  return {
    href: `#${meta.slug ?? meta.title.toLowerCase()}`,
    label: meta.title,
    group: meta.layer ?? "component",
    description: meta.description,
  }
})

const SEARCH_ENTRIES: SearchEntry[] = [
  {
    href: "#overview",
    label: "Overview",
    group: "system",
    description: "Principles, install path, and system status.",
  },
  {
    href: "#foundations",
    label: "Foundations",
    group: "system",
    description: "Semantic tokens and theming contract.",
  },
  {
    href: "#upstream",
    label: "Upstream primitives",
    group: "system",
    description: "Commodity UI that stays with shadcn.",
  },
  ...COMPONENT_ENTRIES,
]

const PRINCIPLES = [
  {
    icon: Layers3,
    title: "Upstream first",
    description: "Keep commodity interaction contracts with shadcn and Radix.",
  },
  {
    icon: Box,
    title: "Source registry",
    description:
      "Install public source directly from GitHub with the shadcn CLI.",
  },
  {
    icon: ShieldCheck,
    title: "Accessible by default",
    description: "WCAG A/AA checks run across dark and light catalog themes.",
  },
  {
    icon: CheckCircle2,
    title: "Consumer verified",
    description:
      "Registry items are installed and built in a clean Vite project in CI.",
  },
]

export function Landing() {
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "k" ||
        !(event.metaKey || event.ctrlKey)
      ) {
        return
      }

      event.preventDefault()
      setSearchOpen((current) => !current)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="min-h-svh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-sidebar/90 backdrop-blur-xl md:flex">
        <div className="flex h-14 items-center border-b border-border px-4">
          <a href="#overview" className="flex items-center gap-2.5">
            <HubzzLogo size={24} />
            <span className="text-sm font-semibold tracking-tight">
              Hubzz UI
            </span>
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[9px]">
              beta
            </Badge>
          </a>
        </div>

        <div className="p-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          >
            <Search className="size-3.5" aria-hidden="true" />
            <span className="flex-1">Search</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        <nav className="flex-1 px-3 py-2" aria-label="Catalog navigation">
          <p className="mb-2 px-2 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Catalog
          </p>
          <div className="space-y-0.5">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex h-8 items-center rounded-md px-2 text-[13px] text-secondary-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:bg-sidebar-accent focus-visible:outline-none"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        <div className="border-t border-border p-3">
          <div className="mb-3 flex items-center gap-2 px-2 text-[11px] text-muted-foreground">
            <span
              className="size-1.5 rounded-full bg-emerald-400"
              aria-hidden="true"
            />
            Public source registry
          </div>
          <a
            href="https://github.com/russfranky/hubzzcn"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 items-center gap-2 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <Github className="size-3.5" aria-hidden="true" />
            Source on GitHub
          </a>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/88 px-4 backdrop-blur-xl sm:px-6">
          <a href="#overview" className="flex items-center gap-2 md:hidden">
            <HubzzLogo size={22} />
            <span className="text-sm font-semibold">Hubzz UI</span>
          </a>

          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
            <span>Design system</span>
            <span aria-hidden="true">/</span>
            <span className="text-foreground">Catalog</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="hidden gap-2 text-muted-foreground sm:flex md:hidden"
            >
              <Search className="size-3.5" aria-hidden="true" />
              Search
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Toggle color theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun aria-hidden="true" />
              ) : (
                <Moon aria-hidden="true" />
              )}
            </Button>
            <Button variant="ghost" size="icon-sm" asChild>
              <a
                href="https://github.com/russfranky/hubzzcn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Hubzz UI source on GitHub"
              >
                <Github aria-hidden="true" />
              </a>
            </Button>
          </div>
        </header>

        <main>
          <section
            id="overview"
            className="scroll-mt-16 border-b border-border"
          >
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18">
              <div className="max-w-3xl">
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <Badge variant="outline">Public registry</Badge>
                  <span className="text-xs text-muted-foreground">
                    Radix base · React · Tailwind CSS
                  </span>
                </div>
                <h1 className="text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl">
                  Hubzz UI
                </h1>
                <p className="mt-4 max-w-2xl text-[15px] leading-7 text-secondary-foreground sm:text-base">
                  A shadcn-first interface system. Keep upstream behavior,
                  define the brand with semantic tokens, and own custom source
                  only when Hubzz owns the interaction.
                </p>
              </div>

              <div className="mt-8 max-w-3xl">
                <CopyCommand
                  command={BASE_COMMAND}
                  label="Copy base install command"
                />
              </div>

              <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
                {PRINCIPLES.map((principle) => {
                  const Icon = principle.icon
                  return (
                    <div key={principle.title} className="bg-background p-4">
                      <Icon
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      <h2 className="mt-4 text-sm font-medium">
                        {principle.title}
                      </h2>
                      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                        {principle.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <div className="mx-auto max-w-6xl space-y-24 px-5 py-16 sm:px-8 sm:py-20">
            <Foundations />
            <Catalog />
          </div>
        </main>

        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p>Hubzz UI · MIT · public shadcn source registry</p>
            <p>Upstream first · semantic theme · composable source</p>
          </div>
        </footer>
      </div>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        entries={SEARCH_ENTRIES}
      />
    </div>
  )
}
