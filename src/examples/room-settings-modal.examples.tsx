import * as React from "react"

import { RoomSettingsModal } from "@/components/hubzz/room-settings-modal"
import { Button } from "@/components/ui/button"
import type { Example, Meta } from "./types"

const asset = (path: string) =>
  `${import.meta.env?.BASE_URL ?? "/"}${path.replace(/^\//, "")}`

export const meta: Meta<typeof RoomSettingsModal> = {
  title: "RoomSettingsModal",
  slug: "room-settings-modal",
  navLabel: "Room Settings Modal",
  component: RoomSettingsModal,
  description:
    "Room Settings modal with Cancel/Save header, setting rows, and a Moderation & Design section, ported from the Figma Make Digital Merch Modal project.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/RoomSettingsModal.tsx.",
    "Rows are data-driven and report through onRowClick; Save reports through onSave and closes, as in the source.",
    "Shell and colors are hubzzcn Dialog and semantic tokens.",
  ],
}

interface DemoArgs {
  triggerLabel: string
}

function RoomSettingsModalDemo({ triggerLabel }: DemoArgs) {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <RoomSettingsModal
        open={open}
        onClose={() => setOpen(false)}
        member={{
          name: "notruss",
          role: "Designer & Moderator & Owner",
          avatarSrc: asset("avatars/a1.png"),
        }}
      />
    </>
  )
}

export const Default: Example<DemoArgs> = {
  name: "Default",
  args: { triggerLabel: "Room Settings" },
  render: (args) => <RoomSettingsModalDemo {...args} />,
}

export const examples = [Default]
