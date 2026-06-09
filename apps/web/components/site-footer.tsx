import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-xs text-muted-foreground sm:flex-row">
        <Link
          href="/"
          className="font-mono tracking-widest text-foreground uppercase"
        >
          Quist
        </Link>
        <nav className="flex items-center gap-5">
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
        </nav>
        <span>© 2026 Quist</span>
      </div>
    </footer>
  )
}
