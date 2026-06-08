import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { SiteHeader } from "@/components/site-header"
import { auth } from "@/lib/auth"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect("/sign-in")
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
