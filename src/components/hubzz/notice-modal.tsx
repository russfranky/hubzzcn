import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

export interface NoticeModalProps {
  open: boolean
  onClose: () => void
  onAgree?: () => void
  onTermsClick?: () => void
  termsHref?: string
  className?: string
}

/**
 * Terms notice modal, ported from the Figma Make project
 * "Digital Merch Modal" (file 7w2KEWk6WBaOOaDQSjRd1S, NoticeModal.tsx).
 *
 * Copy and the single Agree action come from the Figma source. The
 * shell is hubzzcn's Dialog with semantic tokens; the Agree button is
 * the themed primary Button. The visible heading is screen-reader only,
 * as in the source, which shows body copy alone.
 */
export function NoticeModal({
  open,
  onClose,
  onAgree,
  onTermsClick,
  termsHref = "/terms-of-service",
  className,
}: NoticeModalProps) {
  const handleAgree = () => {
    onAgree?.()
    onClose()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        className={cn(
          "flex flex-col gap-8 p-8 text-center sm:max-w-md",
          className
        )}
      >
        <DialogTitle className="sr-only">Notice</DialogTitle>
        <DialogDescription className="text-lg leading-relaxed">
          By using Hubzz, you agree to the{" "}
          <a
            href={termsHref}
            onClick={(event) => {
              if (onTermsClick) {
                event.preventDefault()
                onTermsClick()
              }
            }}
            className="font-semibold text-popover-foreground underline transition-all hover:no-underline"
          >
            Terms of Service
          </a>
          . Only post content you own or have permission to use, and don&rsquo;t
          share private information about others.
        </DialogDescription>

        <footer className="w-full">
          <Button
            size="lg"
            className="w-full"
            data-bi-key="notice_modal_agree"
            onClick={handleAgree}
          >
            Agree
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  )
}
