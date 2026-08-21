import * as React from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type AvatarPickerDensity = "auto" | "small" | "medium" | "large"

export interface AvatarPickerItem {
  id: string
  name: string
  imageSrc: string
  imageAlt?: string
  disabled?: boolean
}

export interface AvatarPickerProps
  extends Omit<React.ComponentProps<"div">, "onChange"> {
  items: AvatarPickerItem[]
  value?: string
  onValueChange?: (value: string, item: AvatarPickerItem) => void
  density?: AvatarPickerDensity
  label?: string
  loading?: boolean
  loadingMessage?: React.ReactNode
  emptyMessage?: React.ReactNode
}

const densityClasses: Record<Exclude<AvatarPickerDensity, "auto">, string> = {
  small: "size-16",
  medium: "size-32",
  large: "size-48",
}

function resolveDensity(
  density: AvatarPickerDensity,
  itemCount: number
): Exclude<AvatarPickerDensity, "auto"> {
  if (density !== "auto") return density
  if (itemCount <= 3) return "large"
  if (itemCount <= 10) return "medium"
  return "small"
}

export function AvatarPicker({
  items,
  value,
  onValueChange,
  density = "auto",
  label = "Choose an avatar",
  loading = false,
  loadingMessage = "Loading avatars…",
  emptyMessage = "No avatars available.",
  className,
  ...props
}: AvatarPickerProps) {
  const resolvedDensity = resolveDensity(density, items.length)
  const groupName = React.useId()

  return (
    <div
      data-slot="avatar-picker"
      data-density={resolvedDensity}
      aria-busy={loading || undefined}
      className={cn(
        "w-full rounded-xl border border-border bg-card text-card-foreground",
        className
      )}
      {...props}
    >
      {loading ? (
        <div
          role="status"
          aria-live="polite"
          className="flex min-h-48 flex-col items-center justify-center gap-4 p-4"
        >
          <span className="sr-only">{loadingMessage}</span>
          <div
            aria-hidden="true"
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton
                key={index}
                className={cn("rounded-md", densityClasses[resolvedDensity])}
              />
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="flex min-h-48 items-center justify-center p-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div
          role="radiogroup"
          aria-label={label}
          className="flex max-h-[min(70vh,600px)] flex-wrap items-center justify-center gap-2 overflow-y-auto p-4"
        >
          {items.map((item) => {
            const selected = item.id === value

            return (
              <label
                key={item.id}
                data-slot="avatar-picker-option"
                data-state={selected ? "checked" : "unchecked"}
                className={cn(
                  "relative shrink-0 cursor-pointer overflow-hidden rounded-md border border-border bg-muted text-left transition-[border-color,box-shadow,opacity] select-none hover:border-foreground/40",
                  selected && "border-primary ring-2 ring-primary/60",
                  item.disabled && "cursor-not-allowed opacity-40",
                  densityClasses[resolvedDensity]
                )}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={item.id}
                  checked={selected}
                  disabled={item.disabled}
                  className="peer sr-only"
                  onChange={() => onValueChange?.(item.id, item)}
                />
                <span className="pointer-events-none absolute inset-0 rounded-md peer-focus-visible:ring-4 peer-focus-visible:ring-ring/30" />
                <img
                  src={item.imageSrc}
                  alt={item.imageAlt ?? ""}
                  draggable={false}
                  className="h-full w-full object-cover select-none"
                />
                <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-2 py-1 text-center text-xs font-medium text-white">
                  {item.name}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
