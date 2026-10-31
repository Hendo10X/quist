import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og"

export const alt = "Browse confirmed AI solutions on Quist"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgImage({
    eyebrow: "Browse",
    title: "Recently shared, confirmed AI solutions.",
    description: "Bugs solved with Claude, ChatGPT, Gemini and more.",
  })
}
