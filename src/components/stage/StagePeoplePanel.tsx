import { Check, ChevronDown, Hand, Mic, MoreHorizontal, X } from "lucide-react"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Participant, ParticipantRole } from "@/lib/stage/types"
import { cn } from "@/lib/utils"
import { IconChatBubble } from "./DockIcons"
import { StageAvatar } from "./StageAvatar"
import { StageRailHeader } from "./StageRailHeader"

function RowAvatar({ p }: { p: Participant }) {
  return (
    <span className="relative size-8 shrink-0">
      <StageAvatar src={p.avatar} initials={p.name.slice(0, 1)} chip={p.chip} />
      <span
        aria-hidden
        className="stage-photo-line pointer-events-none absolute inset-0 rounded-full"
      />
      {p.raisedHand ? (
        <span
          className="border-stage-panel bg-stage-fg text-stage-bg absolute -right-1 -bottom-0.5 flex size-4 items-center justify-center rounded-full border"
          aria-label="Hand raised"
        >
          <Hand className="size-2.5" strokeWidth={2.4} />
        </span>
      ) : null}
    </span>
  )
}

function Section({
  title,
  count,
  children,
  collapsible = true,
}: {
  title: string
  count?: number
  children: ReactNode
  collapsible?: boolean
}) {
  const [open, setOpen] = useState(true)
  return (
    <section className="flex w-full flex-col gap-4">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={open}
        >
          <span className="text-stage-muted text-sm font-medium">
            {title}
            {count != null ? (
              <span className="font-normal"> ({count})</span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              "text-stage-muted size-5 transition-transform duration-150",
              open ? "rotate-0" : "-rotate-90"
            )}
          />
        </button>
      ) : (
        <p className="text-stage-muted text-sm font-medium">{title}</p>
      )}
      {open ? <div className="flex flex-col gap-4">{children}</div> : null}
    </section>
  )
}

function EmptyRow({ label }: { label: string }) {
  return <p className="text-stage-muted/70 text-xs">{label}</p>
}

function RowMenu({
  name,
  items,
}: {
  name: string
  items: { label: string; onSelect: () => void; danger?: boolean }[]
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-stage-fg hover:bg-stage-raised hover:text-stage-fg size-8"
          aria-label={`Actions for ${name}`}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={4}
        className="border-stage-raised bg-stage-dock text-stage-fg min-w-40 p-1"
      >
        {items.map((item) => (
          <DropdownMenuItem
            key={item.label}
            onSelect={item.onSelect}
            variant={item.danger ? "destructive" : "default"}
            className={cn(
              "cursor-pointer rounded-md px-3 py-2 text-sm",
              item.danger ? "text-stage-leave" : "text-stage-fg"
            )}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function StagePeoplePanel({
  hosts,
  stage,
  audience,
  canModerate,
  canRaiseHand,
  raisedHand,
  onClose,
  onOpenChat,
  onApprove,
  onDeny,
  onMute,
  onSetRole,
  onRaiseHand,
}: {
  hosts: Participant[]
  stage: Participant[]
  audience: Participant[]
  canModerate: boolean
  canRaiseHand: boolean
  raisedHand: boolean
  onClose: () => void
  onOpenChat: () => void
  onApprove: (id: string) => void
  onDeny: (id: string) => void
  onMute: (id: string) => void
  onSetRole: (id: string, role: ParticipantRole) => void
  onRaiseHand: () => void
}) {
  const panelRef = useRef<HTMLElement>(null)
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      if (document.querySelector("[data-radix-menu-content]")) return
      if (document.querySelector("[role='dialog']")) return
      onClose()
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [onClose])

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      className="bg-stage-panel flex h-full min-h-0 w-full flex-col outline-none"
    >
      <StageRailHeader
        title="People"
        closeLabel="Hide people"
        onClose={onClose}
        actionLabel="Chat"
        onAction={onOpenChat}
        action={<IconChatBubble />}
      />

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-6">
          <Section title="Host" collapsible={false}>
            {hosts.length === 0 ? <EmptyRow label="No host" /> : null}
            {hosts.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <RowAvatar p={p} />
                <p className="text-stage-fg min-w-0 flex-1 truncate text-sm font-medium">
                  {p.name}
                </p>
                <Mic
                  className={cn(
                    "size-5",
                    p.isMuted
                      ? "text-stage-muted"
                      : p.isSpeaking
                        ? "text-stage-speak-deep"
                        : "text-stage-muted"
                  )}
                  aria-label={
                    p.isMuted ? "Muted" : p.isSpeaking ? "Speaking" : "Unmuted"
                  }
                />
              </div>
            ))}
          </Section>

          <Section title="Stage" count={stage.length}>
            {stage.length === 0 ? <EmptyRow label="No one on stage" /> : null}
            {stage.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <RowAvatar p={p} />
                <p className="text-stage-fg min-w-0 flex-1 truncate text-sm font-medium">
                  {p.name}
                </p>
                {canModerate ? (
                  <RowMenu
                    name={p.name}
                    items={[
                      ...(!p.isMuted
                        ? [{ label: "Mute", onSelect: () => onMute(p.id) }]
                        : []),
                      {
                        label: "Move to audience",
                        onSelect: () => onSetRole(p.id, "listener"),
                        danger: true,
                      },
                    ]}
                  />
                ) : (
                  <MoreHorizontal className="text-stage-muted size-5" />
                )}
              </div>
            ))}
          </Section>

          <Section title="Audience" count={audience.length}>
            {audience.length === 0 ? (
              <EmptyRow label="No one in the audience" />
            ) : null}
            {audience.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <RowAvatar p={p} />
                <p className="text-stage-fg min-w-0 flex-1 truncate text-sm font-medium">
                  {p.name}
                </p>
                {p.raisedHand && canModerate ? (
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Approve ${p.name}`}
                      onClick={() => onApprove(p.id)}
                      className="border-stage-line text-stage-speak-deep hover:bg-stage-raised flex size-9 items-center justify-center rounded-full border"
                    >
                      <Check className="size-4" strokeWidth={2.2} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Deny ${p.name}`}
                      onClick={() => onDeny(p.id)}
                      className="border-stage-line text-stage-muted hover:bg-stage-raised flex size-9 items-center justify-center rounded-full border"
                    >
                      <X className="size-4" strokeWidth={2.2} />
                    </button>
                  </span>
                ) : canModerate ? (
                  <RowMenu
                    name={p.name}
                    items={[
                      {
                        label: "Invite to stage",
                        onSelect: () => onApprove(p.id),
                      },
                    ]}
                  />
                ) : (
                  <MoreHorizontal className="text-stage-muted size-5" />
                )}
              </div>
            ))}
          </Section>
        </div>
      </div>

      {canRaiseHand ? (
        raisedHand ? (
          <div className="bg-stage-dock flex items-start gap-2 px-4 py-4">
            <span
              className="bg-stage-speak-deep text-stage-panel mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full"
              aria-hidden
            >
              <Check className="size-2.5" strokeWidth={3} />
            </span>
            <p className="text-stage-muted text-sm text-pretty">
              Your request has been sent, please wait for approval from the
              event host.
            </p>
          </div>
        ) : (
          <div className="relative p-4">
            <div className="from-stage-panel pointer-events-none absolute inset-x-0 -top-12 h-12 bg-gradient-to-t to-transparent" />
            <Button
              variant="outline"
              className="border-stage-soft text-stage-fg hover:bg-stage-raised hover:text-stage-fg h-12 w-full rounded-full text-sm"
              onClick={onRaiseHand}
            >
              <Hand className="size-4" />
              Request to join
            </Button>
          </div>
        )
      ) : null}
    </aside>
  )
}
