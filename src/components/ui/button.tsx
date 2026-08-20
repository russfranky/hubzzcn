import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Hubzz keeps the shadcn Button contract and changes only the visual layer.
 *
 * The variants stay semantic and source their color treatment from theme
 * roles so registry consumers inherit the same behavior as the catalog.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-transparent font-semibold whitespace-nowrap transition-[background,border-color,box-shadow,color,opacity,transform] outline-none select-none focus-visible:ring-4 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:opacity-[0.32] aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground [background:var(--primary-gradient)] hover:[background:var(--primary)] active:[background:var(--primary)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-accent hover:text-foreground active:bg-secondary",
        outline:
          "border-border bg-transparent text-foreground hover:border-foreground hover:bg-transparent active:border-muted-foreground",
        ghost:
          "bg-transparent text-foreground hover:bg-accent active:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/85 active:bg-destructive",
        link:
          "h-auto rounded-none border-0 p-0 text-primary underline-offset-4 hover:underline",
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
