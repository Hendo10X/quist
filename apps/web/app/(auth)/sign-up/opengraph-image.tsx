import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og"

export const alt = "Join Quist"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgImage({
    eyebrow: "Sign up",
    title: "Keep the fixes you find with AI.",
    description: "Save, share, and confirm solutions that actually worked.",
  })
}
