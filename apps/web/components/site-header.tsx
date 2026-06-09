import { headers } from "next/headers"
import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { SearchCommand } from "@/components/search-command"
import { SignOutButton } from "@/components/sign-out-button"
import { auth } from "@/lib/auth"
import { AUTHED_LINKS, GUEST_LINKS } from "@/lib/nav-links"

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

/** Shared app navbar. Session-aware: logo → dashboard + user menu when signed
 *  in, → home + auth buttons when not. Used on every page that has a header. */
export async function SiteHeader() {
  const session = await auth.api.getSession({ headers: await headers() })
  const isAuthed = Boolean(session)

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/85 px-6 backdrop-blur">
      <div className="flex items-center gap-6">
        <Link
          href={isAuthed ? "/dashboard" : "/"}
          className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
        >
          Quist
        </Link>
        <MainNav authed={isAuthed} />
      </div>

      <div className="flex items-center gap-3">
        <SearchCommand />

        <div className="hidden items-center gap-3 sm:flex">
          {session ? (
            <>
              <Avatar>
                {session.user.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name}
                  />
                ) : null}
                <AvatarFallback>{initialsOf(session.user.name)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-foreground">
                {session.user.name}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Get started
              </Link>
            </>
          )}
        </div>

        <MobileNav
          links={isAuthed ? AUTHED_LINKS : GUEST_LINKS}
          user={
            session
              ? { name: session.user.name, image: session.user.image ?? null }
              : undefined
          }
        />
      </div>
    </header>
  )
}
