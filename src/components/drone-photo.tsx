import * as React from "react"
import { cn } from "@/lib/utils"

export interface DronePhotoProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string
  timestamp?: string
  locationUrl?: string
}

export function DronePhoto({
  className,
  imageUrl,
  timestamp,
  locationUrl,
  ...props
}: DronePhotoProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden w-full max-w-[882px] aspect-[882/572] bg-black/10 rounded-sm",
        className
      )}
      {...props}
    >
      {/* Background Image */}
      <img
        src={imageUrl}
        alt="Drone Capture"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient Overlay for Text Contrast */}
      <div className="absolute bottom-0 left-0 w-[196px] h-[60px] bg-gradient-to-t from-black to-transparent pointer-events-none" />

      {/* Text Container */}
      <div className="absolute bottom-3 left-3 flex flex-col text-[11px] font-medium uppercase leading-4 tracking-[0.88px] text-hubzz-muted opacity-[0.72]">
        {timestamp && <span>{timestamp}</span>}
        {locationUrl && <span>{locationUrl}</span>}
      </div>
    </div>
  )
}
