import * as React from "react"

import { cn } from "@/lib/utils"

export interface ToggleProps extends Omit<
  React.ComponentProps<"button">,
  "onChange" | "type" | "role" | "aria-checked" | "children"
> {
  /** Whether the switch is on. */
  checked?: boolean
  /** Uncontrolled initial on state. */
  defaultChecked?: boolean
  /** Called with the next on/off value when the user toggles. */
  onCheckedChange?: (checked: boolean) => void
}

/**
 * Hubzz on/off Toggle — product leaf from space-cards settings ToggleSwitch.
 *
 * Source: packages/client/src/space-cards/components/spaces/settings-shared.tsx
 * (ToggleSwitch). ON = Hubzz purple track; OFF = charcoal track; white knob.
 */
export function Toggle({
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  className,
  disabled,
  "aria-label": ariaLabel,
  onClick,
  style,
  ...props
}: ToggleProps) {
  const isControlled = checkedProp !== undefined
  const [uncontrolledChecked, setUncontrolledChecked] =
    React.useState(defaultChecked)
  const checked = isControlled ? Boolean(checkedProp) : uncontrolledChecked

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    onClick?.(event)
    if (event.defaultPrevented || disabled) return
    const next = !checked
    if (!isControlled) setUncontrolledChecked(next)
    onCheckedChange?.(next)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? (checked ? "Turn off" : "Turn on")}
      disabled={disabled}
      data-slot="hubzz-toggle"
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "relative h-[20px] w-[34px] shrink-0 cursor-pointer rounded-[44px] border-none bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={style}
      onClick={handleClick}
      {...props}
    >
      {/* Track — SoT: ON #735ffa, OFF #393e44 */}
      <span
        aria-hidden
        className="absolute inset-[1px] rounded-[44px] transition-[background-color] duration-200 ease-in-out"
        style={{ backgroundColor: checked ? "#735ffa" : "#393e44" }}
      />
      {/* Knob — SoT: 14px #fcfdfe */}
      <span
        aria-hidden
        className="absolute top-[3px] size-[14px] rounded-full bg-[#fcfdfe] transition-[left] duration-200 ease-in-out"
        style={{ left: checked ? "calc(100% - 17px)" : "3px" }}
      />
    </button>
  )
}
