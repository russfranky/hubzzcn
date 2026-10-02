import * as React from "react"

import { Toggle, type ToggleProps } from "@/components/hubzz/toggle"
import type { Example, Meta } from "./types"

function ToggleDemo(args: ToggleProps) {
  const [checked, setChecked] = React.useState(Boolean(args.checked))

  return (
    <div className="inline-flex items-center">
      <Toggle
        {...args}
        checked={checked}
        onCheckedChange={(next) => {
          setChecked(next)
          args.onCheckedChange?.(next)
        }}
      />
    </div>
  )
}

export const meta: Meta<typeof Toggle> = {
  title: "Toggle",
  slug: "toggle",
  navLabel: "Toggle",
  component: Toggle,
  description:
    "Hubzz on/off switch from pre-alpha space-cards settings ToggleSwitch — purple track when on, charcoal when off.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Source of truth: packages/client/src/space-cards/components/spaces/settings-shared.tsx (ToggleSwitch).",
    "Figma UI Elements file hlotzpup9k4CnwhskBVroL had no Toggle component page at port time; product ToggleSwitch was used.",
    "Not the upstream shadcn Switch/Toggle primitives — this is the Hubzz settings/audio/drone control leaf.",
    "Host code owns labels and setting rows; this leaf owns track/knob geometry and role=switch semantics.",
  ],
}

export const On: Example<ToggleProps> = {
  name: "On",
  args: { checked: true, "aria-label": "Notifications on" },
  render: (args) => <ToggleDemo {...args} />,
}

export const Off: Example<ToggleProps> = {
  name: "Off",
  args: { checked: false, "aria-label": "Notifications off" },
  render: (args) => <ToggleDemo {...args} />,
}

export const InSettingRow: Example<ToggleProps> = {
  name: "In setting row",
  args: { checked: true, "aria-label": "Noise suppression" },
  render: (args) => {
    function Row() {
      const [checked, setChecked] = React.useState(Boolean(args.checked))
      return (
        <div className="flex w-full max-w-xs items-center gap-3.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-xs leading-4 font-medium text-[#c7d2da]">
              Noise suppression
            </p>
            <p className="text-[11px] leading-4 text-[#7c878e]">
              Reduce background noise on your mic
            </p>
          </div>
          <Toggle
            {...args}
            checked={checked}
            onCheckedChange={setChecked}
            aria-label="Noise suppression"
          />
        </div>
      )
    }
    return <Row />
  },
}

export const Disabled: Example<ToggleProps> = {
  name: "Disabled",
  args: {
    checked: false,
    disabled: true,
    "aria-label": "Unavailable setting",
  },
  render: (args) => <ToggleDemo {...args} />,
}

export const examples = [On, Off, InSettingRow, Disabled]
