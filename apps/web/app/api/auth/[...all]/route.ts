import { type NextRequest } from "next/server"
import { toNextJsHandler } from "better-auth/next-js"

import { aj, ajSignin, ajSignup } from "@/lib/arcjet"
import { auth } from "@/lib/auth"

const handlers = toNextJsHandler(auth)

export const GET = handlers.GET

export async function POST(req: NextRequest) {
  const { pathname } = new URL(req.url)

  // A request body is a single-use stream, but both Arcjet (Shield inspects the
  // body) and Better Auth need to read it. Buffer it once, then build a fresh
  // Request from the buffered bytes for each consumer — otherwise the second
  // reader sees an already-used body ("TypeError: unusable").
  const rawBody = await req.text()
  const freshRequest = () =>
    new Request(req.url, {
      method: req.method,
      headers: req.headers,
      body: rawBody,
    })

  let decision
  if (pathname.endsWith("/sign-up/email")) {
    let email = ""
    try {
      email = (JSON.parse(rawBody) as { email?: string }).email ?? ""
    } catch {
      // Malformed body — leave email empty; Arcjet treats it as invalid.
    }
    decision = await ajSignup.protect(freshRequest(), { email })
  } else if (pathname.endsWith("/sign-in/email")) {
    decision = await ajSignin.protect(freshRequest())
  } else {
    decision = await aj.protect(freshRequest())
  }

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return Response.json(
        { message: "Too many attempts. Please try again in a few minutes." },
        { status: 429 }
      )
    }
    if (decision.reason.isEmail()) {
      return Response.json(
        { message: "Please use a valid, non-disposable email address." },
        { status: 400 }
      )
    }
    return Response.json({ message: "Request blocked." }, { status: 403 })
  }

  return handlers.POST(freshRequest())
}
