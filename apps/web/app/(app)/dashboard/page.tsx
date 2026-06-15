import { headers } from "next/headers"
import Link from "next/link"
import { Edit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { db } from "@workspace/db"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { DeleteSolutionButton } from "@/components/delete-solution-button"
import { ModelBadge } from "@/components/model-badge"
import { MotionList, MotionListItem } from "@/components/motion"
import { auth } from "@/lib/auth"
import type { SolutionStatus, SourceModel } from "@/lib/solution-schema"

function SolutionRow({
  id,
  title,
  model,
  status,
  createdAt,
  tags,
}: {
  id: string
  title: string
  model: SourceModel
  status: SolutionStatus
  createdAt: Date
  tags: string[]
}) {
  const isDraft = status === "draft"

  return (
    <MotionListItem>
      <div className="group flex items-stretch transition-colors hover:bg-muted/40">
        <Link
          href={isDraft ? `/solutions/${id}/edit` : `/solutions/${id}`}
          className="flex min-w-0 flex-1 flex-col gap-1.5 px-4 py-3"
        >
          <div className="flex items-start justify-between gap-3">
            <span className="text-sm font-medium">{title}</span>
            <ModelBadge model={model} className="mt-0.5" />
          </div>
          <div className="flex min-w-0 items-center gap-x-2 text-[0.625rem] text-muted-foreground sm:text-xs">
            <time
              dateTime={createdAt.toISOString()}
              className="shrink-0 whitespace-nowrap tabular-nums"
            >
              {createdAt.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </time>
            {tags.length > 0 ? (
              <span className="min-w-0 truncate">· {tags.join(", ")}</span>
            ) : null}
          </div>
        </Link>

        <div className="flex shrink-0 items-start gap-0.5 pr-1.5">
          <Link
            href={`/solutions/${id}/edit`}
            aria-label="Edit solution"
            className="mt-2.5 flex shrink-0 items-center self-start rounded-md p-1.5 text-muted-foreground opacity-0 transition-[opacity,color,transform] duration-200 ease-out group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100 active:scale-[0.96] motion-reduce:transition-none [@media(hover:none)]:opacity-100"
          >
            <HugeiconsIcon icon={Edit02Icon} className="size-4" strokeWidth={2} />
          </Link>
          <DeleteSolutionButton solutionId={id} solutionTitle={title} />
        </div>
      </div>
    </MotionListItem>
  )
}

function rowProps(solution: {
  id: string
  questionTitle: string
  sourceModel: SourceModel
  status: SolutionStatus
  createdAt: Date
  solutionTags: { tag: { name: string } | null }[]
}) {
  return {
    id: solution.id,
    title: solution.questionTitle,
    model: solution.sourceModel,
    status: solution.status,
    createdAt: solution.createdAt,
    tags: solution.solutionTags
      .map((link) => link.tag?.name)
      .filter((name): name is string => Boolean(name)),
  }
}

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
      status: true,
      createdAt: true,
    },
    with: {
      solutionTags: { with: { tag: { columns: { name: true } } } },
    },
    limit: 50,
  })

  const drafts = solutions.filter((solution) => solution.status === "draft")
  const published = solutions.filter(
    (solution) => solution.status === "published"
  )

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
            You haven&apos;t shared any solutions yet. Paste an AI chat where you
            solved a problem to get started.
          </p>
          <Link href="/share" className={cn(buttonVariants({ size: "lg" }))}>
            Share your first solution
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {drafts.length > 0 ? (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <h2 className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
                  Drafts
                </h2>
                <Badge
                  variant="outline"
                  className="border-amber-500/40 text-amber-700 tabular-nums dark:text-amber-500"
                >
                  {drafts.length}
                </Badge>
              </div>
              <MotionList className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
                {drafts.map((solution) => (
                  <SolutionRow key={solution.id} {...rowProps(solution)} />
                ))}
              </MotionList>
            </section>
          ) : null}

          {published.length > 0 ? (
            <section className="flex flex-col gap-3">
              {drafts.length > 0 ? (
                <h2 className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
                  Published
                </h2>
              ) : null}
              <MotionList className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
                {published.map((solution) => (
                  <SolutionRow key={solution.id} {...rowProps(solution)} />
                ))}
              </MotionList>
            </section>
          ) : null}
        </div>
      )}
    </div>
  )
}
