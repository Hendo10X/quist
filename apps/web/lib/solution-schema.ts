import { z } from "zod"

export const SOURCE_MODELS = ["claude", "chatgpt", "gemini", "other"] as const
export type SourceModel = (typeof SOURCE_MODELS)[number]

/** Shape the LLM must return when parsing a raw transcript. */
export const parsedSolutionSchema = z.object({
  question_title: z.string(),
  question_body: z.string(),
  answer_body: z.string(),
  source_model: z.enum(SOURCE_MODELS),
  tags: z.array(z.string()),
  code_snippets: z.array(
    z.object({
      language: z.string().nullable(),
      content: z.string(),
    })
  ),
  confidence: z.enum(["high", "medium", "low"]),
})

export type ParsedSolution = z.infer<typeof parsedSolutionSchema>

/** Shape the client submits after reviewing/editing the parsed result. */
export const createSolutionSchema = z.object({
  questionTitle: z.string().min(1, "Title is required").max(200),
  questionBody: z.string().min(1, "Question is required"),
  answerBody: z.string().min(1, "Answer is required"),
  sourceModel: z.enum(SOURCE_MODELS),
  rawTranscript: z.string().min(1),
  tags: z.array(z.string().min(1)).max(10),
  codeSnippets: z.array(
    z.object({
      language: z.string().nullable(),
      content: z.string().min(1),
    })
  ),
})

export type CreateSolutionInput = z.infer<typeof createSolutionSchema>

/** Lowercase, trim, and de-duplicate tag names before saving. */
export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>()
  for (const tag of tags) {
    const clean = tag.trim().toLowerCase()
    if (clean) seen.add(clean)
  }
  return [...seen]
}
