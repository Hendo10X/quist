"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { and, eq } from "drizzle-orm"

import { db, schema } from "@workspace/db"

import { auth } from "@/lib/auth"

type DeleteResult = { ok: true } | { ok: false; error: string }

export async function deleteSolutionAction(
  solutionId: string
): Promise<DeleteResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { ok: false, error: "You must be signed in to delete a solution." }
  }

  try {
    // Ownership is enforced in the WHERE clause; tags and code snippets are
    // removed by the FK cascade.
    const deleted = await db
      .delete(schema.solutions)
      .where(
        and(
          eq(schema.solutions.id, solutionId),
          eq(schema.solutions.userId, session.user.id)
        )
      )
      .returning({ id: schema.solutions.id })

    if (deleted.length === 0) {
      return { ok: false, error: "Solution not found." }
    }

    revalidatePath("/dashboard")
    revalidatePath("/profile")
    revalidatePath("/browse")
    return { ok: true }
  } catch (error) {
    console.error("[deleteSolution] delete failed:", error)
    return { ok: false, error: "Failed to delete the solution." }
  }
}
