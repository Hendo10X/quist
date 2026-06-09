"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@workspace/ui/lib/utils"

import { AUTHED_LINKS, GUEST_LINKS } from "@/lib/nav-links"

// Hidden below `sm` — mobile uses the hamburger sheet (MobileNav) instead.
export function MainNav({ authed = true }: { authed?: boolean }) {
  const pathname = usePathname()
  const links = authed ? AUTHED_LINKS : GUEST_LINKS

  return (
    <nav className="hidden items-center gap-0.5 sm:flex">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "rounded-md px-2 py-1 text-xs transition-colors",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
