import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og"

export const alt = "Sign in to Quist"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgImage({
    eyebrow: "Sign in",
    title: "Welcome back.",
    description: "Pick up where you left off on Quist.",
  })
}
