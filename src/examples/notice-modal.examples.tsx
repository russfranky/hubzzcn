import * as React from "react"

import { NoticeModal } from "@/components/hubzz/notice-modal"
import { TermsModal } from "@/components/hubzz/terms-modal"
import { Button } from "@/components/ui/button"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof NoticeModal> = {
  title: "NoticeModal",
  slug: "notice-modal",
  navLabel: "Notice Modal",
  component: NoticeModal,
  description:
    "Terms notice modal with a single Agree action and a Terms of Service link, ported from the Figma Make Digital Merch Modal project.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Source: Figma Make 'Digital Merch Modal' (7w2KEWk6WBaOOaDQSjRd1S), src/app/components/NoticeModal.tsx.",
    "The demo chains the Terms of Service link into TermsModal, matching the Figma App wiring.",
    "Agree reports through onAgree and closes; shell and colors are hubzzcn Dialog and semantic tokens.",
  ],
}

interface DemoArgs {
  triggerLabel: string
}

function NoticeModalDemo({ triggerLabel }: DemoArgs) {
  const [open, setOpen] = React.useState(false)
  const [termsOpen, setTermsOpen] = React.useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>{triggerLabel}</Button>
      <NoticeModal
        open={open}
        onClose={() => setOpen(false)}
        onTermsClick={() => setTermsOpen(true)}
      />
      <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} />
    </>
  )
}

export const Default: Example<DemoArgs> = {
  name: "Default",
  args: { triggerLabel: "Terms Notice" },
  render: (args) => <NoticeModalDemo {...args} />,
}

export const examples = [Default]
