"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { CommandIcon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  Dialog,
  DialogPopup,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Kbd } from "@workspace/ui/components/kbd"

import { ModelBadge } from "@/components/model-badge"
import { Spokes } from "@/components/spokes"
import type { SearchResult } from "@/lib/search"

export function SearchCommand() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [resultsFor, setResultsFor] = React.useState("")

  // ⌘K / Ctrl+K toggles the palette.
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  // Debounced search against the Hono endpoint. All state updates happen inside
  // the async callbacks (never synchronously in the effect body).
  React.useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) return

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((data: { results?: SearchResult[] }) => {
          setResults(data.results ?? [])
          setResultsFor(trimmed)
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setResults([])
            setResultsFor(trimmed)
          }
        })
    }, 200)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  function goTo(id: string) {
    setOpen(false)
    setQuery("")
    router.push(`/solutions/${id}`)
  }

  const trimmed = query.trim()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
      >
        <HugeiconsIcon
          icon={Search01Icon}
          className="size-3.5"
          strokeWidth={2}
        />
        <span className="hidden sm:inline">Search solutions</span>
        <Kbd className="hidden sm:inline-flex">
          <HugeiconsIcon
            icon={CommandIcon}
            className="size-2.5"
            strokeWidth={2}
          />
          K
        </Kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPopup className="top-[12%] p-0">
          <DialogTitle className="sr-only">Search solutions</DialogTitle>

          <div className="flex items-center gap-2 border-b border-border px-3">
            <HugeiconsIcon
              icon={Search01Icon}
              className="size-4 text-muted-foreground"
              strokeWidth={2}
            />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && results[0]) {
                  goTo(results[0].id)
                }
              }}
              placeholder="Search confirmed AI solutions…"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-80 overflow-y-auto p-1">
            {!trimmed ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                Type to search by question, answer, or framework.
              </p>
            ) : resultsFor !== trimmed ? (
              <div className="flex items-center justify-center gap-2 px-3 py-6 text-xs text-muted-foreground">
                <Spokes className="size-3.5" />
                Searching…
              </div>
            ) : results.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                No results for &ldquo;{trimmed}&rdquo;.
              </p>
            ) : (
              results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => goTo(result.id)}
                  className="flex w-full flex-col gap-1 rounded-md px-3 py-2 text-left transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium">{result.title}</span>
                    <ModelBadge model={result.sourceModel} className="mt-0.5" />
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {result.preview}
                  </p>
                </button>
              ))
            )}
          </div>
        </DialogPopup>
      </Dialog>
    </>
  )
}
