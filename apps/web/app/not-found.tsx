import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export default function NotFound() {
  return (
    <div className="dot-grid flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="flex flex-col items-center gap-5">
        <Link
          href="/"
          className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
        >
          Quist
        </Link>
        <h1 className="font-display text-7xl leading-none tracking-tight sm:text-8xl">
          404
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-balance text-muted-foreground">
          This page wandered off. The solution you&apos;re after might just be a
          search away.
        </p>
        <div className="mt-1 flex items-center gap-3">
          <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
            Back home
          </Link>
          <Link
            href="/browse"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
          >
            Browse solutions
          </Link>
        </div>
      </div>
    </div>
  )
}
