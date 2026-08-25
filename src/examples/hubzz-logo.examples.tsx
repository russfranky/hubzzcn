import type * as React from "react"

import { HubzzLogo } from "@/components/hubzz/hubzz-logo"
import type { Example, Meta } from "./types"

type HubzzLogoProps = React.ComponentProps<typeof HubzzLogo>

export const meta: Meta<typeof HubzzLogo> = {
  title: "HubzzLogo",
  slug: "hubzz-logo",
  component: HubzzLogo,
  description:
    "Hubzz mark that inherits the surrounding semantic text color by default.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Prefer the default icon variant so host surfaces own color through currentColor.",
    "Provide title when the mark conveys identity; omit it when the mark is decorative.",
    "The legacy purple and dark variants remain white-mark compatibility modes and do not define a brand color.",
  ],
}

export const CurrentColor: Example<HubzzLogoProps> = {
  name: "Current color",
  args: { variant: "light", size: 40, title: "Hubzz" },
}

export const DecorativeIcon: Example<HubzzLogoProps> = {
  name: "Decorative icon",
  args: { variant: "icon", size: 32 },
}

export const WhiteMark: Example<HubzzLogoProps> = {
  name: "White mark",
  args: { variant: "dark", size: 40, title: "Hubzz white mark" },
}

export const examples = [CurrentColor, DecorativeIcon, WhiteMark]
