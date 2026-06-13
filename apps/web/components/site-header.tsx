import { headers } from "next/headers"
import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { MainNav } from "@/components/main-nav"
import { MobileNav } from "@/components/mobile-nav"
import { SearchCommand } from "@/components/search-command"
import { UserMenu } from "@/components/user-menu"
import { auth } from "@/lib/auth"
import { AUTHED_LINKS, GUEST_LINKS } from "@/lib/nav-links"

/** Shared app navbar. Session-aware: logo → dashboard + user menu when signed
 *  in, → home + auth buttons when not. Used on every page that has a header. */
export async function SiteHeader() {
  const session = await auth.api.getSession({ headers: await headers() })
  const isAuthed = Boolean(session)

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/85 px-6 backdrop-blur">
      <div className="flex items-center gap-6">
        <Link
          href={isAuthed ? "/browse" : "/"}
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
            <UserMenu
              name={session.user.name}
              email={session.user.email}
              image={session.user.image ?? null}
              seed={session.user.id}
            />
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
              ? {
                  id: session.user.id,
                  name: session.user.name,
                  image: session.user.image ?? null,
                }
              : undefined
          }
        />
      </div>
    </header>
  )
}
