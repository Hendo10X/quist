"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { PasswordInput } from "@workspace/ui/components/password-input"

import { FormError } from "@/components/motion"
import { Spokes } from "@/components/spokes"
import { signUp } from "@/lib/auth-client"
import { getFieldErrors, signUpSchema } from "@/lib/validations"

export function SignUpForm() {
  const router = useRouter()
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [isPending, setIsPending] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})
    setFormError(null)

    const formData = new FormData(event.currentTarget)
    const parsed = signUpSchema.safeParse({
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    })

    if (!parsed.success) {
      setErrors(getFieldErrors(parsed.error))
      return
    }

    setIsPending(true)
    const { error } = await signUp.email(parsed.data)

    if (error) {
      setFormError(error.message ?? "Something went wrong. Please try again.")
      setIsPending(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Ada Lovelace"
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name ? (
          <p className="text-xs/relaxed text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email ? (
          <p className="text-xs/relaxed text-destructive">{errors.email}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password ? (
          <p className="text-xs/relaxed text-destructive">{errors.password}</p>
        ) : null}
      </div>

      {formError ? <FormError message={formError} /> : null}

      <Button type="submit" size="lg" disabled={isPending} className="mt-1">
        {isPending ? (
          <>
            <Spokes className="size-3.5" />
            Creating account…
          </>
        ) : (
          "Create account"
        )}
      </Button>

      <p className="text-center text-xs/relaxed text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
