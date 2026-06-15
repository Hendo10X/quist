"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { updateSolutionAction } from "@/app/(app)/share/actions"
import { FormError, MotionReveal } from "@/components/motion"
import {
  SolutionFields,
  type SolutionDraft,
} from "@/components/solution-fields"
import { Spokes } from "@/components/spokes"
import type { SolutionStatus } from "@/lib/solution-schema"

export function EditSolution({
  solutionId,
  initialStatus,
  initial,
}: {
  solutionId: string
  initialStatus: SolutionStatus
  initial: SolutionDraft
}) {
  const router = useRouter()
  const [draft, setDraft] = React.useState<SolutionDraft>(initial)
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState<
    "publish" | "draft" | null
  >(null)
  const isPending = submitting !== null

  async function submit(status: SolutionStatus) {
    setError(null)
    setSubmitting(status === "published" ? "publish" : "draft")
    try {
      const result = await updateSolutionAction(
        { solutionId, ...draft },
        status
      )
      if (!result.ok) {
        setError(result.error)
        return
      }
      toast.success(
        status === "published" ? "Successfully published" : "Saved to draft"
      )
      // Published edits land on the public page; drafts live on the dashboard.
      router.push(
        status === "published" ? `/solutions/${solutionId}` : "/dashboard"
      )
      router.refresh()
    } catch {
      setError("Something went wrong while saving. Please try again.")
    } finally {
      setSubmitting(null)
    }
  }

  return (
    <MotionReveal className="flex flex-col gap-5">
      {initialStatus === "published" ? (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-xs/relaxed text-muted-foreground">
          This solution is live. Saving it as a draft unpublishes it until you
          publish again.
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
          ) : initialStatus === "published" ? (
            "Publish changes"
          ) : (
            "Publish"
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
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </MotionReveal>
  )
}
