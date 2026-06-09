"use client"

import * as React from "react"
import { Tag01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@workspace/ui/lib/utils"

import { MotionList, MotionListItem } from "@/components/motion"

type Topic = { tag: string; count: number; results: string[] }

const TOPICS: Topic[] = [
  {
    tag: "next.js",
    count: 42,
    results: ["Fix a hydration mismatch", "Cache a server action response"],
  },
  {
    tag: "cors",
    count: 18,
    results: [
      "Enable CORS for a specific origin",
      "Handle a preflight OPTIONS 404",
    ],
  },
  {
    tag: "postgres",
    count: 27,
    results: [
      "Weight full-text search with setweight",
      "Speed up @@ queries with a GIN index",
    ],
  },
  {
    tag: "typescript",
    count: 53,
    results: ["Fix 'cannot find module' errors", "Narrow a union with a guard"],
  },
]

// A few extra static chips so the cloud feels full.
const EXTRA_TAGS = ["react", "docker", "rust", "tailwind", "redis", "python"]

export function ExploreDemo() {
  const [active, setActive] = React.useState(0)

  React.useEffect(() => {
    const timer = setTimeout(
      () => setActive((prev) => (prev + 1) % TOPICS.length),
      2600
    )
    return () => clearTimeout(timer)
  }, [active])

  const topic = TOPICS[active]!

  return (
    <div
      aria-hidden
      className="pointer-events-none overflow-hidden rounded-xl border border-border bg-card shadow-2xl ring-1 shadow-black/[0.06] ring-black/[0.03] select-none dark:ring-white/[0.04]"
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <span className="ml-2 font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
          Browse by tag
        </span>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap gap-1.5">
          {TOPICS.map((item, index) => (
            <span
              key={item.tag}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors",
                index === active
                  ? "border-transparent bg-foreground text-background"
                  : "border-border text-muted-foreground"
              )}
            >
              <HugeiconsIcon
                icon={Tag01Icon}
                className="size-2.5"
                strokeWidth={2}
              />
              {item.tag}
            </span>
          ))}
          {EXTRA_TAGS.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md border border-border px-2 py-1 text-xs text-muted-foreground/70"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 min-h-[6.5rem] border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground tabular-nums">{topic.count}</span>{" "}
            solutions tagged{" "}
            <span className="font-medium text-foreground">{topic.tag}</span>
          </p>
          <MotionList key={topic.tag} className="mt-2 flex flex-col gap-1">
            {topic.results.map((result) => (
              <MotionListItem key={result}>
                <div className="rounded-md px-2 py-1.5 text-sm font-medium hover:bg-muted/40">
                  {result}
                </div>
              </MotionListItem>
            ))}
          </MotionList>
        </div>
      </div>
    </div>
  )
}
