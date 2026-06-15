import { headers } from "next/headers"
import Link from "next/link"
import {
  Calendar01Icon,
  File01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { and, count, countDistinct, eq } from "drizzle-orm"

import { db, schema } from "@workspace/db"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { ModelBadge } from "@/components/model-badge"
import { MotionList, MotionListItem, MotionReveal } from "@/components/motion"
import { UserAvatar } from "@/components/user-avatar"
import { auth } from "@/lib/auth"
import type { SourceModel } from "@/lib/solution-schema"

function Stat({
  icon,
  label,
  value,
}: {
  icon: typeof File01Icon
  label: string
  value: string | number
}) {
  return (
    <div className="flex flex-col gap-2 bg-background p-4">
      <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        <HugeiconsIcon
          icon={icon}
          className="size-3 shrink-0 sm:size-3.5"
          strokeWidth={2}
        />
        <span className="truncate font-mono text-[0.5625rem] tracking-wide whitespace-nowrap uppercase sm:text-[0.625rem] sm:tracking-widest">
          {label}
        </span>
      </div>
      <span className="text-base font-semibold tabular-nums sm:text-lg">
        {value}
      </span>
    </div>
  )
}

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return null

  const userId = session.user.id
  const { name, email, image } = session.user

  const [profileUser, modelRows, tagRow, recentSolutions] = await Promise.all([
    db.query.user.findFirst({
      where: (table, { eq }) => eq(table.id, userId),
      columns: { createdAt: true },
    }),
    // Per-model counts — only models the user has actually used appear.
    // Profile reflects public contributions, so drafts are excluded throughout.
    db
      .select({ model: schema.solutions.sourceModel, value: count() })
      .from(schema.solutions)
      .where(
        and(
          eq(schema.solutions.userId, userId),
          eq(schema.solutions.status, "published")
        )
      )
      .groupBy(schema.solutions.sourceModel),
    db
      .select({ value: countDistinct(schema.solutionTags.tagId) })
      .from(schema.solutionTags)
      .innerJoin(
        schema.solutions,
        eq(schema.solutions.id, schema.solutionTags.solutionId)
      )
      .where(
        and(
          eq(schema.solutions.userId, userId),
          eq(schema.solutions.status, "published")
        )
      ),
    db.query.solutions.findMany({
      where: (table, { eq, and }) =>
        and(eq(table.userId, userId), eq(table.status, "published")),
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
    }),
  ])

  const modelCounts = modelRows
    .map((row) => ({
      model: row.model as SourceModel,
      count: Number(row.value),
    }))
    .sort((a, b) => b.count - a.count)

  const totalSolutions = modelCounts.reduce((sum, row) => sum + row.count, 0)
  const tagsUsed = Number(tagRow[0]?.value ?? 0)
  const memberSince = profileUser?.createdAt ?? null

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      {/* Identity */}
      <MotionReveal className="mb-8 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar
            name={name}
            seed={userId}
            image={image}
            className="size-14"
          />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
        <Link href="/share" className={cn(buttonVariants())}>
          Share a solution
        </Link>
      </MotionReveal>

      {totalSolutions === 0 ? (
        <MotionReveal
          delay={0.05}
          className="flex flex-col items-center gap-4 rounded-lg border border-border px-6 py-16 text-center"
        >
          <p className="max-w-sm text-sm text-muted-foreground">
            You haven&apos;t shared any solutions yet. Once you do, your stats
            and contributions show up here.
          </p>
          <Link href="/share" className={cn(buttonVariants({ size: "lg" }))}>
            Share your first solution
          </Link>
        </MotionReveal>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Stats */}
          <MotionReveal
            delay={0.05}
            className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border"
          >
            <Stat icon={File01Icon} label="Solutions" value={totalSolutions} />
            <Stat icon={Tag01Icon} label="Tags used" value={tagsUsed} />
            <Stat
              icon={Calendar01Icon}
              label="Joined"
              value={
                memberSince
                  ? memberSince.toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })
                  : "—"
              }
            />
          </MotionReveal>

          {/* Models used */}
          <MotionReveal delay={0.1} className="flex flex-col gap-3">
            <h2 className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
              Models used
            </h2>
            <div className="flex flex-col gap-2.5">
              {modelCounts.map(({ model, count: used }) => {
                const pct = Math.round((used / totalSolutions) * 100)
                return (
                  <div key={model} className="flex items-center gap-3">
                    <div className="w-20 shrink-0 sm:w-24">
                      <ModelBadge model={model} className="max-w-full truncate" />
                    </div>
                    <div
                      className={cn(
                        `model-${model}`,
                        "h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                      )}
                    >
                      <div
                        className="h-full min-w-[3px] rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "var(--model-fg)",
                        }}
                      />
                    </div>
                    <span className="w-14 text-right text-xs text-muted-foreground tabular-nums">
                      {used} · {pct}%
                    </span>
                  </div>
                )
              })}
            </div>
          </MotionReveal>

          {/* Solutions list */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
                Solutions
              </h2>
              {totalSolutions > recentSolutions.length ? (
                <span className="text-xs text-muted-foreground tabular-nums">
                  Showing {recentSolutions.length} of {totalSolutions}
                </span>
              ) : null}
            </div>

            <MotionList className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
              {recentSolutions.map((solution) => {
                const tags = solution.solutionTags
                  .map((link) => link.tag?.name)
                  .filter((tagName): tagName is string => Boolean(tagName))

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
                      <div className="flex min-w-0 items-center gap-x-2 text-[0.625rem] text-muted-foreground sm:text-xs">
                        <time
                          dateTime={solution.createdAt.toISOString()}
                          className="shrink-0 whitespace-nowrap tabular-nums"
                        >
                          {solution.createdAt.toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </time>
                        {tags.length > 0 ? (
                          <span className="min-w-0 truncate">
                            · {tags.join(", ")}
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </MotionListItem>
                )
              })}
            </MotionList>
          </section>
        </div>
      )}
    </div>
  )
}
