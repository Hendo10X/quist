"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"

import { Badge } from "@workspace/ui/components/badge"

import { ModelBadge } from "@/components/model-badge"
import { Spokes } from "@/components/spokes"

type Phase = "raw" | "parsing" | "solution"

const LABEL: Record<Phase, string> = {
  raw: "Pasted transcript",
  parsing: "Structuring",
  solution: "Confirmed solution",
}

const TRANSITION = { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const }

export function CaptureDemo() {
  const [phase, setPhase] = React.useState<Phase>("raw")

  // Loop raw → parsing → solution. State changes happen in timeout callbacks.
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    if (phase === "raw") timer = setTimeout(() => setPhase("parsing"), 2800)
    else if (phase === "parsing")
      timer = setTimeout(() => setPhase("solution"), 1100)
    else timer = setTimeout(() => setPhase("raw"), 3600)
    return () => clearTimeout(timer)
  }, [phase])

  return (
    <div
      aria-hidden
      className="pointer-events-none overflow-hidden rounded-xl border border-border bg-card shadow-2xl ring-1 shadow-black/[0.06] ring-black/[0.03] select-none dark:ring-white/[0.04]"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <span className="ml-2 font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
          {LABEL[phase]}
        </span>
      </div>

      <div className="min-h-[15.5rem] p-4">
        <AnimatePresence mode="wait" initial={false}>
          {phase === "raw" ? (
            <motion.div
              key="raw"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
              transition={TRANSITION}
              className="flex flex-col gap-3"
            >
              <div>
                <span className="font-mono text-[0.625rem] tracking-wide text-muted-foreground uppercase">
                  You
                </span>
                <p className="mt-1 text-xs leading-relaxed text-foreground">
                  Why do I get a CORS error calling my Express API from the
                  browser?
                </p>
              </div>
              <div>
                <span className="font-mono text-[0.625rem] tracking-wide text-muted-foreground uppercase">
                  Claude
                </span>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Add the cors middleware and set an explicit origin instead of
                  a wildcard, then handle the preflight…
                </p>
                <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-muted/40 px-2.5 py-2 font-mono text-[0.7rem] text-foreground/90">
                  <code>{`app.use(cors({ origin: "https://app.example.com" }))`}</code>
                </pre>
              </div>
            </motion.div>
          ) : phase === "parsing" ? (
            <motion.div
              key="parsing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={TRANSITION}
              className="flex min-h-[13.5rem] flex-col items-center justify-center gap-3 text-xs text-muted-foreground"
            >
              <Spokes className="size-5" />
              Structuring with AI…
            </motion.div>
          ) : (
            <motion.div
              key="solution"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8 }}
              transition={TRANSITION}
              className="flex flex-col gap-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-semibold text-balance">
                  Enable CORS for a specific origin in Express
                </h4>
                <ModelBadge model="claude" className="mt-0.5" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">express</Badge>
                <Badge variant="outline">cors</Badge>
                <Badge variant="outline">node</Badge>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Pass an explicit origin to the cors middleware and answer
                preflight requests before your routes run.
              </p>
              <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 px-2.5 py-2 font-mono text-[0.7rem] text-foreground/90">
                <code>{`app.use(cors({ origin: "https://app.example.com" }))
app.options("*", cors())`}</code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
