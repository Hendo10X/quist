import { db } from "@workspace/db"

import { BrowseView, type BrowseItem } from "@/components/browse-view"
import { SiteHeader } from "@/components/site-header"

export default async function BrowsePage() {
  const solutions = await db.query.solutions.findMany({
    orderBy: (table, { desc }) => desc(table.createdAt),
    columns: {
      id: true,
      questionTitle: true,
      answerBody: true,
      sourceModel: true,
      createdAt: true,
    },
    with: {
      author: { columns: { name: true } },
      solutionTags: { with: { tag: { columns: { name: true } } } },
    },
    limit: 50,
  })

  const items: BrowseItem[] = solutions.map((solution) => ({
    id: solution.id,
    title: solution.questionTitle,
    preview:
      solution.answerBody.length > 160
        ? `${solution.answerBody.slice(0, 160).trimEnd()}…`
        : solution.answerBody,
    model: solution.sourceModel,
    author: solution.author?.name ?? "Anonymous",
    date: solution.createdAt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    tags: solution.solutionTags
      .map((link) => link.tag?.name)
      .filter((name): name is string => Boolean(name)),
  }))

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Browse</h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Recently shared, confirmed AI solutions.
          </p>
        </div>

        <BrowseView items={items} />
      </div>
    </div>
  )
}
