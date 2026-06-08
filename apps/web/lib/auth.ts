import { db, schema } from "@workspace/db"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"

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
  // nextCookies must be the last plugin so it can set cookies on responses.
  plugins: [nextCookies()],
})

export type Session = typeof auth.$Infer.Session
