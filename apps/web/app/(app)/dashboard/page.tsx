import { headers } from "next/headers"
import Link from "next/link"

import { db } from "@workspace/db"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { ModelBadge } from "@/components/model-badge"
import { MotionList, MotionListItem } from "@/components/motion"
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  const solutions = await db.query.solutions.findMany({
    where: (table, { eq }) => eq(table.userId, session.user.id),
    orderBy: (table, { desc }) => desc(table.createdAt),
    columns: {
      id: true,
      questionTitle: true,
      sourceModel: true,
      createdAt: true,
    },
    with: {
      solutionTags: { with: { tag: { columns: { name: true } } } },
    },
    limit: 50,
  })

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-xl font-semibold tracking-tight">
            Your solutions
          </h1>
          <p className="text-xs text-muted-foreground">{session.user.name}</p>
        </div>
        <Link href="/share" className={cn(buttonVariants())}>
          Share a solution
        </Link>
      </div>

      {solutions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border px-6 py-16 text-center">
          <p className="max-w-sm text-sm text-muted-foreground">
            You haven&apos;t shared any solutions yet. Paste an AI chat where
            you solved a problem to get started.
          </p>
          <Link href="/share" className={cn(buttonVariants({ size: "lg" }))}>
            Share your first solution
          </Link>
        </div>
      ) : (
        <MotionList className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
          {solutions.map((solution) => {
            const tags = solution.solutionTags
              .map((link) => link.tag?.name)
              .filter((name): name is string => Boolean(name))

            return (
              <MotionListItem key={solution.id}>
                <Link
                  href={`/solutions/${solution.id}`}
                  className="flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium">
                      {solution.questionTitle}
                    </span>
                    <ModelBadge
                      model={solution.sourceModel}
                      className="mt-0.5"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                    <time
                      dateTime={solution.createdAt.toISOString()}
                      className="tabular-nums"
                    >
                      {solution.createdAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                    {tags.length > 0 ? <span>· {tags.join(", ")}</span> : null}
                  </div>
                </Link>
              </MotionListItem>
            )
          })}
        </MotionList>
      )}
    </div>
  )
}
