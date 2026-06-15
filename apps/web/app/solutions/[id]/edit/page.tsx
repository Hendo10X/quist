import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { db } from "@workspace/db"

import { BackButton } from "@/components/back-button"
import { EditSolution } from "@/components/edit-solution"
import { SiteHeader } from "@/components/site-header"
import type { SolutionDraft } from "@/components/solution-fields"
import { auth } from "@/lib/auth"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function EditSolutionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!UUID_RE.test(id)) notFound()

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/sign-in")

  const solution = await db.query.solutions.findFirst({
    where: (table, { eq }) => eq(table.id, id),
    with: {
      codeSnippets: true,
      solutionTags: { with: { tag: { columns: { name: true } } } },
    },
  })

  // Don't reveal whether a solution exists to anyone but its owner.
  if (!solution || solution.userId !== session.user.id) notFound()

  const initial: SolutionDraft = {
    questionTitle: solution.questionTitle,
    questionBody: solution.questionBody,
    answerBody: solution.answerBody,
    sourceModel: solution.sourceModel,
    tags: solution.solutionTags
      .map((link) => link.tag?.name)
      .filter((name): name is string => Boolean(name)),
    codeSnippets: [...solution.codeSnippets]
      .sort((a, b) => a.position - b.position)
      .map((snippet) => ({
        language: snippet.language,
        content: snippet.content,
      })),
  }

  return (
    <div className="min-h-svh">
      <SiteHeader />
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        <BackButton className="mb-4 -ml-2" />
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">
            Edit solution
          </h1>
          <p className="text-xs/relaxed text-muted-foreground">
            Update the title, question, answer, model, tags, or code snippets.
          </p>
        </div>
        <EditSolution
          solutionId={id}
          initialStatus={solution.status}
          initial={initial}
        />
      </div>
    </div>
  )
}
