import type * as React from "react"

import { HubzzLogo } from "@/components/hubzz/hubzz-logo"
import { cn } from "@/lib/utils"

export type SpectatorBannerPlacement = "inline" | "overlay"

export interface SpectatorBannerProps extends React.ComponentProps<"aside"> {
  message?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
  logo?: React.ReactNode
  placement?: SpectatorBannerPlacement
}

const DEFAULT_MESSAGE =
  "You are in spectator mode. Log in or Sign up to get the full experience."

const PANEL_BG = "#24262B"
const ACTION_GRADIENT = "linear-gradient(180deg, #9A77FF 0%, #735FFA 100%)"
const ACTION_GRADIENT_HOVER =
  "linear-gradient(180deg, #A88AFF 0%, #8470FB 100%)"

/**
 * Visual surface matched to pre-alpha `SpectatorPanel` + module CSS.
 * Product owns auth/world readiness and reveal timing.
 */
export function SpectatorBanner({
  message = DEFAULT_MESSAGE,
  actionLabel = "Log in or Sign up",
  onAction,
  logo,
  placement = "inline",
  className,
  style,
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
        "z-50 box-border flex w-full items-center gap-4 p-4 pl-6 text-white",
        "rounded-[60px] max-sm:flex-col max-sm:items-end max-sm:rounded-[12px] max-sm:px-6 max-sm:py-4",
        "sm:w-auto sm:max-w-fit",
        placement === "inline"
          ? "relative"
          : "fixed right-4 bottom-[10vh] left-4 mx-auto max-sm:bottom-[42px] max-sm:max-w-none",
        className
      )}
      style={{ background: PANEL_BG, ...style }}
    >
      <div className="flex min-w-0 items-center gap-4 max-sm:w-full">
        {logo === null ? null : (
          <span
            data-slot="spectator-banner-logo"
            className="size-11 shrink-0 overflow-hidden rounded-[10px]"
          >
            {logo ?? <HubzzLogo variant="dark" size={44} />}
          </span>
        )}
        <span className="min-w-0 flex-1 text-sm leading-5 font-normal text-white">
          {message}
        </span>
      </div>

      {onAction ? (
        <button
          type="button"
          data-slot="spectator-banner-action"
          onClick={onAction}
          className={cn(
            "shrink-0 cursor-pointer border-none font-semibold whitespace-nowrap text-[#FCFDFE]",
            "rounded-[40px] px-5 py-3 text-sm leading-5",
            "max-sm:px-3.5 max-sm:py-[7px] max-sm:text-xs max-sm:leading-[18px]",
            "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          )}
          style={{ background: ACTION_GRADIENT }}
          onMouseEnter={(event) => {
            event.currentTarget.style.background = ACTION_GRADIENT_HOVER
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.background = ACTION_GRADIENT
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </aside>
  )
}
