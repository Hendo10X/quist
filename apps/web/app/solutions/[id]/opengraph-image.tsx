import { db } from "@workspace/db"

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
        columns: { questionTitle: true, status: true },
      })
    : undefined

  // Drafts are private, so never leak their title into a share card.
  if (!solution || solution.status !== "published") {
    return renderOgImage({ title: "The search engine for AI-solved problems." })
  }

  return renderOgImage({ title: solution.questionTitle })
}
