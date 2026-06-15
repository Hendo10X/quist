"use client"

import * as React from "react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"

import { SOURCE_MODELS, type SourceModel } from "@/lib/solution-schema"

// The editable shape of a solution, shared by the share (review) flow and the
// edit flow. Mirrors the columns a user can change — not the transcript.
export type SolutionDraft = {
  questionTitle: string
  questionBody: string
  answerBody: string
  sourceModel: SourceModel
  tags: string[]
  codeSnippets: { language: string | null; content: string }[]
}

const SOURCE_LABELS: Record<SourceModel, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  grok: "Grok",
  mistral: "Mistral",
  perplexity: "Perplexity",
  deepseek: "DeepSeek",
  other: "Other",
}

export function SolutionFields({
  value,
  onChange,
}: {
  value: SolutionDraft
  onChange: (next: SolutionDraft) => void
}) {
  const [tagInput, setTagInput] = React.useState("")

  function update<K extends keyof SolutionDraft>(key: K, next: SolutionDraft[K]) {
    onChange({ ...value, [key]: next })
  }

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag) return
    if (!value.tags.includes(tag)) update("tags", [...value.tags, tag])
    setTagInput("")
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={value.questionTitle}
          onChange={(event) => update("questionTitle", event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          value={value.questionBody}
          onChange={(event) => update("questionBody", event.target.value)}
          className="min-h-24"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="answer">Answer</Label>
        <Textarea
          id="answer"
          value={value.answerBody}
          onChange={(event) => update("answerBody", event.target.value)}
          className="min-h-32"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Source model</Label>
        <div className="flex flex-wrap gap-2">
          {SOURCE_MODELS.map((model) => (
            <Button
              key={model}
              type="button"
              size="sm"
              variant={value.sourceModel === model ? "default" : "outline"}
              onClick={() => update("sourceModel", model)}
            >
              {SOURCE_LABELS[model]}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex flex-wrap items-center gap-1.5">
          {value.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() =>
                  update(
                    "tags",
                    value.tags.filter((current) => current !== tag)
                  )
                }
                className="text-muted-foreground hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          id="tags"
          value={tagInput}
          onChange={(event) => setTagInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault()
              addTag(tagInput)
            }
          }}
          placeholder="Add a tag and press Enter"
        />
      </div>

      {value.codeSnippets.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Label>Code snippets</Label>
          <div className="flex flex-col gap-3">
            {value.codeSnippets.map((snippet, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-md border border-border"
              >
                <div className="flex items-center justify-between border-b border-border bg-muted/50 px-2.5 py-1">
                  <span className="font-mono text-[0.625rem] text-muted-foreground">
                    {snippet.language ?? "code"}
                  </span>
                  <button
                    type="button"
                    aria-label="Remove snippet"
                    onClick={() =>
                      update(
                        "codeSnippets",
                        value.codeSnippets.filter((_, i) => i !== index)
                      )
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      className="size-3"
                      strokeWidth={2}
                    />
                  </button>
                </div>
                <pre className="overflow-x-auto px-2.5 py-2 font-mono text-[0.7rem] leading-relaxed">
                  <code>{snippet.content}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}
