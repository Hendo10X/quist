"use server"

import { db, schema } from "@workspace/db"
import { request } from "@arcjet/next"
import { generateObject } from "ai"
import { and, eq, inArray } from "drizzle-orm"
import { headers } from "next/headers"

import { parserModel } from "@/lib/ai"
import { ajParse } from "@/lib/arcjet"
import { auth } from "@/lib/auth"
import {
  createSolutionSchema,
  normalizeTags,
  parsedSolutionSchema,
  type CreateSolutionInput,
  type ParsedSolution,
} from "@/lib/solution-schema"

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
  input: CreateSolutionInput
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
    // Dedup: republishing the same transcript returns the existing solution
    // instead of creating a copy. Backed by a unique index on
    // (user_id, md5(raw_transcript)) for races this check misses.
    const existing = await db
      .select({ id: schema.solutions.id })
      .from(schema.solutions)
      .where(
        and(
          eq(schema.solutions.userId, session.user.id),
          eq(schema.solutions.rawTranscript, value.rawTranscript)
        )
      )
      .limit(1)
    if (existing[0]) {
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
      })
      .returning({ id: schema.solutions.id })

    if (!solution) {
      return { ok: false, error: "Failed to save the solution." }
    }

    // neon-http has no interactive transactions, so these run as separate
    // round-trips. Acceptable for the MVP.
    const tagNames = normalizeTags(value.tags)
    if (tagNames.length > 0) {
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
          .values(
            tagRows.map((tag) => ({ solutionId: solution.id, tagId: tag.id }))
          )
      }
    }

    if (value.codeSnippets.length > 0) {
      await db.insert(schema.codeSnippets).values(
        value.codeSnippets.map((snippet, index) => ({
          solutionId: solution.id,
          language: snippet.language,
          content: snippet.content,
          position: index,
        }))
      )
    }

    return { ok: true, id: solution.id }
  } catch (error) {
    console.error("[createSolution] insert failed:", error)
    if (isUniqueViolation(error)) {
      return {
        ok: false,
        error: "You've already published a solution from this transcript.",
      }
    }
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
