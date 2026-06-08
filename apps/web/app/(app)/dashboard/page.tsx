import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome, {session?.user.name}.
      </h1>
      <p className="text-sm text-muted-foreground">
        This is your Quist dashboard. Search and uploads are coming next.
      </p>
    </div>
  )
}
