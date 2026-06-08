import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

import { SignOutButton } from "@/components/sign-out-button"
import { auth } from "@/lib/auth"

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect("/sign-in")
  }

  const { name, image } = session.user

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <Link
          href="/dashboard"
          className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
        >
          Quist
        </Link>
        <div className="flex items-center gap-3">
          <Avatar>
            {image ? <AvatarImage src={image} alt={name} /> : null}
            <AvatarFallback>{initialsOf(name)}</AvatarFallback>
          </Avatar>
          <span className="hidden text-xs text-foreground sm:inline">
            {name}
          </span>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
