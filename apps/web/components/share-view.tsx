"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowTurnBackwardIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
} from "@workspace/ui/components/dialog"

import { ShareSolution } from "@/components/share-solution"

// Wraps the share flow so the top back arrow can guard unsaved work. Leaving the
// page discards everything, so if there's a draft in progress we confirm first.
// (The inline "Back" button in the review step has its own, separate guard.)
export function ShareView() {
  const router = useRouter()
  const [dirty, setDirty] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  function handleBack() {
    if (dirty) {
      setConfirmOpen(true)
      return
    }
    router.back()
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Go back"
        onClick={handleBack}
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowTurnBackwardIcon} strokeWidth={2} />
      </Button>

      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Share a solution
        </h1>
        <p className="text-xs/relaxed text-muted-foreground">
          Paste a raw AI chat where you solved a problem. We&apos;ll extract a
          clean, searchable Q&amp;A for you to review.
        </p>
      </div>

      <ShareSolution onDirtyChange={setDirty} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogPopup className="max-w-sm p-5">
          <DialogTitle className="text-sm font-semibold">
            Leave without publishing?
          </DialogTitle>
          <DialogDescription className="mt-1.5 text-xs/relaxed text-muted-foreground">
            You haven&apos;t published this solution yet. If you leave now, your
            draft will be lost.
          </DialogDescription>
          <div className="mt-5 flex items-center justify-end gap-2">
            <DialogClose render={<Button variant="ghost" size="lg" />}>
              Keep editing
            </DialogClose>
            <Button
              size="lg"
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false)
                router.back()
              }}
            >
              Leave
            </Button>
          </div>
        </DialogPopup>
      </Dialog>
    </>
  )
}
