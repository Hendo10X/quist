import arcjet, { protectSignup, shield, slidingWindow } from "@arcjet/next"

// Shared Arcjet client. Shield (SQLi/XSS/common attacks) is the base rule and
// applies to every request that goes through this client.
export const aj = arcjet({
  key: process.env.ARCJET_KEY!,
  rules: [shield({ mode: "LIVE" })],
})

// Sign-up: bot detection + email validation (rejects disposable / invalid /
// no-MX addresses) + rate limit, in one rule. Keyed by IP.
export const ajSignup = aj.withRule(
  protectSignup({
    email: {
      mode: "LIVE",
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    },
    bots: {
      mode: "LIVE",
      allow: [],
    },
    rateLimit: {
      mode: "LIVE",
      interval: "10m",
      max: 5,
    },
  })
)

// Sign-in: sliding-window rate limit to slow down credential stuffing.
export const ajSignin = aj.withRule(
  slidingWindow({ mode: "LIVE", interval: "10m", max: 10 })
)
