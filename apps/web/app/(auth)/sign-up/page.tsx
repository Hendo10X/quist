import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

import { GithubButton } from "@/components/github-button"
import { SignUpForm } from "@/components/sign-up-form"

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Start sharing and finding AI-solved problems.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <GithubButton />
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>
        <SignUpForm />
      </CardContent>
    </Card>
  )
}
