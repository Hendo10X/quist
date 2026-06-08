import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export default function Page() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <div className="flex max-w-xl flex-col items-center gap-6">
        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          Quist
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          The search engine for AI-solved problems.
        </h1>
        <p className="text-sm leading-relaxed text-balance text-muted-foreground">
          Developers solve a bug with Claude, ChatGPT, or Gemini and the
          knowledge disappears. Quist keeps it — searchable, structured, and
          confirmed to actually work.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }))}>
            Get started
          </Link>
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
