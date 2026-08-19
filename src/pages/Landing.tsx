import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Catalog } from "@/pages/Catalog"
import { allExamples } from "@/examples"
import { useTheme } from "@/components/theme-provider"
import { HubzzLogo } from "@/components/hubzz-logo"
import { Sun, Moon, ArrowRight } from "lucide-react"

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

const NAV_LINKS = allExamples.map((mod: { meta: { slug?: string; title: string; navLabel?: string } }) => ({
  href: `#${mod.meta.slug ?? mod.meta.title.toLowerCase()}`,
  label: mod.meta.navLabel ?? mod.meta.title,
}))

export function Landing() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 text-primary">
              <HubzzLogo variant="icon" size={28} />
              <span className="text-lg font-bold">Hubzz UI</span>
            </a>
            <nav className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="/cn/app"
                className="text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                App
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" asChild>
              <a
                href="https://github.com/russfranky/hubzzcn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon className="size-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="hero-glow" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-24 text-center sm:py-32">
          <Badge variant="outline" className="mb-6">
            Design System
          </Badge>
          <h1 className="font-display text-5xl font-bold tracking-tight text-card-foreground sm:text-6xl lg:text-7xl">
            Build with{" "}
            <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              Hubzz UI
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Hubzz-branded components on shadcn/ui. Browse live examples below — see{" "}
            <code className="text-sm">docs/COMPONENTS.md</code> for the package API.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" className="group" asChild>
              <a href={NAV_LINKS[0]?.href ?? "#catalog"}>
                Browse components
                <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href="https://github.com/russfranky/hubzzcn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon className="mr-2 size-4" />
                Source
              </a>
            </Button>
          </div>
        </div>
      </section>

      <main id="catalog" className="mx-auto max-w-6xl px-6 pb-20">
        <Catalog />
      </main>

      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10">
          <div>
            <p className="text-sm font-semibold text-card-foreground">Hubzz UI</p>
            <p className="mt-1 text-xs text-muted-foreground">Built with shadcn/ui and Tailwind CSS</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Press <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">D</kbd> to toggle theme
          </p>
        </div>
      </footer>
    </div>
  )
}
