"use client"

import Link from "next/link"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Popover } from "@base-ui/react/popover"

const TAG_GROUPS = [
  {
    label: "Languages",
    tags: ["typescript", "javascript", "python", "go", "rust", "sql"],
  },
  {
    label: "Frameworks",
    tags: ["next.js", "react", "express", "django", "svelte", "vue"],
  },
  {
    label: "Tools",
    tags: ["docker", "postgres", "redis", "git", "vite", "tailwind"],
  },
  {
    label: "Errors",
    tags: ["cors", "hydration", "type-error", "401", "memory-leak", "build"],
  },
]

export function TagsMenu() {
  return (
    <Popover.Root>
      <Popover.Trigger className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors outline-none hover:text-foreground data-[popup-open]:text-foreground">
        Tags
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="size-3"
          strokeWidth={2}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start" sideOffset={10}>
          <Popover.Popup className="z-50 w-[min(42rem,calc(100vw-2rem))] origin-[var(--transform-origin)] rounded-xl border border-border bg-popover p-5 text-popover-foreground shadow-lg transition-[transform,opacity] duration-150 outline-none data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0">
            <p className="mb-4 text-xs text-muted-foreground">
              Browse the knowledge base by topic — no search query needed.
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {TAG_GROUPS.map((group) => (
                <div key={group.label} className="flex flex-col gap-2.5">
                  <span className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
                    {group.label}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {group.tags.map((tag) => (
                      <Popover.Close
                        key={tag}
                        nativeButton={false}
                        render={<Link href={`/browse?tag=${tag}`} />}
                        className="text-left text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {tag}
                      </Popover.Close>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}
