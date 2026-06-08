import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { GithubButton } from "@/components/github-button"
import { SignInForm } from "@/components/sign-in-form"

export default function SignInPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your Quist account.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <GithubButton />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <SignInForm />
      </CardContent>
    </Card>
  )
}
