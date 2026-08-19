import { ChevronLeft, Plus, X } from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ProfileHeaderAvatar {
  id: string
  selected?: boolean
  src?: string
  alt?: string
  fallback?: string
}

export interface ProfileHeaderProps {
  className?: string
  avatars?: ProfileHeaderAvatar[]
  heroImage?: string
  heroImageAlt?: string
  onAvatarSelect?: (id: string) => void
  onBack?: () => void
  onClose?: () => void
  onAddAvatar?: () => void
  onSave?: () => void
}

export function ProfileHeader({
  className,
  avatars = [],
  heroImage,
  heroImageAlt = "Profile preview",
  onAvatarSelect,
  onBack,
  onClose,
  onAddAvatar,
  onSave,
}: ProfileHeaderProps) {
  return (
    <section
      aria-label="Profile appearance"
      className={cn(
        "relative flex w-[208px] flex-col gap-4 overflow-hidden rounded-xl bg-card px-3 pt-7 pb-3",
        className
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={onClose}
        aria-label="Close profile appearance"
        className="absolute top-1.5 right-1.5 z-10 text-muted-foreground hover:text-foreground"
      >
        <X aria-hidden="true" />
      </Button>

      <div className="relative flex h-[123px] w-[184px] items-center justify-center overflow-hidden rounded-lg bg-background/40">
        {heroImage ? (
          <img
            src={heroImage}
            alt={heroImageAlt}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xs text-muted-foreground">No preview</span>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-center text-xs font-medium text-secondary-foreground">
          Change look
        </h3>

        <div className="flex items-center gap-2" aria-label="Choose avatar">
          {avatars.slice(0, 4).map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onAvatarSelect?.(avatar.id)}
              aria-label={avatar.alt ?? `Choose avatar ${avatar.id}`}
              aria-pressed={avatar.selected ?? false}
              className={cn(
                "size-[31px] shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                avatar.selected && "ring-2 ring-primary ring-offset-2 ring-offset-card"
              )}
            >
              <Avatar className="size-full">
                {avatar.src ? (
                  <AvatarImage src={avatar.src} alt={avatar.alt ?? ""} />
                ) : null}
                <AvatarFallback className="bg-[#D0CAFD] text-xs text-primary">
                  {avatar.fallback ?? avatar.id.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          ))}

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={onAddAvatar}
            aria-label="Add avatar"
            className="size-[31px] shrink-0 rounded-full border-dashed"
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onBack}
          aria-label="Go back"
          className="h-8 w-[31px] shrink-0"
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSave}
          className="h-8 flex-1"
        >
          Save changes
        </Button>
      </div>
    </section>
  )
}
