import Link from "next/link"

import { Badge } from "@workspace/ui/components/badge"

import { SystemStatus } from "@/components/system-status"

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 text-xs text-muted-foreground">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link
            href="/"
            className="font-mono tracking-widest text-foreground uppercase"
          >
            Quist
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link
              href="/browse"
              className="transition-colors hover:text-foreground"
            >
              Browse
            </Link>
            <Link
              href="/sign-in"
              className="transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="transition-colors hover:text-foreground"
            >
              Get started
            </Link>
            {/* Not yet available — decorative, does nothing. */}
            <span className="flex cursor-default items-center gap-1.5 select-none">
              Chrome extension
              <Badge className="border-transparent bg-emerald-500/15 px-1 py-0 text-[0.5rem] tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                Soon
              </Badge>
            </span>
          </nav>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <SystemStatus />
          <span>© 2026 Quist</span>
        </div>
      </div>
    </footer>
  )
}
