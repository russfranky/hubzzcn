import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface AvatarCarouselItem {
  id: string
  name: string
  imageSrc: string
  imageAlt?: string
}

export interface AvatarCarouselProps extends Omit<
  React.ComponentProps<"div">,
  "onChange"
> {
  items: AvatarCarouselItem[]
  value?: string
  onValueChange?: (value: string, item: AvatarCarouselItem) => void
  label?: string
  previousLabel?: string
  nextLabel?: string
}

type Direction = "previous" | "next"

function selectedIndexFor(items: AvatarCarouselItem[], value?: string) {
  if (!value) return 0
  const index = items.findIndex((item) => item.id === value)
  return index >= 0 ? index : 0
}

export function AvatarCarousel({
  items,
  value,
  onValueChange,
  label = "Choose an avatar",
  previousLabel = "Previous avatar",
  nextLabel = "Next avatar",
  className,
  ...props
}: AvatarCarouselProps) {
  const [lastDirection, setLastDirection] = React.useState<Direction>("next")

  if (items.length === 0) return null

  const selectedIndex = selectedIndexFor(items, value)
  const previousIndex = (selectedIndex - 1 + items.length) % items.length
  const nextIndex = (selectedIndex + 1) % items.length
  const selected = items[selectedIndex]
  const previous = items[previousIndex]
  const next = items[nextIndex]
  const canMove = items.length > 1

  const move = (direction: Direction) => {
    if (!canMove) return
    const nextItem = direction === "previous" ? previous : next
    setLastDirection(direction)
    onValueChange?.(nextItem.id, nextItem)
  }

  const slotClassName =
    "flex min-h-[clamp(120px,20vh,180px)] basis-[32%] items-center justify-center overflow-hidden rounded-lg transition-[transform,opacity] min-[480px]:basis-[28%]"
  const imageClassName =
    "pointer-events-none block h-auto max-h-[clamp(120px,24vh,200px)] w-full origin-center scale-[1.9] object-contain select-none"

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      data-slot="avatar-carousel"
      data-value={selected.id}
      data-index={selectedIndex}
      className={cn(
        "relative mx-auto min-h-[clamp(150px,24vh,200px)] w-full max-w-[520px]",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2 select-none">
        <div
          aria-hidden="true"
          data-slot="avatar-carousel-side"
          className={cn(slotClassName, "scale-90 opacity-40")}
        >
          <img
            src={previous.imageSrc}
            alt=""
            draggable={false}
            className={imageClassName}
          />
        </div>

        <div
          role="group"
          aria-roledescription="slide"
          aria-label={`${selectedIndex + 1} of ${items.length}`}
          aria-live="polite"
          data-slot="avatar-carousel-selected"
          className={cn(slotClassName, "scale-100 opacity-100")}
        >
          <img
            src={selected.imageSrc}
            alt={
              selected.imageAlt ??
              `Selected avatar ${selectedIndex + 1} of ${items.length}: ${selected.name}`
            }
            draggable={false}
            className={imageClassName}
          />
        </div>

        <div
          aria-hidden="true"
          data-slot="avatar-carousel-side"
          className={cn(slotClassName, "scale-90 opacity-40")}
        >
          <img
            src={next.imageSrc}
            alt=""
            draggable={false}
            className={imageClassName}
          />
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label={previousLabel}
        disabled={!canMove}
        data-slot="avatar-carousel-previous"
        data-active={lastDirection === "previous"}
        className={cn(
          "absolute top-1/2 left-[18px] z-10 size-9 -translate-y-1/2 rounded-full p-0",
          lastDirection === "previous" &&
            "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        onClick={() => move("previous")}
      >
        <ArrowLeft aria-hidden="true" />
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        aria-label={nextLabel}
        disabled={!canMove}
        data-slot="avatar-carousel-next"
        data-active={lastDirection === "next"}
        className={cn(
          "absolute top-1/2 right-[18px] z-10 size-9 -translate-y-1/2 rounded-full p-0",
          lastDirection === "next" &&
            "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        onClick={() => move("next")}
      >
        <ArrowRight aria-hidden="true" />
      </Button>
    </div>
  )
}
