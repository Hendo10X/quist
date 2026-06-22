import { db, schema } from "@workspace/db"
import { and, asc, count, desc, eq, sql } from "drizzle-orm"

import { BrowseFilters } from "@/components/browse-filters"
import { BrowsePagination } from "@/components/browse-pagination"
import { BrowseView, type BrowseItem } from "@/components/browse-view"
import { SiteHeader } from "@/components/site-header"
import { SOURCE_MODELS, type SourceModel } from "@/lib/solution-schema"

const PAGE_SIZE = 20

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{
    tag?: string
    model?: string
    sort?: string
    page?: string
  }>
}) {
  const params = await searchParams

  const model =
    params.model && (SOURCE_MODELS as readonly string[]).includes(params.model)
      ? (params.model as SourceModel)
      : undefined
  const tag = params.tag?.trim() || undefined
  const sort =
    params.sort === "oldest"
      ? "oldest"
      : params.sort === "top"
        ? "top"
        : "newest"
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)

  const where = and(
    // Drafts are private to their author — never list them publicly.
    eq(schema.solutions.status, "published"),
    model ? eq(schema.solutions.sourceModel, model) : undefined,
    tag
      ? sql`exists (select 1 from solution_tags st join tags t on t.id = st.tag_id where st.solution_id = ${schema.solutions.id} and t.name = ${tag})`
      : undefined
  )

  const [solutions, totalRow, tagRows] = await Promise.all([
    db.query.solutions.findMany({
      where,
      orderBy:
        sort === "top"
          ? [
              desc(schema.solutions.confirmationCount),
              desc(schema.solutions.createdAt),
            ]
          : sort === "oldest"
            ? asc(schema.solutions.createdAt)
            : desc(schema.solutions.createdAt),
      columns: {
        id: true,
        questionTitle: true,
        answerBody: true,
        sourceModel: true,
        confirmationCount: true,
        createdAt: true,
      },
      with: {
        author: { columns: { name: true } },
        solutionTags: { with: { tag: { columns: { name: true } } } },
      },
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    }),
    db.select({ value: count() }).from(schema.solutions).where(where),
    // Most-used tags, for the filter dropdown — counting published only.
    db
      .select({ name: schema.tags.name })
      .from(schema.tags)
      .innerJoin(
        schema.solutionTags,
        eq(schema.solutionTags.tagId, schema.tags.id)
      )
      .innerJoin(
        schema.solutions,
        eq(schema.solutions.id, schema.solutionTags.solutionId)
      )
      .where(eq(schema.solutions.status, "published"))
      .groupBy(schema.tags.name)
      .orderBy(sql`count(${schema.solutionTags.solutionId}) desc`)
      .limit(24),
  ])

  const total = totalRow[0]?.value ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
    confirmations: solution.confirmationCount,
  }))

  const availableTags = tagRows.map((row) => row.name)
  const hasFilters = Boolean(model || tag)

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <div className="mx-auto w-full max-w-4xl px-6 py-10">
        <div className="mb-5 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">Browse</h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Recently shared, confirmed AI solutions.
          </p>
        </div>

        <BrowseFilters
          tags={availableTags}
          activeTag={tag}
          activeModel={model}
          activeSort={sort}
        />

        <div className="mt-5">
          <BrowseView
            items={items}
            emptyMessage={
              hasFilters
                ? "No solutions match these filters."
                : "No solutions yet. Be the first to share one."
            }
          />
        </div>

        <BrowsePagination
          page={page}
          totalPages={totalPages}
          params={{ model, tag, sort }}
        />
      </div>
    </div>
  )
}
