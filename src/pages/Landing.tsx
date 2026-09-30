import * as React from "react"
import {
  Box,
  CheckCircle2,
  Code2,
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
import { cn } from "@/lib/utils"
import { Catalog } from "@/pages/Catalog"
import { Foundations } from "@/pages/Foundations"

type ExampleMeta = {
  title: string
  slug?: string
  navLabel?: string
  layer?: string
  category?: string
  description?: string
}

function getMeta(module: unknown): ExampleMeta {
  return (module as { meta: ExampleMeta }).meta
}

function exampleSlug(meta: ExampleMeta) {
  return meta.slug ?? meta.title.toLowerCase()
}

function exampleNavLabel(meta: ExampleMeta) {
  return meta.navLabel ?? meta.title
}

const SECTION_NAV = [
  { href: "#overview", label: "Overview", id: "overview" },
  { href: "#foundations", label: "Foundations", id: "foundations" },
  { href: "#upstream", label: "Primitives", id: "upstream" },
  { href: "#overrides", label: "Overrides", id: "overrides" },
  { href: "#components", label: "Components", id: "components" },
  { href: "#patterns", label: "Patterns", id: "patterns" },
] as const

const COMPONENT_NAV = allExamples
  .map(getMeta)
  .filter((meta) => (meta.layer ?? "component") === "component")
  .map((meta) => ({
    href: `#${exampleSlug(meta)}`,
    label: exampleNavLabel(meta),
    id: exampleSlug(meta),
  }))

const COMPONENT_ENTRIES: SearchEntry[] = allExamples.map((module) => {
  const meta = getMeta(module)

  const description =
    meta.layer === "override"
      ? "Hubzz override"
      : meta.layer === "pattern"
        ? "Hubzz pattern"
        : meta.category === "shadcn"
          ? "shadcn primitive"
          : "Hubzz component"

  return {
    href: `#${exampleSlug(meta)}`,
    label: meta.title,
    group: meta.layer ?? "component",
    description,
  }
})

const SEARCH_ENTRIES: SearchEntry[] = [
  {
    href: "#overview",
    label: "Overview",
    group: "system",
    description: "Registry status and system metadata.",
  },
  {
    href: "#foundations",
    label: "Foundations",
    group: "system",
    description: "Semantic tokens and theme values.",
  },
  {
    href: "#upstream",
    label: "Upstream primitives",
    group: "system",
    description: "Checked-in shadcn/Radix primitive ownership.",
  },
  ...COMPONENT_ENTRIES,
]

const PRINCIPLES = [
  {
    icon: Layers3,
    title: "Upstream base",
    description:
      "Commodity interaction contracts remain with shadcn and Radix.",
  },
  {
    icon: Box,
    title: "Source registry",
    description:
      "Public source is distributed through GitHub and the shadcn CLI.",
  },
  {
    icon: ShieldCheck,
    title: "Accessibility",
    description: "WCAG A/AA checks cover light and dark catalog themes.",
  },
  {
    icon: CheckCircle2,
    title: "Consumer verification",
    description:
      "Registry items are installed and built in a clean Vite project in CI.",
  },
]

const BASE_COMMAND = "pnpm dlx shadcn@latest add russfranky/hubzzcn/hubzz"

const SCROLLSPY_IDS = [
  "overview",
  "foundations",
  "upstream",
  "overrides",
  "components",
  "patterns",
  ...COMPONENT_NAV.map((item) => item.id),
]

function useSectionScrollspy(sectionIds: string[], defaultId: string) {
  const [activeId, setActiveId] = React.useState(defaultId)

  React.useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const visibility = new Map<string, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0
          )
        }

        // Near top of page → Overview
        if (window.scrollY < 80) {
          setActiveId(defaultId)
          return
        }

        let bestId = defaultId
        let bestRatio = 0

        for (const id of sectionIds) {
          const ratio = visibility.get(id) ?? 0
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = id
          }
        }

        setActiveId(bestId)
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [sectionIds, defaultId])

  return activeId
}

function NavLink({
  href,
  label,
  active,
  nested = false,
}: {
  href: string
  label: string
  active: boolean
  nested?: boolean
}) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-8 items-center rounded-md text-[13px] transition-colors focus-visible:outline-none",
        nested ? "px-2" : "px-2",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-foreground"
          : "text-secondary-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:bg-sidebar-accent"
      )}
    >
      {label}
    </a>
  )
}

export function Landing() {
  const { theme, setTheme } = useTheme()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const activeId = useSectionScrollspy(SCROLLSPY_IDS, "overview")

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
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-sidebar/90 backdrop-blur-xl md:flex">
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
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

        <div className="shrink-0 p-3">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
          >
            <Search className="size-3.5" aria-hidden="true" />
            <span className="flex-1">Search</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px] text-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        <nav
          className="flex-1 overflow-y-auto px-3 pb-6"
          aria-label="Catalog navigation"
        >
          <p className="mb-2 px-2 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
            Catalog
          </p>
          <div className="space-y-0.5">
            {SECTION_NAV.map((item) => {
              if (item.id === "components") {
                return (
                  <div key={item.href} className="pt-0.5">
                    <NavLink
                      href={item.href}
                      label={item.label}
                      active={activeId === item.id}
                    />
                    <div className="mt-0.5 ml-3 space-y-0.5 border-l border-border pl-2">
                      {COMPONENT_NAV.map((child) => (
                        <NavLink
                          key={child.href}
                          href={child.href}
                          label={child.label}
                          active={activeId === child.id}
                          nested
                        />
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  active={activeId === item.id}
                />
              )
            })}
          </div>
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/88 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
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
                <Code2 aria-hidden="true" />
              </a>
            </Button>
          </div>
        </header>

        <main>
          <section
            id="overview"
            className="scroll-mt-16 border-b border-border"
          >
            <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-18 lg:px-10">
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
                  A shadcn-first interface system with semantic Hubzz tokens,
                  public source registry items, and product-specific components.
                </p>
              </div>

              <div className="mt-8 max-w-3xl">
                <CopyCommand
                  command={BASE_COMMAND}
                  label="Copy base install command"
                />
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PRINCIPLES.map((principle) => {
                  const Icon = principle.icon
                  return (
                    <div
                      key={principle.title}
                      className="rounded-xl border border-border bg-card p-5"
                    >
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

          <div className="mx-auto max-w-6xl space-y-24 px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
            <Foundations />
            <Catalog />
          </div>
        </main>
      </div>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        entries={SEARCH_ENTRIES}
      />
    </div>
  )
}
