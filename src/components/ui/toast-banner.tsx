import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X, ArrowRight, Info, Check, AlertTriangle, AlertCircle } from "lucide-react"

export type ToastBannerType = "blue" | "success" | "warning" | "error" | "neutral"

const TYPE_CONFIG: Record<ToastBannerType, { bg: string; Icon: React.ElementType }> = {
  blue:    { bg: "#194084", Icon: Info },
  success: { bg: "#054E31", Icon: Check },
  warning: { bg: "#792D0D", Icon: AlertTriangle },
  error:   { bg: "#7A2619", Icon: AlertCircle },
  neutral: { bg: "#24262B", Icon: ArrowRight },
}

export interface ToastBannerProps {
  type?: ToastBannerType
  children: React.ReactNode
  onDismiss?: () => void
  className?: string
}

export function ToastBanner({ type = "neutral", children, onDismiss, className }: ToastBannerProps) {
  const { bg, Icon } = TYPE_CONFIG[type]

  return (
    <div
      className={cn(
        "flex min-h-[52px] w-full max-w-[349px] items-center gap-2.5 rounded-lg py-2 pl-2 pr-3.5",
        className
      )}
      style={{ backgroundColor: bg }}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black">
        <Icon size={20} color="#EFEDFF" />
      </div>

      <span className="flex-1 text-[14px] font-medium leading-5 text-[#EFF8FF]">
        {children}
      </span>

      {onDismiss && (
        <Button
          variant="ghost"
          onClick={onDismiss}
          className="h-auto w-auto shrink-0 p-0 hover:bg-transparent"
        >
          <X size={12} color="#EFF8FF" />
        </Button>
      )}
    </div>
  )
}
