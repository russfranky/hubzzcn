import * as React from "react"
import { Check, Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CopyCommand({
  command,
  className,
  label = "Copy command",
}: {
  command: string
  className?: string
  label?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const resetTimerRef = React.useRef<number | null>(null)
  const requestRef = React.useRef(0)
  const toastId = React.useId()

  React.useEffect(() => {
    return () => {
      requestRef.current += 1
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current)
      }
      toast.dismiss(toastId)
    }
  }, [toastId])

  const copy = React.useCallback(async () => {
    const request = ++requestRef.current
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current)
      resetTimerRef.current = null
    }
    setCopied(false)

    try {
      await navigator.clipboard.writeText(command)
    } catch {
      if (request !== requestRef.current) return
      toast.error("Could not copy command", {
        id: toastId,
        description:
          "Select the command text to copy it manually, or try again.",
      })
      return
    }

    if (request !== requestRef.current) return
    toast.dismiss(toastId)
    setCopied(true)
    resetTimerRef.current = window.setTimeout(() => {
      setCopied(false)
      resetTimerRef.current = null
    }, 1600)
  }, [command, toastId])

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2",
        className
      )}
    >
      <code className="min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto font-mono text-[11px] leading-5 text-secondary-foreground">
        {command}
      </code>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={copy}
        aria-label={copied ? "Copied" : label}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <Check className="size-3.5" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" aria-hidden="true" />
        )}
      </Button>
    </div>
  )
}
