"use client"

import * as React from "react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@workspace/ui/lib/utils"

const FAQS = [
  {
    q: "What is Quist?",
    a: "A searchable knowledge base of real AI conversations that solved developer problems. Paste a chat that worked, and the next developer can find it instead of asking again.",
  },
  {
    q: "How is it different from Stack Overflow?",
    a: "Every answer on Quist is a real AI solution someone actually used to fix a problem — no outdated threads, no unanswered questions, and you can see which model solved it.",
  },
  {
    q: "Do I need an account to search?",
    a: "No. Searching and browsing are open to everyone. You only need an account to share your own solutions.",
  },
  {
    q: "Which AI models are supported?",
    a: "Claude, ChatGPT, Gemini, and more. Paste any chat — Quist extracts the question, the answer, and any code automatically.",
  },
  {
    q: "Is it free?",
    a: "Yes. Quist is free to search and free to share solutions.",
  },
]

export function Faq() {
  const [open, setOpen] = React.useState<number | null>(0)

  return (
    <div className="divide-y divide-border border-y border-border">
      {FAQS.map((item, index) => {
        const isOpen = open === index
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors outline-none hover:text-foreground focus-visible:text-foreground"
            >
              {item.q}
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                strokeWidth={2}
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
