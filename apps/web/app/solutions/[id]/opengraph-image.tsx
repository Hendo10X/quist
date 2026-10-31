import { db } from "@workspace/db"

import { modelLabel } from "@/components/model-badge"
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const alt = "An AI-solved problem on Quist"
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const solution = UUID_RE.test(id)
    ? await db.query.solutions.findFirst({
        where: (table, { eq }) => eq(table.id, id),
        columns: {
          questionTitle: true,
          sourceModel: true,
          confirmationCount: true,
          status: true,
        },
        with: { author: { columns: { name: true } } },
      })
    : undefined

  // Drafts are private — never leak their title into a share card.
  if (!solution || solution.status !== "published") {
    return renderOgImage({
      eyebrow: "Solution",
      title: "The search engine for AI-solved problems.",
    })
  }

  const meta = [
    `Solved with ${modelLabel(solution.sourceModel)}`,
    solution.confirmationCount > 0
      ? `${solution.confirmationCount} confirmed`
      : null,
  ]
    .filter(Boolean)
    .join("  ·  ")

  return renderOgImage({
    eyebrow: "Solution",
    title: solution.questionTitle,
    description: solution.author?.name ? `by ${solution.author.name}` : undefined,
    meta,
  })
}
