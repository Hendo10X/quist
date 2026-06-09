"use client"

import * as React from "react"
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

export function CodeBlock({
  html,
  code,
  language,
}: {
  html: string
  code: string
  language: string | null
}) {
  const [copied, setCopied] = React.useState(false)

  function copy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-muted/50 px-3 py-1">
        <span className="font-mono text-[0.625rem] text-muted-foreground">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon
            icon={copied ? Tick01Icon : Copy01Icon}
            className="size-3"
            strokeWidth={2}
          />
        </button>
      </div>
      <div
        className="overflow-x-auto text-xs [&_pre]:m-0 [&_pre]:px-3 [&_pre]:py-2.5 [&_pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
