export type NavLink = { href: string; label: string }

export const AUTHED_LINKS: NavLink[] = [
  { href: "/browse", label: "Browse" },
  { href: "/dashboard", label: "My solutions" },
  { href: "/share", label: "Share" },
]

export const GUEST_LINKS: NavLink[] = [{ href: "/browse", label: "Browse" }]
