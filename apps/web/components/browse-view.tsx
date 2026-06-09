"use client"

import * as React from "react"
import Link from "next/link"
import { GridIcon, ListViewIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@workspace/ui/components/button"

import { ModelBadge } from "@/components/model-badge"
import { MotionItem, MotionStack } from "@/components/motion"
import type { SourceModel } from "@/lib/solution-schema"

export type BrowseItem = {
  id: string
  title: string
  preview: string
  model: SourceModel
  author: string
  date: string
  tags: string[]
}

const VIEWS = [
  { key: "list", label: "List view", icon: ListViewIcon },
  { key: "grid", label: "Grid view", icon: GridIcon },
] as const

type View = (typeof VIEWS)[number]["key"]
const STORAGE_KEY = "quist:browse-view"

function isView(value: string | null): value is View {
  return value === "list" || value === "grid"
}

// Persisted view preference exposed as an external store, so the component
// reads it via useSyncExternalStore (SSR-safe, no setState-in-effect).
const listeners = new Set<() => void>()

function subscribe(callback: () => void) {
  listeners.add(callback)
  window.addEventListener("storage", callback)
  return () => {
    listeners.delete(callback)
    window.removeEventListener("storage", callback)
  }
}

function getStoredView(): View {
  const saved = window.localStorage.getItem(STORAGE_KEY)
  return isView(saved) ? saved : "list"
}

function setStoredView(next: View) {
  window.localStorage.setItem(STORAGE_KEY, next)
  listeners.forEach((listener) => listener())
}

export function BrowseView({
  items,
  emptyMessage = "No solutions yet. Be the first to share one.",
}: {
  items: BrowseItem[]
  emptyMessage?: string
}) {
  const view = React.useSyncExternalStore(
    subscribe,
    getStoredView,
    () => "list" as View
  )

  function choose(next: View) {
    setStoredView(next)
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border px-6 py-16 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-0.5 self-end rounded-md border border-border p-0.5">
        {VIEWS.map((option) => (
          <Button
            key={option.key}
            type="button"
            size="icon-sm"
            variant={view === option.key ? "secondary" : "ghost"}
            aria-label={option.label}
            aria-pressed={view === option.key}
            onClick={() => choose(option.key)}
          >
            <HugeiconsIcon icon={option.icon} strokeWidth={2} />
          </Button>
        ))}
      </div>

      {view === "grid" ? (
        <GridView items={items} />
      ) : (
        <ListView items={items} />
      )}
    </div>
  )
}

function CardBody({ item }: { item: BrowseItem }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium">{item.title}</span>
        <ModelBadge model={item.model} className="mt-0.5" />
      </div>
      <p className="line-clamp-2 text-xs/relaxed text-muted-foreground">
        {item.preview}
      </p>
      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <span>{item.author}</span>
        <span aria-hidden>·</span>
        <span className="tabular-nums">{item.date}</span>
        {item.tags.length > 0 ? <span>· {item.tags.join(", ")}</span> : null}
      </div>
    </>
  )
}

function ListView({ items }: { items: BrowseItem[] }) {
  return (
    <MotionStack className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border">
      {items.map((item) => (
        <MotionItem key={item.id}>
          <Link
            href={`/solutions/${item.id}`}
            className="flex flex-col gap-1.5 px-4 py-3.5 transition-colors hover:bg-muted/40"
          >
            <CardBody item={item} />
          </Link>
        </MotionItem>
      ))}
    </MotionStack>
  )
}

function CardLink({ item }: { item: BrowseItem }) {
  return (
    <Link
      href={`/solutions/${item.id}`}
      className="flex h-full flex-col gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/40"
    >
      <CardBody item={item} />
    </Link>
  )
}

function GridView({ items }: { items: BrowseItem[] }) {
  return (
    <MotionStack className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <MotionItem key={item.id}>
          <CardLink item={item} />
        </MotionItem>
      ))}
    </MotionStack>
  )
}
