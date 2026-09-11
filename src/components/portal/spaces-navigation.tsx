import { ArrowLeft, ListFilter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { isKnownHallwayFloor } from "@/lib/portal/data"
import type { SpaceScope } from "@/lib/portal/types"

export function ScreenHeader({
  count,
  onBack,
}: {
  count: number
  onBack: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-5 pb-4 max-[400px]:pr-12">
      <Button
        variant="ghost"
        type="button"
        size="icon-sm"
        aria-label="Back"
        onClick={onBack}
        className="shrink-0 rounded-full bg-white/5 text-foreground hover:bg-white/10 hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
      </Button>
      <span className="text-lg font-bold text-foreground">Spaces</span>
      <span className="ml-auto">
        <span className="text-[15px] font-semibold text-muted-foreground">
          {count}
        </span>
      </span>
    </div>
  )
}

export function SpacesToolbar({
  query,
  scope,
  onQueryChange,
  onScopeChange,
}: {
  query: string
  scope: SpaceScope
  onQueryChange: (value: string) => void
  onScopeChange: (scope: SpaceScope) => void
}) {
  const scopeValue =
    scope.kind === "hallway" ? `hallway-${scope.floor}` : scope.kind

  const chooseScope = (value: string) => {
    if (value === "portal") {
      onScopeChange({ kind: "portal" })
      return
    }

    if (value === "all") {
      onScopeChange({ kind: "all" })
      return
    }

    const hallwayMatch = /^hallway-(\d+)$/.exec(value)
    if (!hallwayMatch) return

    const floor = Number(hallwayMatch[1])
    if (isKnownHallwayFloor(floor)) {
      onScopeChange({ kind: "hallway", floor })
    }
  }

  return (
    <div className="px-4 pt-1 pb-4">
      <div className="flex items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search spaces"
            aria-label="Search spaces"
            className="pl-9 text-sm"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              type="button"
              size="icon-sm"
              aria-label="Filter spaces"
              className="rounded-full bg-white/5 text-foreground hover:bg-white/10 hover:text-foreground"
            >
              <ListFilter className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="hubzz-profile-panel-theme dark w-[220px] rounded-[12px] border border-white/5 bg-card p-1 shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.45)]"
          >
            <DropdownMenuRadioGroup
              value={scopeValue}
              onValueChange={chooseScope}
            >
              {scope.kind === "hallway" ? (
                <DropdownMenuRadioItem
                  value={`hallway-${scope.floor}`}
                  className="w-full rounded-[8px] px-3 py-2 text-[13px] leading-[20px] font-medium text-foreground focus:bg-muted"
                >
                  Hallway {scope.floor}
                </DropdownMenuRadioItem>
              ) : null}
              <DropdownMenuRadioItem
                value="portal"
                className="w-full rounded-[8px] px-3 py-2 text-[13px] leading-[20px] font-medium text-foreground focus:bg-muted"
              >
                Hubzz Tower Portal
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem
                value="all"
                className="w-full rounded-[8px] px-3 py-2 text-[13px] leading-[20px] font-medium text-foreground focus:bg-muted"
              >
                All spaces
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
