import { Resend } from "resend"

const apiKey = process.env.RESEND_API_KEY
const from = process.env.EMAIL_FROM ?? "Quist <onboarding@resend.dev>"

const resend = apiKey ? new Resend(apiKey) : null

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
}) {
  if (!resend) {
    // No API key configured yet — log instead so email verification still
    // works during local development (copy the link from the server output).
    console.warn(
      `[email] RESEND_API_KEY not set. Would send "${options.subject}" to ${options.to}:\n${options.html}`
    )
    return
  }

  await resend.emails.send({ from, ...options })
}
