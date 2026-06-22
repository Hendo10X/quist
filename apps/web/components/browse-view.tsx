"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CarouselHorizontalIcon,
  CheckmarkBadge02Icon,
  GridIcon,
  ListViewIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { StampStack } from "stampstack"
import "stampstack/styles.css"

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
  confirmations: number
}

// "Worked for me" tally shown in a card's meta line (hidden at zero).
function ConfirmMeta({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span
      className="inline-flex items-center gap-1 tabular-nums text-foreground/70"
      title={`${count} confirmed this worked`}
    >
      <span aria-hidden>·</span>
      <HugeiconsIcon
        icon={CheckmarkBadge02Icon}
        className="size-3"
        strokeWidth={2}
      />
      {count}
    </span>
  )
}

const VIEWS = [
  { key: "list", label: "List view", icon: ListViewIcon },
  { key: "grid", label: "Grid view", icon: GridIcon },
  { key: "stack", label: "Carousel view", icon: CarouselHorizontalIcon },
] as const

type View = (typeof VIEWS)[number]["key"]
const STORAGE_KEY = "quist:browse-view"

function isView(value: string | null): value is View {
  return value === "list" || value === "grid" || value === "stack"
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

      {view === "stack" ? (
        <StackView items={items} />
      ) : view === "grid" ? (
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
        <ConfirmMeta count={item.confirmations} />
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

// Per-model stamp frame colors, mirroring each model's --model-fg accent (light
// values). The card surface and text follow the app's theme tokens so the
// carousel flips with light/dark automatically.
const MODEL_FRAME: Record<SourceModel, string> = {
  claude: "#9f5000",
  chatgpt: "#036f4f",
  gemini: "#3a65b8",
  grok: "#814a8d",
  mistral: "#a74541",
  perplexity: "#007273",
  deepseek: "#6453a7",
  other: "#7c7c7c",
}

const STAMP_THEME = {
  "--stampstack-card-bg": "var(--card)",
  "--stampstack-text": "var(--card-foreground)",
  "--stampstack-radius": "0.75rem",
} as React.CSSProperties

function StackView({ items }: { items: BrowseItem[] }) {
  const router = useRouter()

  return (
    // Clip the coverflow's sideways fan so it never pushes the page wider.
    <div className="overflow-hidden">
      <StampStack
        items={items}
        cardWidth={260}
        className="stampstack-flat"
        style={STAMP_THEME}
        onSelect={(item) => router.push(`/solutions/${item.id}`)}
        frameColor={(item) => MODEL_FRAME[item.model]}
        renderStamp={(item, state) => (
          <div
            className="flex h-full flex-col gap-2 p-4 transition-opacity duration-200"
            style={{ opacity: state.focused ? 1 : 0.6 }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="line-clamp-3 text-sm font-medium">
                {item.title}
              </span>
              <ModelBadge model={item.model} className="mt-0.5 shrink-0" />
            </div>
            <p className="line-clamp-4 text-xs/relaxed text-muted-foreground">
              {item.preview}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.625rem] text-muted-foreground">
              <span className="truncate">{item.author}</span>
              <span aria-hidden>·</span>
              <span className="tabular-nums">{item.date}</span>
              <ConfirmMeta count={item.confirmations} />
              {item.tags.length > 0 ? (
                <span className="w-full truncate">{item.tags.join(", ")}</span>
              ) : null}
            </div>
          </div>
        )}
      />
    </div>
  )
}
