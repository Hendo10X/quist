import { ShareSolution } from "@/components/share-solution"

export default function SharePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">
          Share a solution
        </h1>
        <p className="text-xs/relaxed text-muted-foreground">
          Paste a raw AI chat where you solved a problem. We&apos;ll extract a
          clean, searchable Q&amp;A for you to review.
        </p>
      </div>
      <ShareSolution />
    </div>
  )
}
