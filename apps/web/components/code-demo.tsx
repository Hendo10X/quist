"use client"

import * as React from "react"
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "motion/react"

import { ModelBadge } from "@/components/model-badge"
import type { SourceModel } from "@/lib/solution-schema"

type Snippet = { language: string; model: SourceModel; code: string }

const SNIPPETS: Snippet[] = [
  {
    language: "ts",
    model: "claude",
    code: `useEffect(() => {
  const id = setTimeout(() => setQuery(value), 250)
  return () => clearTimeout(id)
}, [value])`,
  },
  {
    language: "sql",
    model: "gemini",
    code: `setweight(to_tsvector('english', title), 'A') ||
setweight(to_tsvector('english', body), 'B')`,
  },
  {
    language: "tsx",
    model: "chatgpt",
    code: `app.use(cors({ origin: "https://app.example.com" }))
app.options("*", cors())`,
  },
]

export function CodeDemo() {
  const [index, setIndex] = React.useState(0)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    // Show snippet → "copy" (checkmark) → next snippet.
    const copyTimer = setTimeout(() => setCopied(true), 1500)
    const resetTimer = setTimeout(() => setCopied(false), 2700)
    const nextTimer = setTimeout(
      () => setIndex((prev) => (prev + 1) % SNIPPETS.length),
      3600
    )
    return () => {
      clearTimeout(copyTimer)
      clearTimeout(resetTimer)
      clearTimeout(nextTimer)
    }
  }, [index])

  const snippet = SNIPPETS[index]!

  return (
    <div
      aria-hidden
      className="pointer-events-none overflow-hidden rounded-xl border border-border bg-card shadow-2xl ring-1 shadow-black/[0.06] ring-black/[0.03] select-none dark:ring-white/[0.04]"
    >
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <span className="font-mono text-[0.625rem] tracking-wide text-muted-foreground">
          {snippet.language}
        </span>
        <div className="flex items-center gap-2">
          <ModelBadge model={snippet.model} />
          <span className="flex size-6 items-center justify-center rounded-md text-muted-foreground">
            <HugeiconsIcon
              icon={copied ? Tick01Icon : Copy01Icon}
              className="size-3.5"
              strokeWidth={2}
            />
          </span>
        </div>
      </div>

      <div className="min-h-[8.5rem] p-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.pre
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-x-auto px-3 py-2.5 font-mono text-xs leading-relaxed text-foreground/90"
          >
            <code>{snippet.code}</code>
          </motion.pre>
        </AnimatePresence>
      </div>
    </div>
  )
}
