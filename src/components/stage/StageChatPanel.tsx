import { useEffect, useRef, useState } from "react"

import type { ChatMessage } from "@/lib/stage/types"
import { IconChatMic, IconClap, IconUserGroup } from "./DockIcons"
import { StageRailHeader } from "./StageRailHeader"

function RankBadge() {
  return (
    <span
      aria-hidden
      className="relative mt-0.5 flex size-5 shrink-0 items-center justify-center"
    >
      <span className="bg-stage-rank/80 absolute inset-0 rounded-full" />
      <svg viewBox="0 0 12 12" className="fill-stage-rank relative size-2.5">
        <path d="M6 0.6l1.5 3.1 3.4.5-2.45 2.4.6 3.4L6 8.4 2.95 10l.6-3.4L1.1 4.2l3.4-.5L6 .6z" />
      </svg>
    </span>
  )
}

export function StageChatPanel({
  messages,
  rankedIds,
  onClose,
  onOpenPeople,
  onSend,
  onClap,
}: {
  messages: ChatMessage[]
  rankedIds: ReadonlySet<string>
  onClose: () => void
  onOpenPeople: () => void
  onSend: (body: string) => void
  onClap: () => void
}) {
  const [draft, setDraft] = useState("")
  const scroller = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length])

  useEffect(() => {
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      onClose()
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [onClose])

  const submit = () => {
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft("")
  }

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      className="bg-stage-chat text-stage-fg flex h-full min-h-0 w-full flex-col outline-none"
      aria-label="Chat"
    >
      <StageRailHeader
        title="Chat"
        closeLabel="Hide chat"
        onClose={onClose}
        actionLabel="People"
        onAction={onOpenPeople}
        action={<IconUserGroup />}
      />

      <div
        ref={scroller}
        className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-y-auto py-3"
      >
        {messages.map((m) => (
          <div key={m.id} className="flex items-start gap-2.5 px-5 py-1">
            {rankedIds.has(m.userId) ? (
              <RankBadge />
            ) : (
              <span className="size-5 shrink-0" />
            )}
            <p className="text-stage-soft min-w-0 text-sm leading-5">
              <span className="text-stage-chat-name font-medium">{m.name}</span>{" "}
              {m.body}
            </p>
          </div>
        ))}
      </div>

      <form
        className="bg-stage-panel flex h-16 shrink-0 items-center gap-4 px-5"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Chat along"
          aria-label="Chat along"
          className="text-stage-fg placeholder:text-stage-muted min-w-0 flex-1 bg-transparent text-base leading-6 outline-none"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClap}
            aria-label="Clap"
            className="text-stage-fg hover:bg-stage-raised flex size-10 items-center justify-center rounded-xl"
          >
            <IconClap />
          </button>
          <button
            type="button"
            aria-label="Voice message"
            className="text-stage-soft hover:bg-stage-raised flex size-10 items-center justify-center rounded-xl"
          >
            <IconChatMic />
          </button>
        </div>
      </form>
    </aside>
  )
}
