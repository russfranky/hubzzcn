import { DronePhoto } from "@/components/drone-photo"
import type { Meta, Example } from "./types"

export const meta: Meta<typeof DronePhoto> = {
  title: "DronePhoto",
  slug: "drone-photo",
  navLabel: "Drone Photo",
  component: DronePhoto,
  description:
    "A display card for drone selfie captures taken inside Hubzz. Shows an image with overlaid metadata (timestamp and location).",
  category: "hubzz",
  notes: [
    "Used to wrap an image captured from the in-world drone.",
    "Uses inline Tailwind utility classes only — no shadcn component variants.",
    "Component is responsive but has a max width and aspect ratio per the design spec.",
  ],
}

const BASE = {
  imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=2000&auto=format&fit=crop",
  timestamp: "06/13/24 11:12 UTC",
  locationUrl: "hubzz.com/0,0/8,13/-1",
}

import { type DronePhotoProps } from "@/components/drone-photo"

export const Default: Example<DronePhotoProps> = {
  name: "Default",
  args: { ...BASE } as DronePhotoProps,
}

export const examples = [Default]
