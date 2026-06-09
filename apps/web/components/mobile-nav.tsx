"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Cancel01Icon, Menu01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { buttonVariants } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"

import { SignOutButton } from "@/components/sign-out-button"
import { UserAvatar } from "@/components/user-avatar"
import type { NavLink } from "@/lib/nav-links"

export function MobileNav({
  links,
  user,
}: {
  links: NavLink[]
  user?: { id: string; name: string; image: string | null }
}) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Open menu"
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground sm:hidden"
      >
        <HugeiconsIcon icon={Menu01Icon} className="size-4" strokeWidth={2} />
      </SheetTrigger>

      <SheetContent>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Quist
          </span>
          <SheetClose
            aria-label="Close menu"
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="size-4"
              strokeWidth={2}
            />
          </SheetClose>
        </div>

        <SheetTitle className="sr-only">Navigation</SheetTitle>

        <nav className="flex flex-col gap-0.5">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-2 py-2 text-sm transition-colors",
                  active
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-border pt-4">
          {user ? (
            <div className="flex flex-col gap-3">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-muted/40"
              >
                <UserAvatar name={user.name} seed={user.id} image={user.image} />
                <div className="flex flex-col">
                  <span className="text-sm text-foreground">{user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    View profile
                  </span>
                </div>
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/sign-in"
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" })
                )}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                onClick={() => setOpen(false)}
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
