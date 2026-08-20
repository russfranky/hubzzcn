import * as React from "react"

import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"

export interface CapsuleProps extends Omit<
  React.ComponentProps<typeof Toggle>,
  "pressed" | "defaultPressed" | "onPressedChange"
> {
  active?: boolean
  onActiveChange?: (active: boolean) => void
}

export function Capsule({
  active = false,
  className,
  onActiveChange,
  children,
  ...props
}: CapsuleProps) {
  return (
    <Toggle
      pressed={active}
      onPressedChange={onActiveChange}
      className={cn(
        "h-[30px] min-w-0 cursor-pointer rounded-full bg-card px-3.5 py-1.5 text-xs leading-[18px] font-medium hover:bg-hubzz-pill-hover aria-pressed:bg-card aria-pressed:hover:bg-hubzz-pill-hover data-[state=on]:bg-card data-[state=on]:hover:bg-hubzz-pill-hover",
        active ? "text-foreground" : "text-hubzz-muted",
        className
      )}
      {...props}
    >
      {children}
    </Toggle>
  )
}
