import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

// Shared Open Graph card. Mirrors the dark theme tokens in globals.css
// (--background / --foreground / --muted-foreground) — text only, no
// gradients or borders.
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = "image/png"

const COLORS = {
  background: "#0a0a0a",
  foreground: "#fafafa",
  muted: "#a1a1a1",
}

type OgCardProps = {
  // Small uppercase label above the title, e.g. "Browse".
  eyebrow?: string
  title: string
  description?: string
  // Bottom-right detail, e.g. "Claude · 12 confirmed".
  meta?: string
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

export async function renderOgImage({
  eyebrow,
  title,
  description,
  meta,
}: OgCardProps) {
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
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: COLORS.background,
          color: COLORS.foreground,
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: COLORS.muted,
          }}
        >
          {eyebrow ? `Quist  /  ${eyebrow}` : "Quist"}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
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
          {description ? (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                lineHeight: 1.4,
                color: COLORS.muted,
                maxWidth: 820,
              }}
            >
              {truncate(description, 140)}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: COLORS.muted,
          }}
        >
          <span>Confirmed AI solutions</span>
          {meta ? <span>{meta}</span> : null}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Mondwest", data: display, style: "normal", weight: 400 }],
    }
  )
}
