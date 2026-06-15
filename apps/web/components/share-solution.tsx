"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

import {
  parseTranscriptAction,
  createSolutionAction,
} from "@/app/(app)/share/actions"
import { FormError, MotionReveal, SuccessCheck } from "@/components/motion"
import {
  SolutionFields,
  type SolutionDraft,
} from "@/components/solution-fields"
import { Spokes } from "@/components/spokes"
import type { ParsedSolution } from "@/lib/solution-schema"

export function ShareSolution({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void
} = {}) {
  const router = useRouter()
  const [phase, setPhase] = React.useState<"paste" | "review">("paste")
  const [transcript, setTranscript] = React.useState("")
  const [draft, setDraft] = React.useState<SolutionDraft | null>(null)
  const [confidence, setConfidence] = React.useState<
    ParsedSolution["confidence"] | null
  >(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  // Which review action is in-flight, so only that button shows a spinner.
  const [submitting, setSubmitting] = React.useState<
    "publish" | "draft" | null
  >(null)
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
      })
      setConfidence(d.confidence)
      setPhase("review")
    } catch {
      setError("Something went wrong while parsing. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  async function submit(status: "published" | "draft") {
    if (!draft) return
    setError(null)
    setSubmitting(status === "published" ? "publish" : "draft")
    setIsPending(true)
    try {
      const result = await createSolutionAction(
        {
          questionTitle: draft.questionTitle,
          questionBody: draft.questionBody,
          answerBody: draft.answerBody,
          sourceModel: draft.sourceModel,
          rawTranscript: transcript,
          tags: draft.tags,
          codeSnippets: draft.codeSnippets,
        },
        status
      )

      if (!result.ok) {
        setError(result.error)
        return
      }

      if (status === "published") {
        toast.success("Successfully published")
        setPublishedId(result.id)
      } else {
        // Drafts live on the dashboard — send the user there to find it.
        toast.success("Saved to draft")
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      setError(
        status === "published"
          ? "Something went wrong while publishing. Please try again."
          : "Something went wrong while saving your draft. Please try again."
      )
    } finally {
      setIsPending(false)
      setSubmitting(null)
    }
  }

  function resetForm() {
    setPublishedId(null)
    setDraft(null)
    setConfidence(null)
    setTranscript("")
    setError(null)
    setPhase("paste")
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
      {confidence === "low" ? (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs/relaxed text-muted-foreground">
          Low confidence — the transcript may not contain a single clear
          solution. Review and edit carefully before publishing.
        </p>
      ) : null}

      <SolutionFields value={draft} onChange={setDraft} />

      {error ? <FormError message={error} /> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          onClick={() => submit("published")}
          disabled={isPending}
        >
          {submitting === "publish" ? (
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
          variant="outline"
          onClick={() => submit("draft")}
          disabled={isPending}
        >
          {submitting === "draft" ? (
            <>
              <Spokes className="size-3.5" />
              Saving…
            </>
          ) : (
            "Save as draft"
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
            will be lost if you re-parse. To keep them, save as a draft first.
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
