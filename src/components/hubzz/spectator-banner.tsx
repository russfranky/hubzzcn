import type * as React from "react"

import { HubzzLogo } from "@/components/hubzz/hubzz-logo"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SpectatorBannerPlacement = "inline" | "overlay"

export interface SpectatorBannerProps extends React.ComponentProps<"aside"> {
  message?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  logo?: React.ReactNode
  placement?: SpectatorBannerPlacement
}

export function SpectatorBanner({
  message = "You are in spectator mode. Log in or sign up to get the full experience.",
  actionLabel = "Log in or Sign up",
  onAction,
  logo,
  placement = "inline",
  className,
  ...props
}: SpectatorBannerProps) {
  const ariaLabel = props["aria-label"] ?? "Spectator mode"

  return (
    <aside
      {...props}
      aria-label={ariaLabel}
      data-slot="spectator-banner"
      data-placement={placement}
      className={cn(
        "z-50 flex w-full items-center gap-4 rounded-[12px] bg-card p-4 pl-6 text-card-foreground shadow-2xl",
        "max-sm:flex-col max-sm:items-end sm:w-auto sm:max-w-fit sm:rounded-full",
        placement === "inline"
          ? "relative"
          : "fixed right-4 bottom-[10vh] left-4 mx-auto max-sm:bottom-[42px] max-sm:max-w-none",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-4 max-sm:w-full">
        {logo === null ? null : (
          <span
            data-slot="spectator-banner-logo"
            className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-background text-primary"
          >
            {logo ?? <HubzzLogo variant="icon" size={36} />}
          </span>
        )}
        <span className="min-w-0 flex-1 text-sm leading-5">{message}</span>
      </div>

      {onAction ? (
        <Button className="shrink-0" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </aside>
  )
}
