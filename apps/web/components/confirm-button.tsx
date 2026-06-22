"use client"

import * as React from "react"
import Link from "next/link"
import { CheckmarkBadge02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { Button, buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { toggleConfirmationAction } from "@/app/solutions/actions"

function countLabel(count: number) {
  return `${count} ${count === 1 ? "confirmation" : "confirmations"}`
}

// "Worked for me" control on a solution. Signed-out users get a sign-in nudge;
// the author sees a read-only tally (you can't confirm your own); everyone else
// gets an optimistic toggle.
export function ConfirmButton({
  solutionId,
  initialConfirmed,
  initialCount,
  canConfirm,
  signedIn,
}: {
  solutionId: string
  initialConfirmed: boolean
  initialCount: number
  canConfirm: boolean
  signedIn: boolean
}) {
  const [confirmed, setConfirmed] = React.useState(initialConfirmed)
  const [count, setCount] = React.useState(initialCount)
  const [isPending, setIsPending] = React.useState(false)

  if (!signedIn) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
        >
          <HugeiconsIcon icon={CheckmarkBadge02Icon} strokeWidth={2} />
          Sign in to confirm
        </Link>
        <span className="text-xs text-muted-foreground tabular-nums">
          {countLabel(count)}
        </span>
      </div>
    )
  }

  if (!canConfirm) {
    return (
      <div className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
        <HugeiconsIcon
          icon={CheckmarkBadge02Icon}
          className="size-4"
          strokeWidth={2}
        />
        {count > 0
          ? `${countLabel(count)} — others confirmed this worked`
          : "No confirmations yet"}
      </div>
    )
  }

  async function toggle() {
    if (isPending) return
    const next = !confirmed
    // Optimistic update, reconciled with the server's authoritative count.
    setConfirmed(next)
    setCount((current) => Math.max(0, current + (next ? 1 : -1)))
    setIsPending(true)
    try {
      const result = await toggleConfirmationAction(solutionId)
      if (!result.ok) {
        setConfirmed(!next)
        setCount((current) => Math.max(0, current + (next ? -1 : 1)))
        toast.error(result.error)
        return
      }
      setConfirmed(result.confirmed)
      setCount(result.count)
    } catch {
      setConfirmed(!next)
      setCount((current) => Math.max(0, current + (next ? -1 : 1)))
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        type="button"
        size="lg"
        variant={confirmed ? "default" : "outline"}
        onClick={toggle}
        disabled={isPending}
        aria-pressed={confirmed}
      >
        <HugeiconsIcon icon={CheckmarkBadge02Icon} strokeWidth={2} />
        {confirmed ? "You confirmed this" : "This worked for me"}
      </Button>
      <span className="text-xs text-muted-foreground tabular-nums">
        {countLabel(count)}
      </span>
    </div>
  )
}
