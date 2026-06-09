"use client"

import { useRouter } from "next/navigation"
import { ArrowTurnBackwardIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export function BackButton({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Go back"
      onClick={() => router.back()}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      <HugeiconsIcon icon={ArrowTurnBackwardIcon} strokeWidth={2} />
    </Button>
  )
}
