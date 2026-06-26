"use client"

import * as React from "react"
import Link from "next/link"
import { Bookmark02Icon, BookmarkCheck02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { toggleBookmarkAction } from "@/app/solutions/actions"

// Private bookmark toggle. Signed-out users are nudged to sign in; everyone else
// gets an optimistic save/un-save.
export function SaveButton({
  solutionId,
  initialSaved,
  signedIn,
}: {
  solutionId: string
  initialSaved: boolean
  signedIn: boolean
}) {
  const [saved, setSaved] = React.useState(initialSaved)
  const [isPending, setIsPending] = React.useState(false)

  if (!signedIn) {
    return (
      <Link
        href="/sign-in"
        className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
      >
        <HugeiconsIcon icon={Bookmark02Icon} strokeWidth={2} />
        Save
      </Link>
    )
  }

  async function toggle() {
    if (isPending) return
    const next = !saved
    setSaved(next)
    setIsPending(true)
    try {
      const result = await toggleBookmarkAction(solutionId)
      if (!result.ok) {
        setSaved(!next)
        toast.error(result.error)
        return
      }
      setSaved(result.saved)
      toast.success(result.saved ? "Saved" : "Removed from saved")
    } catch {
      setSaved(!next)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "outline"}
      size="sm"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={saved}
    >
      <HugeiconsIcon
        icon={saved ? BookmarkCheck02Icon : Bookmark02Icon}
        strokeWidth={2}
      />
      {saved ? "Saved" : "Save"}
    </Button>
  )
}
