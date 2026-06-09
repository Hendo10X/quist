"use client"

import * as React from "react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { cn } from "@workspace/ui/lib/utils"

import { ModelBadge } from "@/components/model-badge"
import { MotionList, MotionListItem } from "@/components/motion"
import { Spokes } from "@/components/spokes"
import type { SourceModel } from "@/lib/solution-schema"

type DemoResult = { title: string; model: SourceModel; preview: string }

const QUERIES: { query: string; results: DemoResult[] }[] = [
  {
    query: "CORS error in Express",
    results: [
      {
        title: "Enable CORS for a specific origin in Express",
        model: "claude",
        preview:
          "Use the cors middleware with an explicit origin instead of a wildcard…",
      },
      {
        title: "Preflight OPTIONS request returns 404",
        model: "chatgpt",
        preview:
          "Handle the preflight with app.options('*', cors()) before your routes…",
      },
    ],
  },
  {
    query: "Next.js hydration mismatch",
    results: [
      {
        title: "Server HTML didn't match the client",
        model: "claude",
        preview:
          "A Date or Math.random() rendered on the server differs on the client…",
      },
      {
        title: "Fix locale-formatted dates with suppressHydrationWarning",
        model: "gemini",
        preview:
          "Format the date in a useEffect, or pass a stable ISO string from the server…",
      },
    ],
  },
  {
    query: "Debounce a search input in React",
    results: [
      {
        title: "Debounce an input with a custom hook",
        model: "claude",
        preview:
          "useDebouncedValue with setTimeout and a cleanup inside useEffect…",
      },
      {
        title: "Cancel in-flight fetches while typing",
        model: "chatgpt",
        preview:
          "Use an AbortController in the effect cleanup to drop stale requests…",
      },
    ],
  },
  {
    query: "Postgres full-text search ranking",
    results: [
      {
        title: "Weight the title above the body with setweight",
        model: "claude",
        preview:
          "setweight(to_tsvector(title), 'A') then ts_rank to order results…",
      },
      {
        title: "Add a GIN index on the tsvector column",
        model: "gemini",
        preview:
          "CREATE INDEX … USING gin(search_vector) makes @@ queries fast…",
      },
    ],
  },
  {
    query: "Silently refresh an expired JWT",
    results: [
      {
        title: "Refresh the access token before it expires",
        model: "chatgpt",
        preview:
          "Intercept 401s and retry once after hitting the refresh endpoint…",
      },
      {
        title: "Keep refresh tokens in httpOnly cookies",
        model: "claude",
        preview:
          "Store the refresh token out of JS-accessible storage to limit XSS…",
      },
    ],
  },
]

export function SearchDemo() {
  const [index, setIndex] = React.useState(0)
  const [typed, setTyped] = React.useState("")
  const [searching, setSearching] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)

  // Typewriter → searching → results → hold → next query. All state changes
  // happen inside timeout callbacks (never synchronously in the effect body).
  React.useEffect(() => {
    const full = QUERIES[index]!.query
    let char = 0
    let timer: ReturnType<typeof setTimeout>

    function tick() {
      setTyped(full.slice(0, char))
      if (char === 0) {
        setSearching(false)
        setShowResults(false)
      }
      if (char < full.length) {
        char += 1
        timer = setTimeout(tick, 48)
      } else {
        setSearching(true)
        timer = setTimeout(() => {
          setSearching(false)
          setShowResults(true)
          timer = setTimeout(
            () => setIndex((prev) => (prev + 1) % QUERIES.length),
            3000
          )
        }, 650)
      }
    }

    timer = setTimeout(tick, 400)
    return () => clearTimeout(timer)
  }, [index])

  const results = QUERIES[index]!.results

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
          Quist search
        </span>
      </div>

      {/* Search input */}
      <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
        <HugeiconsIcon
          icon={Search01Icon}
          className="size-4 shrink-0 text-muted-foreground"
          strokeWidth={2}
        />
        <div className="flex min-h-5 items-center text-sm">
          {typed ? (
            <>
              <span>{typed}</span>
              <span className="animate-caret ml-px inline-block h-4 w-px bg-foreground" />
            </>
          ) : (
            <span className="text-muted-foreground">
              Search confirmed AI solutions…
            </span>
          )}
        </div>
      </div>

      {/* Results body */}
      <div className="min-h-[15rem] p-2.5">
        {searching ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-muted-foreground">
            <Spokes className="size-3.5" />
            Searching…
          </div>
        ) : showResults ? (
          <MotionList key={index} className="flex flex-col">
            {results.map((result, position) => (
              <MotionListItem key={result.title}>
                <div
                  className={cn(
                    "flex flex-col gap-1 rounded-md px-3 py-3",
                    position === 0 && "bg-muted/50"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium">{result.title}</span>
                    <ModelBadge model={result.model} className="mt-0.5" />
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {result.preview}
                  </p>
                </div>
              </MotionListItem>
            ))}
          </MotionList>
        ) : (
          <div className="py-16 text-center text-xs text-muted-foreground">
            Type to search by question, answer, or framework.
          </div>
        )}
      </div>
    </div>
  )
}
