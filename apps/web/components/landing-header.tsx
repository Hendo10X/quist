import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { MobileNav } from "@/components/mobile-nav"
import type { NavLink } from "@/lib/nav-links"

const LANDING_LINKS: NavLink[] = [
  { href: "/browse", label: "Browse" },
  { href: "#models", label: "Models" },
  { href: "#preview", label: "Preview" },
]

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
        <nav className="hidden items-center gap-0.5 sm:flex">
          {LANDING_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
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

      <MobileNav links={LANDING_LINKS} />
    </header>
  )
}
