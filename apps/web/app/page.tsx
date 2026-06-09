/* eslint-disable @next/next/no-img-element -- static brand SVGs in /public; no Image optimization needed */
import Link from "next/link"
import {
  BookOpen01Icon,
  CloudUploadIcon,
  FileSearchIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { CaptureDemo } from "@/components/capture-demo"
import { LandingHeader } from "@/components/landing-header"
import { SearchDemo } from "@/components/search-demo"
import { SiteFooter } from "@/components/site-footer"

const LOGOS = [
  { src: "/images/Claude.svg", alt: "Claude", invert: false },
  { src: "/images/ChatGpt.svg", alt: "ChatGPT", invert: true },
  { src: "/images/Grok.svg", alt: "Grok", invert: true },
  { src: "/images/Mistral.svg", alt: "Mistral", invert: false },
  { src: "/images/Perplexity.svg", alt: "Perplexity", invert: false },
]

const STEPS = [
  {
    icon: FileSearchIcon,
    title: "Search your problem",
    body: "Type your error or question. Quist searches real conversations from developers who already solved it.",
  },
  {
    icon: BookOpen01Icon,
    title: "Read the actual fix",
    body: "See the exact AI answer that worked, code included. Know which model solved it and when.",
  },
  {
    icon: CloudUploadIcon,
    title: "Share yours",
    body: "Paste your AI chat. Quist extracts the question and answer automatically. Your solution helps the next developer.",
  },
]

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <LandingHeader />

      <main className="flex flex-1 flex-col">
        {/* Hero — the only section with the dot-grid background */}
        <section className="dot-grid flex flex-col items-center justify-center px-6 pt-20 pb-8 text-center sm:pt-28">
          <div className="flex max-w-2xl flex-col items-center gap-6">
            <span className="rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase backdrop-blur">
              Confirmed AI solutions
            </span>
            <h1 className="font-display text-5xl tracking-tight text-balance sm:text-6xl">
              The search engine for AI-solved problems.
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-balance text-muted-foreground">
              Developers solve a bug with Claude, ChatGPT, or Gemini and the
              knowledge disappears. Quist keeps it searchable, structured, and
              confirmed to actually work.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Get started
              </Link>
              <Link
                href="/browse"
                className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}
              >
                Browse solutions
              </Link>
            </div>
          </div>
        </section>

        {/* Product preview — a non-interactive, auto-playing search demo */}
        <section id="preview" className="scroll-mt-20 px-6 pt-2 pb-20 sm:pb-28">
          <div className="mx-auto max-w-3xl">
            <SearchDemo />
          </div>
        </section>

        {/* Models */}
        <section id="models" className="scroll-mt-20 px-6 py-10">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 sm:flex-row sm:justify-between sm:gap-12">
            <p className="max-w-xs text-center text-sm leading-relaxed text-balance text-muted-foreground sm:text-left">
              500+ solutions solved with Claude, GPT, Gemini, Mistral, Grok,
              Perplexity and more — shared by indie devs worldwide.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-5">
              {LOGOS.map((logo) => (
                <img
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  className={cn(
                    "h-6 w-auto opacity-85 transition-opacity hover:opacity-100",
                    logo.invert && "dark:invert"
                  )}
                />
              ))}
            </div>
          </div>
        </section>

        {/* The problem Quist solves */}
        <section className="px-6 py-20 sm:py-28">
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-16">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
                You are not the first person to hit this error.
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Every day, developers ask the same questions. They get an AI
                answer, use it, and move on — and the solution disappears. The
                next developer spends an hour asking for the same thing.
              </p>
              <p className="text-sm font-medium text-foreground">
                Quist fixes that.
              </p>
            </div>

            <CaptureDemo />
          </div>
        </section>

        {/* How it works */}
        <section className="px-6 py-20 sm:py-28">
          <h2 className="font-display text-center text-4xl tracking-tight text-balance sm:text-5xl">
            Simple by design
          </h2>
          <div className="mx-auto mt-16 grid max-w-4xl gap-12 text-center sm:grid-cols-3 sm:gap-8">
            {STEPS.map((step) => (
              <div
                key={step.title}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex size-11 items-center justify-center rounded-xl border border-border bg-card text-foreground">
                  <HugeiconsIcon
                    icon={step.icon}
                    className="size-5"
                    strokeWidth={1.8}
                  />
                </div>
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="max-w-[16rem] text-xs leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Upload CTA */}
        <section className="px-6 pb-24 sm:pb-32">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 rounded-2xl border border-border bg-card px-8 py-14 text-center">
            <h2 className="font-display text-3xl tracking-tight text-balance sm:text-4xl">
              You&apos;ve solved something today.
            </h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Took 30 minutes to figure out that config issue? Two minutes to
              share it. Someone will find it in 30 seconds.
            </p>
            <Link
              href="/share"
              className={cn(buttonVariants({ size: "lg" }), "mt-1")}
            >
              Share your solution
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
