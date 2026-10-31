import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

// Shared Open Graph card. Mirrors the dark theme tokens in globals.css
// (--background / --foreground). Just the title: no subtext, gradients
// or borders.
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

const COLORS = {
  background: "#0a0a0a",
  foreground: "#fafafa",
}

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

// Long solution titles step down so they stay within three lines.
function titleSize(title: string) {
  if (title.length > 80) return 60
  if (title.length > 50) return 72
  return 88
}

export async function renderOgImage({ title }: { title: string }) {
  const display = await readFile(
    join(process.cwd(), "public/fonts/ppmondwest-regular.otf")
  )
  const safeTitle = truncate(title, 110)
  const fontSize = titleSize(safeTitle)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: 80,
          background: COLORS.background,
          color: COLORS.foreground,
        }}
      >
        {/* Word-by-word so Satori never splits hyphenated words ("AI-solved"). */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            columnGap: fontSize * 0.2,
            fontFamily: "Mondwest",
            fontSize,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 1000,
          }}
        >
          {safeTitle.split(/\s+/).map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Mondwest", data: display, style: "normal", weight: 400 }],
    }
  )
}
