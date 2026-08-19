import { ArrowRight, Check, Copy, Moon, Sun } from "lucide-react"

import { useTheme } from "@/catalog/theme-provider"
import { HubzzLogo } from "@/components/hubzz/hubzz-logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Catalog } from "@/pages/Catalog"
import { Foundations } from "@/pages/Foundations"

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  )
}

const NAV = [
  { href: "#foundations", label: "Foundations" },
  { href: "#upstream", label: "Primitives" },
  { href: "#overrides", label: "Overrides" },
  { href: "#components", label: "Components" },
  { href: "#patterns", label: "Patterns" },
]

const BASE_COMMAND = "npx shadcn@latest add russfranky/hubzzcn/hubzz"
const COMPONENT_COMMAND =
  "npx shadcn@latest add russfranky/hubzzcn/event-ticket"

export function Landing() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <a href="#top" className="flex items-center gap-2 text-primary">
              <HubzzLogo size={27} />
              <span className="font-semibold text-foreground">Hubzz UI</span>
            </a>
            <nav className="hidden items-center gap-5 lg:flex" aria-label="Catalog">
              {NAV.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Toggle color theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun aria-hidden="true" />
              ) : (
                <Moon aria-hidden="true" />
              )}
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/russfranky/hubzzcn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Hubzz UI source on GitHub"
              >
                <GitHubIcon className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="hero-glow" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="max-w-4xl">
              <Badge variant="outline">Public shadcn registry</Badge>
              <h1 className="mt-6 max-w-4xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Use the upstream.
                <span className="block text-primary">Own the Hubzz layer.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Hubzz UI keeps standard shadcn/Radix behavior for commodity UI,
                applies the brand through semantic tokens, and publishes custom
                source only where the product actually owns the interaction.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <a href="#foundations">
                    Explore the system
                    <ArrowRight aria-hidden="true" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a
                    href="https://github.com/russfranky/hubzzcn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GitHubIcon className="size-4" />
                    Source
                  </a>
                </Button>
              </div>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-2">
              <InstallCard
                label="Start with the Hubzz base"
                command={BASE_COMMAND}
              />
              <InstallCard
                label="Add one Hubzz component"
                command={COMPONENT_COMMAND}
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-24 px-4 py-20 sm:px-6">
          <Foundations />
          <Catalog />
        </div>
      </main>

      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-10 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>Hubzz UI · public shadcn source registry · MIT licensed</p>
          <p>Radix base · React · Tailwind CSS</p>
        </div>
      </footer>
    </div>
  )
}

function InstallCard({ label, command }: { label: string; command: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Check className="size-4 text-primary" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-3">
        <code className="min-w-0 flex-1 overflow-x-auto font-mono text-xs text-muted-foreground">
          {command}
        </code>
        <Copy className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>
    </div>
  )
}
