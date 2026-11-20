import { ChevronDown, ChevronRight, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export interface RoomSettingsRow {
  id: string
  label: string
  value?: string
  /** "select" rows show a chevron-down, "link" rows a chevron-right. */
  kind?: "value" | "select" | "link"
}

export interface RoomSettingsMember {
  name: string
  role: string
  avatarSrc?: string
}

export interface RoomSettingsModalProps {
  open: boolean
  onClose: () => void
  onSave?: () => void
  onRowClick?: (row: RoomSettingsRow) => void
  onAddPeople?: () => void
  rows?: RoomSettingsRow[]
  member?: RoomSettingsMember
  className?: string
}

export const DEFAULT_ROOM_SETTINGS_ROWS: RoomSettingsRow[] = [
  { id: "name", label: "Name", value: "notruss's Home" },
  { id: "category", label: "Category", value: "Hangout" },
  { id: "visitors", label: "Visitors", value: "Max 10", kind: "select" },
  {
    id: "spectating",
    label: "Allow Spectating",
    value: "Yes",
    kind: "select",
  },
  { id: "language", label: "Language", value: "English", kind: "select" },
  { id: "access", label: "Access", value: "Everyone", kind: "select" },
  { id: "banned-users", label: "Banned Users", value: "0" },
  { id: "info", label: "Info", value: "Room description" },
]

/**
 * Room Settings modal, ported from the Figma Make project
 * "Digital Merch Modal" (file 7w2KEWk6WBaOOaDQSjRd1S,
 * RoomSettingsModal.tsx).
 *
 * The Cancel / title / Save header, the eight setting rows, and the
 * Moderation & Design section come from the Figma source. Rows report
 * through onRowClick instead of being inert. The shell is hubzzcn's
 * Dialog with semantic tokens.
 */
export function RoomSettingsModal({
  open,
  onClose,
  onSave,
  onRowClick,
  onAddPeople,
  rows = DEFAULT_ROOM_SETTINGS_ROWS,
  member = { name: "notruss", role: "Designer & Moderator & Owner" },
  className,
}: RoomSettingsModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn(
          "flex max-h-[90dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-md",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <Button
            variant="ghost"
            size="sm"
            className="font-semibold"
            onClick={onClose}
          >
            Cancel
          </Button>
          <DialogTitle className="text-lg font-bold">Room Settings</DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="font-semibold"
            onClick={() => {
              onSave?.()
              onClose()
            }}
          >
            Save
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto">
          <div className="py-2">
            {rows.map((row) => (
              <button
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className="flex w-full items-center justify-between border-b border-border/50 p-4 text-left transition-colors last:border-b-0 hover:bg-accent/50"
              >
                <span className="font-medium text-popover-foreground">
                  {row.label}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span>{row.value}</span>
                  {row.kind === "select" && <ChevronDown className="size-4" />}
                  {row.kind === "link" && <ChevronRight className="size-4" />}
                </span>
              </button>
            ))}
          </div>

          {/* Moderation & Design */}
          <div className="pb-4">
            <h3 className="px-4 py-4 text-lg font-bold text-popover-foreground">
              Moderation &amp; Design
            </h3>

            <button
              onClick={onAddPeople}
              className="group flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-accent/50"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-muted transition-colors group-hover:border-muted-foreground/50">
                <Plus className="size-6 text-muted-foreground group-hover:text-foreground" />
              </span>
              <span className="font-medium text-popover-foreground">
                Add People
              </span>
            </button>

            <div className="flex w-full items-center gap-4 border-t border-border/50 px-4 py-3">
              <Avatar className="h-12 w-12 border border-border">
                {member.avatarSrc && (
                  <AvatarImage src={member.avatarSrc} alt={member.name} />
                )}
                <AvatarFallback>
                  {member.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="font-semibold text-popover-foreground">
                  {member.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {member.role}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
