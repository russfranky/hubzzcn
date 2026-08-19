import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

//  Active=true/false
// h=30, r=40, paddingLeft=14 paddingRight=14 paddingTop=6 paddingBottom=6, gap=10
// bg=#24262B — active: text=#FCFDFE, inactive: text=#ACB9C4
// Text: 12px/500, lh=18
// hover:bg-[#2E3238] — UX addition beyond spec (defines no hover state).
//   Intentional: interactive elements need cursor feedback. Do not "correct" to #24262B.

export interface CapsuleProps {
  active?: boolean
  className?: string
  children: React.ReactNode
  onClick?: () => void
}

export function Capsule({ active = false, className, children, onClick }: CapsuleProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "h-[30px] cursor-pointer rounded-[40px] bg-card px-3.5 py-1.5 text-xs font-medium leading-[18px] hover:bg-hubzz-pill-hover",
        active ? "text-foreground" : "text-hubzz-muted",
        className
      )}
    >
      {children}
    </Button>
  )
}
