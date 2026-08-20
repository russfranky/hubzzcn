import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Hubzz keeps the shadcn Button contract and changes only the visual layer.
 *
 * - `default`, `secondary`, `outline`, `ghost`, `destructive`, and `link`
 *   remain semantic variants rather than separate components.
 * - `disabled` is the native button state, not a visual variant.
 * - `default` size maps to the Hubzz medium control size.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-transparent font-semibold whitespace-nowrap transition-[background,border-color,box-shadow,color,opacity,transform] outline-none select-none disabled:pointer-events-none disabled:opacity-[0.32] aria-invalid:border-destructive aria-invalid:ring-4 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground [background:var(--primary-gradient)] hover:[background:var(--primary)] focus-visible:ring-4 focus-visible:ring-[rgba(227,223,254,0.24)] active:ring-4 active:ring-[rgba(227,223,254,0.24)] active:[background:var(--primary)]",
        secondary:
          "bg-background text-foreground hover:bg-[#393E44] focus-visible:ring-4 focus-visible:ring-[rgba(122,123,125,0.4)] active:bg-background active:ring-4 active:ring-[rgba(122,123,125,0.4)]",
        outline:
          "border-border bg-transparent text-foreground hover:border-foreground hover:bg-transparent focus-visible:ring-4 focus-visible:ring-ring/20 active:border-[#7C878E] active:ring-4 active:ring-[rgba(122,123,125,0.4)]",
        ghost:
          "bg-transparent text-foreground hover:bg-[#393E44] focus-visible:ring-4 focus-visible:ring-ring/20 active:bg-card",
        destructive:
          "bg-[#D92D20] text-white hover:bg-[#B42318] focus-visible:ring-4 focus-visible:ring-[rgba(254,228,226,0.24)] active:bg-[#D92D20] active:ring-4 active:ring-[rgba(254,228,226,0.24)]",
        link: "h-auto rounded-none border-0 p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-11 px-5 text-sm leading-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-5",
        xs: "h-7 px-2.5 text-xs leading-[18px] [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 px-3.5 text-xs leading-[18px] [&_svg:not([class*='size-'])]:size-4",
        lg: "h-12 px-6 text-base leading-6 [&_svg:not([class*='size-'])]:size-5",
        icon: "size-11 p-3 [&_svg:not([class*='size-'])]:size-5",
        "icon-xs": "size-7 p-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 p-2 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 p-3.5 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
