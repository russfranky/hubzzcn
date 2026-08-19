import { XCircle, Plus, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export interface ProfileHeaderProps {
  className?: string
  avatars?: { id: string; selected?: boolean }[]
  heroImage?: string
  onBack?: () => void
  onClose?: () => void
  onAddAvatar?: () => void
  onSave?: () => void
}

export function ProfileHeader({
  className,
  avatars = [],
  heroImage,
  onBack,
  onClose,
  onAddAvatar,
  onSave,
}: ProfileHeaderProps) {
  const outlineBtn =
    "flex items-center justify-center rounded-[40px] border-[1.5px] border-[#464F55] bg-transparent text-foreground transition-colors hover:bg-hubzz-hover"

  return (
    <div
      className={cn(
        "relative flex w-[208px] flex-col gap-4 overflow-hidden rounded-xl bg-card px-3 pb-3 pt-7",
        className
      )}
    >
      <button
        type="button"
        className="absolute right-2 top-2 z-10 text-muted-foreground transition-colors hover:text-foreground"
        onClick={onClose}
        aria-label="Close"
      >
        <XCircle className="size-5 stroke-[1.5]" />
      </button>

      <div className="relative flex h-[123px] w-[184px] items-center justify-center overflow-hidden">
        {heroImage && (
          <img src={heroImage} alt="Hero" className="h-[123px] w-full object-cover" />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-center text-[10px] font-normal leading-[14px] text-secondary-foreground">
          Change Look
        </h3>

        <div className="flex items-center gap-2">
          {avatars.slice(0, 4).map((avatar) => (
            <Avatar
              key={avatar.id}
              className={cn(
                "size-[31px] shrink-0 cursor-pointer rounded-full transition-colors",
                avatar.selected && "ring-[1.5px] ring-hubzz-purple ring-offset-2 ring-offset-card"
              )}
            >
              <AvatarImage src={`https://i.pravatar.cc/150?u=${avatar.id}`} />
              <AvatarFallback className="bg-[#D0CAFD] text-[10px] text-hubzz-purple">
                U
              </AvatarFallback>
            </Avatar>
          ))}

          <button
            type="button"
            onClick={onAddAvatar}
            className="flex size-[31px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-dashed border-muted-foreground bg-card text-foreground transition-colors hover:border-foreground"
            aria-label="Add avatar"
          >
            <Plus className="size-[17px] stroke-[1.5]" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <button type="button" className={cn(outlineBtn, "h-8 w-[31px] shrink-0")} onClick={onBack}>
          <ChevronLeft className="size-4 stroke-[1.5]" />
        </button>
        <button type="button" className={cn(outlineBtn, "h-8 w-[145px] text-xs font-semibold")} onClick={onSave}>
          Save changes
        </button>
      </div>
    </div>
  )
}
