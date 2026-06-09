"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"

import { Spokes } from "@/components/spokes"
import { signOut } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)

  async function handleSignOut() {
    setIsPending(true)
    await signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleSignOut} disabled={isPending}>
      {isPending ? (
        <>
          <Spokes className="size-3.5" />
          Signing out…
        </>
      ) : (
        "Sign out"
      )}
    </Button>
  )
}
