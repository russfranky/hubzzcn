import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

//  State=default/hover/active — h=36, r=10, px=12 py=8, gap=6
// default #181B1F, hover #24262B, active #392F7D; text 14px/500 white

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
        "inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 py-2 text-[14px] font-medium leading-5 text-white transition-colors",
        state === "default" && "bg-background hover:bg-card",
        state === "hover" && "bg-card",
        state === "active" && "bg-[#392F7D]",
        className
      )}
    >
      {emoji && <span>{emoji}</span>}
      <span>{children}</span>
      {onRemove && (
        <Button
          variant="ghost"
          onClick={onRemove}
          aria-label={removeLabel}
          className="h-auto w-auto shrink-0 p-0 hover:bg-transparent"
        >
          <X size={16} color="#FFFFFF" />
        </Button>
      )}
    </div>
  )
}
