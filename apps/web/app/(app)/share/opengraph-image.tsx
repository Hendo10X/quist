import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og"

export const alt = "Share an AI solution on Quist"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return renderOgImage({
    eyebrow: "Share",
    title: "Turn an AI chat into a searchable solution.",
    description:
      "Paste the transcript that fixed your bug. Quist structures the rest.",
  })
}
