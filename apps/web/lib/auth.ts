import { db, schema } from "@workspace/db"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

// Only register GitHub when credentials exist, so the app keeps working before
// the OAuth app is set up. Set GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET to enable.
const githubId = process.env.GITHUB_CLIENT_ID
const githubSecret = process.env.GITHUB_CLIENT_SECRET
const socialProviders =
  githubId && githubSecret
    ? { github: { clientId: githubId, clientSecret: githubSecret } }
    : undefined

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    // Email verification is disabled until a sending domain is configured.
    // Re-enable with `requireEmailVerification: true` + an `emailVerification`
    // block (see lib/email.ts) once Resend has a verified domain.
  },
  account: {
    accountLinking: {
      enabled: true,
      // GitHub verifies emails itself, so trust it to link to an existing
      // (possibly unverified) local account with the same email. Without this,
      // linking is blocked while local email verification is off
      // ("account_not_linked").
      trustedProviders: ["github"],
    },
  },
  socialProviders,
  // nextCookies must be the last plugin so it can set cookies on responses.
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
