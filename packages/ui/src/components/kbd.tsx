import type * as React from "react"

import { cn } from "@workspace/ui/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center gap-0.5 rounded border border-border bg-muted px-1 font-mono text-[0.625rem] font-medium text-muted-foreground select-none",
        className
      )}
      {...props}
    />
  )
}

export { Kbd }
