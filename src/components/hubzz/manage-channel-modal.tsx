import {
  ChevronRight,
  Key,
  Mic,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export interface ManageChannelItem {
  id: string
  icon: LucideIcon
  title: string
  description: string
}

export interface ManageChannelModalProps {
  open: boolean
  onClose: () => void
  title?: string
  items?: ManageChannelItem[]
  onSelect?: (item: ManageChannelItem) => void
  className?: string
}

export const DEFAULT_MANAGE_CHANNEL_ITEMS: ManageChannelItem[] = [
  {
    id: "edit-profile",
    icon: Pencil,
    title: "Edit channel profile",
    description: "Edit the name, description and images",
  },
  {
    id: "manage-members",
    icon: ShieldCheck,
    title: "Manage members",
    description: "Add, remove members and moderators",
  },
  {
    id: "banned-users",
    icon: ShieldAlert,
    title: "Banned users",
    description: "View banned users and unban them",
  },
  {
    id: "invite-member",
    icon: UserPlus,
    title: "Invite a member",
    description: "Invite someone to become a member of your group",
  },
  {
    id: "who-can-post",
    icon: Mic,
    title: "Who can post",
    description: "Decide who's allowed to post for the group",
  },
  {
    id: "change-owner",
    icon: Key,
    title: "Change owner",
    description: "Transfer the group to another member",
  },
]

/**
 * Manage Channel menu modal, ported from the Figma Make project
 * "Digital Merch Modal" (file 7w2KEWk6WBaOOaDQSjRd1S,
 * ManageChannelModal.tsx).
 *
 * The six menu rows and their copy come from the Figma source, where
 * each row only logged to the console. Here rows report through
 * onSelect. The shell is hubzzcn's Dialog with semantic tokens.
 */
export function ManageChannelModal({
  open,
  onClose,
  title = "Manage group",
  items = DEFAULT_MANAGE_CHANNEL_ITEMS,
  onSelect,
  className,
}: ManageChannelModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className={cn("gap-0 overflow-hidden p-0 sm:max-w-md", className)}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          <Button
            variant="ghost"
            size="icon-sm"
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex flex-col">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => onSelect?.(item)}
                className={cn(
                  "group flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-accent",
                  index !== items.length - 1 && "border-b border-border"
                )}
              >
                <div className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-grow">
                  <div className="mb-0.5 text-sm font-semibold text-popover-foreground">
                    {item.title}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </button>
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
