"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@workspace/ui/lib/utils"

const AUTHED_LINKS = [
  { href: "/dashboard", label: "My solutions" },
  { href: "/browse", label: "Browse" },
  { href: "/share", label: "Share" },
]

const GUEST_LINKS = [{ href: "/browse", label: "Browse" }]

export function MainNav({ authed = true }: { authed?: boolean }) {
  const pathname = usePathname()
  const links = authed ? AUTHED_LINKS : GUEST_LINKS

  return (
    <nav className="flex items-center gap-0.5">
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
