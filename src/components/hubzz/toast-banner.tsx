import * as React from "react"
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  Info,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ToastBannerType =
  | "blue"
  | "success"
  | "warning"
  | "error"
  | "neutral"

const TYPE_CONFIG: Record<
  ToastBannerType,
  { bg: string; Icon: React.ElementType }
> = {
  blue: { bg: "#194084", Icon: Info },
  success: { bg: "#054E31", Icon: Check },
  warning: { bg: "#792D0D", Icon: AlertTriangle },
  error: { bg: "#7A2619", Icon: AlertCircle },
  neutral: { bg: "#24262B", Icon: ArrowRight },
}

export interface ToastBannerProps {
  type?: ToastBannerType
  children: React.ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  className?: string
}

export function ToastBanner({
  type = "neutral",
  children,
  onDismiss,
  dismissLabel = "Dismiss notification",
  className,
}: ToastBannerProps) {
  const { bg, Icon } = TYPE_CONFIG[type]

  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={cn(
        "flex min-h-[52px] w-full max-w-[349px] items-center gap-2.5 rounded-lg py-2 pr-3.5 pl-2",
        className
      )}
      style={{ backgroundColor: bg }}
    >
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black"
        aria-hidden="true"
      >
        <Icon size={20} color="#EFEDFF" />
      </div>

      <span className="flex-1 text-sm font-medium leading-5 text-[#EFF8FF]">
        {children}
      </span>

      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="size-5 p-0 hover:bg-transparent"
        >
          <X aria-hidden="true" />
        </Button>
      ) : null}
    </div>
  )
}
