import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

// Marketing nav for the landing page only — always shows the sign-in CTAs,
// never the signed-in app nav.
export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/85 px-6 backdrop-blur">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
        >
          Quist
        </Link>
        <nav className="flex items-center">
          <Link
            href="/browse"
            className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/sign-in"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Sign in
        </Link>
        <Link href="/sign-up" className={cn(buttonVariants({ size: "sm" }))}>
          Get started
        </Link>
      </div>
    </header>
  )
}
