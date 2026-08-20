import type * as React from "react"

const ICON_PATH =
  "M262.797 172.083L215.749 199.449L188.238 214.924L251.142 251.617L262.797 244.775V172.083ZM170.542 235.293L142.249 251.965L198.263 284.637L225.159 267.151L170.542 235.293ZM194.741 114.261L167.845 131.748L222.462 163.605L250.754 146.934L194.741 114.261ZM204.766 183.975L141.862 147.282L130.207 154.123V226.816L177.255 199.449L204.766 183.975ZM287.617 260.665L197.793 313.538C197.26 313.852 196.599 313.854 196.064 313.541L105.393 260.664C104.867 260.358 104.544 259.794 104.544 259.186V139.708C104.544 139.102 104.865 138.541 105.387 138.233L195.211 85.3604C195.744 85.0463 196.405 85.0452 196.94 85.3572L287.611 138.235C288.137 138.541 288.46 139.104 288.46 139.713V259.191C288.46 259.797 288.139 260.358 287.617 260.665Z"

export type HubzzLogoVariant = "purple" | "light" | "dark" | "icon"

export interface HubzzLogoProps extends Omit<
  React.SVGProps<SVGSVGElement>,
  "width" | "height"
> {
  variant?: HubzzLogoVariant
  size?: number
  title?: string
}

const variantFill: Record<HubzzLogoVariant, string> = {
  purple: "white",
  light: "#735FFA",
  dark: "white",
  icon: "currentColor",
}

export function HubzzLogo({
  variant = "icon",
  size = 40,
  title,
  ...props
}: HubzzLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 392 392"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path d={ICON_PATH} fill={variantFill[variant]} />
    </svg>
  )
}
