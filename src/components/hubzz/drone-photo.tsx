import * as React from "react"

import { cn } from "@/lib/utils"

export interface DronePhotoProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  alt?: string
  timestamp?: string
  locationUrl?: string
}

export function DronePhoto({
  className,
  imageUrl,
  alt = "Drone capture",
  timestamp,
  locationUrl,
  ...props
}: DronePhotoProps) {
  const hasMetadata = timestamp || locationUrl

  return (
    <figure
      className={cn(
        "relative aspect-[882/572] w-full max-w-[882px] overflow-hidden rounded-sm bg-black/10",
        className
      )}
      {...props}
    >
      <img
        src={imageUrl}
        alt={alt}
        className="absolute inset-0 size-full object-cover"
      />

      {hasMetadata ? (
        <>
          <div
            className="pointer-events-none absolute bottom-0 left-0 h-[60px] w-[196px] bg-gradient-to-t from-black to-transparent"
            aria-hidden="true"
          />
          <figcaption className="absolute bottom-3 left-3 flex flex-col text-[11px] leading-4 font-medium tracking-[0.88px] text-hubzz-muted uppercase opacity-72">
            {timestamp ? <span>{timestamp}</span> : null}
            {locationUrl ? <span>{locationUrl}</span> : null}
          </figcaption>
        </>
      ) : null}
    </figure>
  )
}
