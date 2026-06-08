import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Already signed in? Skip the auth pages.
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="text-center font-mono text-xs tracking-widest text-muted-foreground uppercase"
        >
          Quist
        </Link>
        {children}
      </div>
    </main>
  )
}
