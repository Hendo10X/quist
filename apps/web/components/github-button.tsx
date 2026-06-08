"use client"

import * as React from "react"
import { GithubIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@workspace/ui/components/button"

import { signIn } from "@/lib/auth-client"

export function GithubButton() {
  const [isPending, setIsPending] = React.useState(false)

  async function onClick() {
    setIsPending(true)
    // Redirects the browser to GitHub on success; only returns here on error.
    const { error } = await signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    })
    if (error) {
      setIsPending(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      onClick={onClick}
      disabled={isPending}
      className="w-full"
    >
      <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
      Continue with GitHub
    </Button>
  )
}
