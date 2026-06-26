import { headers } from "next/headers"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Edit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { db, schema } from "@workspace/db"
import { and, desc, eq, ne, sql } from "drizzle-orm"
import { Badge } from "@workspace/ui/components/badge"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { BackButton } from "@/components/back-button"
import { CodeBlock } from "@/components/code-block"
import { ConfirmButton } from "@/components/confirm-button"
import { ModelBadge } from "@/components/model-badge"
import { MotionReveal } from "@/components/motion"
import { SaveButton } from "@/components/save-button"
import { ShareLinkButton } from "@/components/share-link-button"
import { SiteHeader } from "@/components/site-header"
import { auth } from "@/lib/auth"
import { highlightCode } from "@/lib/highlight"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!UUID_RE.test(id)) notFound()

  const solution = await db.query.solutions.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: {
      author: { columns: { name: true } },
      codeSnippets: true,
      solutionTags: { with: { tag: true } },
    },
  })

  if (!solution) notFound()

  const session = await auth.api.getSession({ headers: await headers() })
  const isOwner = session?.user.id === solution.userId
  // Drafts are visible only to their author.
  if (solution.status === "draft" && !isOwner) notFound()

  // Has the current (non-author) user already confirmed this worked?
  let confirmed = false
  if (session && !isOwner) {
    const mine = await db.query.solutionConfirmations.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.solutionId, solution.id), eq(table.userId, session.user.id)),
      columns: { solutionId: true },
    })
    confirmed = Boolean(mine)
  }

  // Has the current user bookmarked this?
  let saved = false
  if (session) {
    const mark = await db.query.solutionBookmarks.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.solutionId, solution.id), eq(table.userId, session.user.id)),
      columns: { solutionId: true },
    })
    saved = Boolean(mark)
  }

  // Other published solutions that share at least one tag — most-confirmed first.
  const related = await db
    .select({
      id: schema.solutions.id,
      title: schema.solutions.questionTitle,
      sourceModel: schema.solutions.sourceModel,
      confirmations: schema.solutions.confirmationCount,
    })
    .from(schema.solutions)
    .where(
      and(
        eq(schema.solutions.status, "published"),
        ne(schema.solutions.id, solution.id),
        sql`exists (select 1 from solution_tags st where st.solution_id = ${schema.solutions.id} and st.tag_id in (select tag_id from solution_tags where solution_id = ${solution.id}))`
      )
    )
    .orderBy(
      desc(schema.solutions.confirmationCount),
      desc(schema.solutions.createdAt)
    )
    .limit(4)

  const tags = solution.solutionTags
    .map((link) => link.tag?.name)
    .filter((name): name is string => Boolean(name))

  const snippets = await Promise.all(
    [...solution.codeSnippets]
      .sort((a, b) => a.position - b.position)
      .map(async (snippet) => ({
        ...snippet,
        html: await highlightCode(snippet.content, snippet.language),
      }))
  )

  return (
    <div className="min-h-svh">
      <SiteHeader />

      <article className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between gap-2">
          <BackButton className="-ml-2" />
          <div className="flex items-center gap-2">
            {solution.status === "published" ? (
              <>
                <ShareLinkButton path={`/solutions/${solution.id}`} />
                <SaveButton
                  solutionId={solution.id}
                  initialSaved={saved}
                  signedIn={Boolean(session)}
                />
              </>
            ) : null}
            {isOwner ? (
              <Link
                href={`/solutions/${solution.id}/edit`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                <HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
                Edit
              </Link>
            ) : null}
          </div>
        </div>
        <MotionReveal className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-balance">
            {solution.questionTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <ModelBadge model={solution.sourceModel} />
            {solution.status === "draft" ? (
              <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-700 dark:text-amber-500"
              >
                Draft
              </Badge>
            ) : null}
            <span>{solution.author?.name ?? "Anonymous"}</span>
            <span aria-hidden>·</span>
            <time
              dateTime={solution.createdAt.toISOString()}
              className="tabular-nums"
            >
              {solution.createdAt.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
        </MotionReveal>

        {solution.status === "published" ? (
          <MotionReveal delay={0.03}>
            <ConfirmButton
              solutionId={solution.id}
              initialConfirmed={confirmed}
              initialCount={solution.confirmationCount}
              canConfirm={Boolean(session) && !isOwner}
              signedIn={Boolean(session)}
            />
          </MotionReveal>
        ) : null}

        <MotionReveal delay={0.06} className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Question
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {solution.questionBody}
          </p>
        </MotionReveal>

        <MotionReveal delay={0.12} className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Answer
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {solution.answerBody}
          </p>
        </MotionReveal>

        {snippets.length > 0 ? (
          <section className="flex flex-col gap-3">
            {snippets.map((snippet) => (
              <CodeBlock
                key={snippet.id}
                html={snippet.html}
                code={snippet.content}
                language={snippet.language}
              />
            ))}
          </section>
        ) : null}

        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}

        {related.length > 0 ? (
          <section className="flex flex-col gap-3 border-t border-border pt-6">
            <h2 className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
              Related solutions
            </h2>
            <div className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/solutions/${item.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <span className="line-clamp-1 text-sm font-medium">
                    {item.title}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    {item.confirmations > 0 ? (
                      <span className="text-[0.625rem] text-muted-foreground tabular-nums">
                        {item.confirmations} confirmed
                      </span>
                    ) : null}
                    <ModelBadge model={item.sourceModel} />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </div>
  )
}
