"use client"

import * as React from "react"
import Link from "next/link"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@workspace/ui/components/badge"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

import {
  parseTranscriptAction,
  createSolutionAction,
} from "@/app/(app)/share/actions"
import { FormError, MotionReveal, SuccessCheck } from "@/components/motion"
import { Spokes } from "@/components/spokes"
import {
  SOURCE_MODELS,
  type ParsedSolution,
  type SourceModel,
} from "@/lib/solution-schema"

type Draft = {
  questionTitle: string
  questionBody: string
  answerBody: string
  sourceModel: SourceModel
  tags: string[]
  codeSnippets: { language: string | null; content: string }[]
  confidence: ParsedSolution["confidence"]
}

const SOURCE_LABELS: Record<SourceModel, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  grok: "Grok",
  mistral: "Mistral",
  perplexity: "Perplexity",
  deepseek: "DeepSeek",
  other: "Other",
}

export function ShareSolution({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void
} = {}) {
  const [phase, setPhase] = React.useState<"paste" | "review">("paste")
  const [transcript, setTranscript] = React.useState("")
  const [draft, setDraft] = React.useState<Draft | null>(null)
  const [tagInput, setTagInput] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [publishedId, setPublishedId] = React.useState<string | null>(null)
  const [confirmBackOpen, setConfirmBackOpen] = React.useState(false)

  // Unsaved work the user could lose by leaving the page entirely (the top back
  // arrow): a typed transcript or a parsed draft. Once published, nothing's lost.
  const dirty =
    !publishedId && (phase === "review" || transcript.trim().length > 0)
  React.useEffect(() => {
    onDirtyChange?.(dirty)
  }, [dirty, onDirtyChange])

  async function handleParse() {
    setError(null)
    setIsPending(true)
    try {
      const result = await parseTranscriptAction(transcript)
      if (!result.ok) {
        setError(result.error)
        return
      }

      const d = result.data
      setDraft({
        questionTitle: d.question_title,
        questionBody: d.question_body,
        answerBody: d.answer_body,
        sourceModel: d.source_model,
        tags: d.tags,
        codeSnippets: d.code_snippets,
        confidence: d.confidence,
      })
      setPhase("review")
    } catch {
      setError("Something went wrong while parsing. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  async function handlePublish() {
    if (!draft) return
    setError(null)
    setIsPending(true)
    try {
      const result = await createSolutionAction({
        questionTitle: draft.questionTitle,
        questionBody: draft.questionBody,
        answerBody: draft.answerBody,
        sourceModel: draft.sourceModel,
        rawTranscript: transcript,
        tags: draft.tags,
        codeSnippets: draft.codeSnippets,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      setPublishedId(result.id)
    } catch {
      setError("Something went wrong while publishing. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  function resetForm() {
    setPublishedId(null)
    setDraft(null)
    setTranscript("")
    setTagInput("")
    setError(null)
    setPhase("paste")
  }

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag || !draft) return
    if (!draft.tags.includes(tag)) update("tags", [...draft.tags, tag])
    setTagInput("")
  }

  // ---- Published: confirmation ----
  if (publishedId) {
    return (
      <MotionReveal className="flex flex-col items-center gap-4 rounded-lg border border-border px-6 py-12 text-center">
        <SuccessCheck />
        <p className="text-sm font-semibold">Solution published</p>
        <p className="max-w-sm text-xs/relaxed text-muted-foreground">
          Your solution is live and searchable. It now shows up on your
          dashboard.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href={`/solutions/${publishedId}`}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            View solution
          </Link>
          <Button size="lg" variant="ghost" onClick={resetForm}>
            Share another
          </Button>
        </div>
      </MotionReveal>
    )
  }

  // ---- Phase 1: paste ----
  if (phase === "paste" || !draft) {
    return (
      <MotionReveal className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="transcript">Chat transcript</Label>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="Paste your full AI chat here — the question you asked and the answer that worked…"
            className="min-h-64 font-mono"
          />
        </div>

        {error ? <FormError message={error} /> : null}

        <Button
          size="lg"
          onClick={handleParse}
          disabled={isPending || transcript.trim().length < 40}
          className="self-start"
        >
          {isPending ? (
            <>
              <Spokes className="size-3.5" />
              Parsing…
            </>
          ) : (
            "Parse with AI"
          )}
        </Button>
      </MotionReveal>
    )
  }

  // ---- Phase 2: review ----
  return (
    <MotionReveal className="flex flex-col gap-5">
      {draft.confidence === "low" ? (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs/relaxed text-muted-foreground">
          Low confidence — the transcript may not contain a single clear
          solution. Review and edit carefully before publishing.
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={draft.questionTitle}
          onChange={(event) => update("questionTitle", event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          value={draft.questionBody}
          onChange={(event) => update("questionBody", event.target.value)}
          className="min-h-24"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="answer">Answer</Label>
        <Textarea
          id="answer"
          value={draft.answerBody}
          onChange={(event) => update("answerBody", event.target.value)}
          className="min-h-32"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Source model</Label>
        <div className="flex flex-wrap gap-2">
          {SOURCE_MODELS.map((model) => (
            <Button
              key={model}
              type="button"
              size="sm"
              variant={draft.sourceModel === model ? "default" : "outline"}
              onClick={() => update("sourceModel", model)}
            >
              {SOURCE_LABELS[model]}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          {draft.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() =>
                  update(
                    "tags",
                    draft.tags.filter((current) => current !== tag)
                  )
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          id="tags"
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault()
              addTag(tagInput)
            }
          }}
          placeholder="Add a tag and press Enter"
        />
      </div>

      {draft.codeSnippets.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Label>Code snippets</Label>
          <div className="flex flex-col gap-3">
            {draft.codeSnippets.map((snippet, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-md border border-border"
              >
                <div className="flex items-center justify-between border-b border-border bg-muted/50 px-2.5 py-1">
                  <span className="font-mono text-[0.625rem] text-muted-foreground">
                    {snippet.language ?? "code"}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove snippet"
                    onClick={() =>
                      update(
                        "codeSnippets",
                        draft.codeSnippets.filter((_, i) => i !== index)
                      )
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      className="size-3"
                      strokeWidth={2}
                    />
                  </button>
                </div>
                <pre className="overflow-x-auto px-2.5 py-2 font-mono text-[0.7rem] leading-relaxed">
                  <code>{snippet.content}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <FormError message={error} /> : null}

      <div className="flex items-center gap-3">
        <Button size="lg" onClick={handlePublish} disabled={isPending}>
          {isPending ? (
            <>
              <Spokes className="size-3.5" />
              Publishing…
            </>
          ) : (
            "Publish solution"
          )}
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={() => setConfirmBackOpen(true)}
          disabled={isPending}
        >
          Back
        </Button>
      </div>

      <Dialog open={confirmBackOpen} onOpenChange={setConfirmBackOpen}>
        <DialogPopup className="max-w-sm p-5">
          <DialogTitle className="text-sm font-semibold">
            Go back to the transcript?
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-xs/relaxed text-muted-foreground">
            You&apos;ll return to the paste step. Edits you made to this draft
            will be lost if you re-parse.
          </DialogDescription>
          <div className="mt-5 flex items-center justify-end gap-2">
            <DialogClose render={<Button variant="ghost" size="lg" />}>
              Keep editing
            </DialogClose>
            <Button
              size="lg"
              variant="destructive"
              onClick={() => {
                setConfirmBackOpen(false)
                setPhase("paste")
                setError(null)
              }}
            >
              Go back
            </Button>
          </div>
        </DialogPopup>
      </Dialog>
    </MotionReveal>
  )
}
