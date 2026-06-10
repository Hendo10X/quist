"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Delete02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"

import { deleteSolutionAction } from "@/app/(app)/dashboard/actions"
import { Spokes } from "@/components/spokes"

export function DeleteSolutionButton({
  solutionId,
  solutionTitle,
  className,
}: {
  solutionId: string
  solutionTitle: string
  className?: string
}) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleDelete() {
    setError(null)
    setIsPending(true)
    const result = await deleteSolutionAction(solutionId)
    if (result.ok) {
      setOpen(false)
      router.refresh()
    } else {
      setError(result.error)
    }
    setIsPending(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setError(null)
      }}
    >
      <DialogTrigger
        aria-label="Delete solution"
        className={cn(
          // Revealed on row hover / keyboard focus; always visible on
          // touch devices, where there is no hover.
          // self-start + mt-2.5 + p-1.5 centers the icon on the badge's
          // line (link py-3 + badge mt-0.5) instead of the whole row.
          "mt-2.5 flex shrink-0 items-center self-start rounded-md p-1.5 text-muted-foreground",
          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100",
          "transition-[opacity,color,transform] duration-200 ease-out hover:text-destructive active:scale-[0.96] motion-reduce:transition-none",
          className
        )}
      >
        <HugeiconsIcon icon={Delete02Icon} className="size-4" strokeWidth={2} />
      </DialogTrigger>

      <DialogPopup className="max-w-sm p-6">
        <div className="flex flex-col gap-2">
          <DialogTitle className="text-base font-semibold tracking-tight">
            Delete this solution?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            &ldquo;{solutionTitle}&rdquo; and its tags and code snippets will be
            permanently removed. This can&apos;t be undone.
          </DialogDescription>
        </div>

        {error ? (
          <p className="mt-3 text-xs/relaxed text-destructive">{error}</p>
        ) : null}

        <div className="mt-6 flex justify-end gap-2">
          <DialogClose className={cn(buttonVariants({ variant: "outline" }))}>
            Cancel
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Spokes className="size-3.5" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  )
}
