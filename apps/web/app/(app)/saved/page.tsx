import { headers } from "next/headers"

import { db } from "@workspace/db"

import { BrowseView, type BrowseItem } from "@/components/browse-view"
import { auth } from "@/lib/auth"

export default async function SavedPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  // The (app) layout already redirects unauthenticated visitors.
  if (!session) return null

  const rows = await db.query.solutionBookmarks.findMany({
    where: (table, { eq }) => eq(table.userId, session.user.id),
    orderBy: (table, { desc }) => desc(table.createdAt),
    with: {
      solution: {
        with: {
          author: { columns: { name: true } },
          solutionTags: { with: { tag: { columns: { name: true } } } },
        },
      },
    },
  })

  // A bookmarked solution that's since been unpublished or deleted drops out.
  const items: BrowseItem[] = rows
    .map((row) => row.solution)
    .filter(
      (solution): solution is NonNullable<typeof solution> =>
        Boolean(solution) && solution.status === "published"
    )
    .map((solution) => ({
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
      confirmations: solution.confirmationCount,
    }))

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-5 flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Saved</h1>
        <p className="text-xs/relaxed text-muted-foreground">
          Solutions you&apos;ve bookmarked to revisit.
        </p>
      </div>

      <BrowseView
        items={items}
        emptyMessage="You haven't saved anything yet. Tap Save on a solution to bookmark it."
      />
    </div>
  )
}
