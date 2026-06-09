"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowDown01Icon,
  DashboardSquare01Icon,
  Logout01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"

import { UserAvatar } from "@/components/user-avatar"
import { signOut } from "@/lib/auth-client"

export function UserMenu({
  name,
  email,
  image,
  seed,
}: {
  name: string
  email: string
  image: string | null
  seed: string
}) {
  const router = useRouter()
  const [signingOut, setSigningOut] = React.useState(false)

  async function handleSignOut() {
    if (signingOut) return
    setSigningOut(true)
    await signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group flex items-center gap-2 rounded-full py-0.5 pr-1.5 pl-0.5 text-xs text-foreground transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/30 data-[popup-open]:bg-muted/60">
        <UserAvatar name={name} seed={seed} image={image} />
        <span className="max-w-32 truncate">{name}</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className="size-3.5 text-muted-foreground transition-transform duration-150 group-data-[popup-open]:rotate-180"
          strokeWidth={2}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-medium">{name}</span>
          <span className="truncate text-[0.6875rem] text-muted-foreground">
            {email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuLinkItem render={<Link href="/profile" />}>
          <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
          Profile
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem render={<Link href="/dashboard" />}>
          <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
          My solutions
        </DropdownMenuLinkItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          closeOnClick={false}
          disabled={signingOut}
          onClick={handleSignOut}
        >
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          {signingOut ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
