import {
  DronePhoto,
  type DronePhotoProps,
} from "@/components/hubzz/drone-photo"
import type { Example, Meta } from "./types"

export const meta: Meta<typeof DronePhoto> = {
  title: "DronePhoto",
  slug: "drone-photo",
  navLabel: "Drone Photo",
  component: DronePhoto,
  description:
    "Responsive media treatment for in-world captures with optional timestamp and location metadata.",
  category: "hubzz",
  layer: "component",
  notes: [
    "Pass meaningful alt text when the image communicates content.",
    "Metadata is rendered as a figure caption rather than a decorative overlay only.",
    "The component owns presentation only; capture and upload behavior stays in the product.",
  ],
}

export const Default: Example<DronePhotoProps> = {
  name: "With metadata",
  args: {
    imageUrl: "/favicon.svg",
    alt: "Hubzz drone capture placeholder",
    timestamp: "06/13/24 11:12 UTC",
    locationUrl: "hubzz.xyz/0,0/8,13/-1",
  },
}

export const examples = [Default]
