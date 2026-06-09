import { cn } from "@workspace/ui/lib/utils"

type Status = "operational" | "issues" | "down"

const STATUS: Record<Status, { label: string; dot: string; text: string }> = {
  operational: {
    label: "All systems operational",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  issues: {
    label: "Some systems experiencing issues",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  down: {
    label: "System down",
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
  },
}

// Static for now — swap `status` (or wire it to a real health check) to flip
// between operational / issues / down.
export function SystemStatus({ status = "operational" }: { status?: Status }) {
  const config = STATUS[status]

  return (
    <span className="flex items-center gap-2">
      <span className="relative flex size-2">
        {status === "operational" ? (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75 motion-reduce:hidden",
              config.dot
            )}
          />
        ) : null}
        <span
          className={cn("relative inline-flex size-2 rounded-full", config.dot)}
        />
      </span>
      <span className={config.text}>{config.label}</span>
    </span>
  )
}
