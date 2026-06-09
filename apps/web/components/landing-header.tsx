import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { MobileNav } from "@/components/mobile-nav"
import { GUEST_LINKS } from "@/lib/nav-links"

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
        <nav className="hidden items-center sm:flex">
          <Link
            href="/browse"
            className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse
          </Link>
        </nav>
      </div>

      <div className="hidden items-center gap-3 sm:flex">
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

      <MobileNav links={GUEST_LINKS} />
    </header>
  )
}
