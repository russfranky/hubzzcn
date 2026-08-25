import * as React from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type BadgeCategoryState = "default" | "hover" | "active"

export interface BadgeCategoryProps {
  state?: BadgeCategoryState
  emoji?: string
  removeLabel?: string
  onRemove?: () => void
  className?: string
  children: React.ReactNode
}

export function BadgeCategory({
  state = "default",
  emoji,
  removeLabel = "Remove",
  onRemove,
  className,
  children,
}: BadgeCategoryProps) {
  return (
    <div
      data-state={state}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 py-2 text-sm leading-5 font-medium text-foreground transition-colors",
        state === "default" && "bg-background hover:bg-card",
        state === "hover" && "bg-card",
        state === "active" && "bg-primary text-primary-foreground",
        className
      )}
    >
      {emoji ? <span aria-hidden="true">{emoji}</span> : null}
      <span>{children}</span>
      {onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onRemove}
          aria-label={removeLabel}
          className="size-5 p-0 hover:bg-transparent"
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}
