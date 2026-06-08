import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { SignOutButton } from "@/components/sign-out-button"
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect("/sign-in")
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Quist
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">
        Welcome, {session.user.name}.
      </h1>
      <SignOutButton />
    </main>
  )
}
