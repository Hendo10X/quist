"use client"

import * as React from "react"
import { Link01Icon, Tick01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

// Copies the absolute URL for `path` to the clipboard. The origin is read on the
// client so links are correct in any environment.
export function ShareLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`)
      setCopied(true)
      toast.success("Link copied")
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy the link.")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={copy}
      aria-label="Copy link to this solution"
    >
      <HugeiconsIcon
        icon={copied ? Tick01Icon : Link01Icon}
        strokeWidth={2}
      />
      {copied ? "Copied" : "Share"}
    </Button>
  )
}
