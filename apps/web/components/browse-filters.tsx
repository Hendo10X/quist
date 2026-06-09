"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

import { SOURCE_MODELS, type SourceModel } from "@/lib/solution-schema"

const MODEL_LABELS: Record<SourceModel, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  other: "Other",
}

export function BrowseFilters({
  tags,
  activeTag,
  activeModel,
  activeSort,
}: {
  tags: string[]
  activeTag?: string
  activeModel?: SourceModel
  activeSort: "newest" | "oldest"
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = React.useTransition()

  function update(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    // Changing a filter returns to the first page.
    params.delete("page")
    const queryString = params.toString()
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={activeModel ?? "all"}
        onValueChange={(value) =>
          update("model", value === "all" ? undefined : String(value))
        }
      >
        <SelectTrigger className="min-w-32" aria-label="Filter by model">
          <SelectValue>
            {(value) =>
              value === "all"
                ? "All models"
                : MODEL_LABELS[value as SourceModel]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All models</SelectItem>
          {SOURCE_MODELS.map((model) => (
            <SelectItem key={model} value={model}>
              {MODEL_LABELS[model]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={activeTag ?? "all"}
        onValueChange={(value) =>
          update("tag", value === "all" ? undefined : String(value))
        }
      >
        <SelectTrigger className="min-w-32" aria-label="Filter by tag">
          <SelectValue>
            {(value) => (value === "all" ? "All tags" : String(value))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag} value={tag}>
              {tag}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={activeSort}
        onValueChange={(value) =>
          update("sort", value === "newest" ? undefined : "oldest")
        }
      >
        <SelectTrigger className="min-w-32" aria-label="Sort order">
          <SelectValue>
            {(value) => (value === "newest" ? "Newest first" : "Oldest first")}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
