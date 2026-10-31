import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import type { SourceModel } from "@/lib/solution-schema"

const MODEL: Record<SourceModel, { label: string; className: string }> = {
  claude: { label: "Claude", className: "model-badge model-claude" },
  chatgpt: { label: "ChatGPT", className: "model-badge model-chatgpt" },
  gemini: { label: "Gemini", className: "model-badge model-gemini" },
  grok: { label: "Grok", className: "model-badge model-grok" },
  mistral: { label: "Mistral", className: "model-badge model-mistral" },
  perplexity: {
    label: "Perplexity",
    className: "model-badge model-perplexity",
  },
  deepseek: { label: "DeepSeek", className: "model-badge model-deepseek" },
  other: { label: "Other", className: "model-badge model-other" },
}

export function ModelBadge({
  model,
  className,
}: {
  model: SourceModel
  className?: string
}) {
  const config = MODEL[model]
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
