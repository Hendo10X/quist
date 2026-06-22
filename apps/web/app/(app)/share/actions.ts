"use server"

import { db, schema } from "@workspace/db"
import { request } from "@arcjet/next"
import { generateObject } from "ai"
import { and, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { parserModel } from "@/lib/ai"
import { ajParse } from "@/lib/arcjet"
import { auth } from "@/lib/auth"
import { bumpSearchVersion } from "@/lib/search"
import {
  createSolutionSchema,
  normalizeTags,
  parsedSolutionSchema,
  updateSolutionSchema,
  type CreateSolutionInput,
  type ParsedSolution,
  type SolutionStatus,
  type UpdateSolutionInput,
} from "@/lib/solution-schema"

type CodeSnippetInput = { language: string | null; content: string }

// Revalidate the surfaces a solution can appear on. Public listings only matter
// when it's (or was) published; the dashboard always shows the author's own.
function revalidateSolutionViews(id?: string) {
  revalidatePath("/dashboard")
  revalidatePath("/profile")
  revalidatePath("/browse")
  if (id) revalidatePath(`/solutions/${id}`)
}

// Upsert tag rows, then link them to the solution. neon-http has no interactive
// transactions, so these run as separate round-trips. Acceptable for the MVP.
async function linkTags(solutionId: string, tags: string[]) {
  const tagNames = normalizeTags(tags)
  if (tagNames.length === 0) return

  await db
    .insert(schema.tags)
    .values(tagNames.map((name) => ({ name })))
    .onConflictDoNothing()

  const tagRows = await db
    .select({ id: schema.tags.id })
    .from(schema.tags)
    .where(inArray(schema.tags.name, tagNames))

  if (tagRows.length > 0) {
    await db
      .insert(schema.solutionTags)
      .values(tagRows.map((tag) => ({ solutionId, tagId: tag.id })))
  }
}

async function insertSnippets(solutionId: string, snippets: CodeSnippetInput[]) {
  if (snippets.length === 0) return
  await db.insert(schema.codeSnippets).values(
    snippets.map((snippet, index) => ({
      solutionId,
      language: snippet.language,
      content: snippet.content,
      position: index,
    }))
  )
}

type ParseResult =
  | { ok: true; data: ParsedSolution }
  | { ok: false; error: string }

const MAX_TRANSCRIPT = 30_000

export async function parseTranscriptAction(
  transcript: string
): Promise<ParseResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { ok: false, error: "You must be signed in to share a solution." }
  }

  const trimmed = transcript.trim()
  if (trimmed.length < 40) {
    return { ok: false, error: "Paste a longer transcript to parse." }
  }
  if (trimmed.length > MAX_TRANSCRIPT) {
    return { ok: false, error: "That transcript is too long (max ~30k chars)." }
  }

  // Rate-limit the paid LLM call.
  const decision = await ajParse.protect(await request())
  if (decision.isDenied()) {
    return {
      ok: false,
      error: "You're parsing too fast. Please wait a few minutes.",
    }
  }

  try {
    const { object } = await generateObject({
      model: parserModel,
      schema: parsedSolutionSchema,
      prompt: buildPrompt(trimmed),
      // llama-3.3-70b-versatile supports JSON mode but not `json_schema`
      // response format. Disable Groq structured outputs so the SDK uses JSON
      // mode and validates the result against the Zod schema itself.
      providerOptions: { groq: { structuredOutputs: false } },
    })
    return { ok: true, data: object }
  } catch (error) {
    // Surface the provider's real reason (status + body/url) while building.
    console.error("[parseTranscript] generateObject failed:", error)
    const e = error as {
      statusCode?: number
      responseBody?: string
      url?: string
      message?: string
    }
    const detail =
      e.statusCode || e.responseBody || e.url
        ? `${e.statusCode ?? ""} ${e.responseBody || e.url || ""}`.trim()
        : error instanceof Error
          ? error.message
          : "Unknown parsing error"
    return { ok: false, error: `Parsing failed: ${detail}` }
  }
}

type CreateResult = { ok: true; id: string } | { ok: false; error: string }

export async function createSolutionAction(
  input: CreateSolutionInput,
  status: SolutionStatus = "published"
): Promise<CreateResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { ok: false, error: "You must be signed in to publish." }
  }

  const parsed = createSolutionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fill in the title, question, and answer.",
    }
  }
  const value = parsed.data

  try {
    // Dedup: re-submitting the same transcript returns the existing solution
    // instead of creating a copy. Backed by a unique index on
    // (user_id, md5(raw_transcript)) for races this check misses.
    const existing = await db
      .select({
        id: schema.solutions.id,
        status: schema.solutions.status,
      })
      .from(schema.solutions)
      .where(
        and(
          eq(schema.solutions.userId, session.user.id),
          eq(schema.solutions.rawTranscript, value.rawTranscript)
        )
      )
      .limit(1)
    if (existing[0]) {
      // A draft they're now publishing should actually go live.
      if (status === "published" && existing[0].status === "draft") {
        await db
          .update(schema.solutions)
          .set({ status: "published", updatedAt: new Date() })
          .where(eq(schema.solutions.id, existing[0].id))
        revalidateSolutionViews(existing[0].id)
        await bumpSearchVersion()
      }
      return { ok: true, id: existing[0].id }
    }

    const [solution] = await db
      .insert(schema.solutions)
      .values({
        userId: session.user.id,
        questionTitle: value.questionTitle,
        questionBody: value.questionBody,
        answerBody: value.answerBody,
        sourceModel: value.sourceModel,
        rawTranscript: value.rawTranscript,
        status,
      })
      .returning({ id: schema.solutions.id })

    if (!solution) {
      return { ok: false, error: "Failed to save the solution." }
    }

    await linkTags(solution.id, value.tags)
    await insertSnippets(solution.id, value.codeSnippets)

    revalidateSolutionViews()
    // A newly published solution must show up in search immediately.
    if (status === "published") await bumpSearchVersion()
    return { ok: true, id: solution.id }
  } catch (error) {
    console.error("[createSolution] insert failed:", error)
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "You already have a solution from this transcript.",
      }
    }
    const message = error instanceof Error ? error.message : "Unknown error"
    return { ok: false, error: `Save failed: ${message}` }
  }
}

type UpdateResult = { ok: true; id: string } | { ok: false; error: string }

export async function updateSolutionAction(
  input: UpdateSolutionInput,
  status: SolutionStatus
): Promise<UpdateResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { ok: false, error: "You must be signed in to edit a solution." }
  }

  const parsed = updateSolutionSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fill in the title, question, and answer.",
    }
  }
  const value = parsed.data

  try {
    // Ownership is enforced in the WHERE clause. The search vector is a
    // generated column, so it recomputes automatically from the new content.
    const [updated] = await db
      .update(schema.solutions)
      .set({
        questionTitle: value.questionTitle,
        questionBody: value.questionBody,
        answerBody: value.answerBody,
        sourceModel: value.sourceModel,
        status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.solutions.id, value.solutionId),
          eq(schema.solutions.userId, session.user.id)
        )
      )
      .returning({ id: schema.solutions.id })

    if (!updated) {
      return { ok: false, error: "Solution not found." }
    }

    // Replace tags and code snippets wholesale — simplest correct approach for
    // an edit. FK cascade isn't involved here since we delete the links/rows
    // directly. (neon-http: separate round-trips, no transaction.)
    await db
      .delete(schema.solutionTags)
      .where(eq(schema.solutionTags.solutionId, value.solutionId))
    await db
      .delete(schema.codeSnippets)
      .where(eq(schema.codeSnippets.solutionId, value.solutionId))

    await linkTags(value.solutionId, value.tags)
    await insertSnippets(value.solutionId, value.codeSnippets)

    revalidateSolutionViews(value.solutionId)
    // Edits change content/visibility, so search results may now differ.
    await bumpSearchVersion()
    return { ok: true, id: value.solutionId }
  } catch (error) {
    console.error("[updateSolution] update failed:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return { ok: false, error: `Save failed: ${message}` }
  }
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  )
}

function buildPrompt(transcript: string): string {
  return `You are extracting a reusable, searchable Q&A from a raw AI chat transcript where a developer solved a technical problem. Respond with a single JSON object matching the schema.

Extract:
- question_title: a concise, searchable title for the problem (like a Stack Overflow question title)
- question_body: the developer's original question/problem, in clear prose
- answer_body: the working solution explanation in prose. Do NOT inline large code blocks here — put code in code_snippets.
- source_model: which AI produced the answer, inferred from the transcript ("claude", "chatgpt", "gemini", "grok", "mistral", "perplexity", "deepseek", or "other")
- tags: 2-6 short lowercase technology/framework/language tags (e.g. "react", "typescript", "cors")
- code_snippets: each distinct code block from the answer, with its language (or null) and exact content
- confidence: "high" | "medium" | "low" — how clearly the transcript contains a single, solved problem

Transcript:
"""
${transcript}
"""`
}
