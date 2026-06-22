"use server"

import { db, schema } from "@workspace/db"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"

type ConfirmResult =
  | { ok: true; confirmed: boolean; count: number }
  | { ok: false; error: string }

// Toggle the signed-in user's "worked for me" confirmation on a solution. The
// denormalized solutions.confirmation_count is adjusted to match.
export async function toggleConfirmationAction(
  solutionId: string
): Promise<ConfirmResult> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return { ok: false, error: "You must be signed in to confirm a solution." }
  }

  try {
    const [solution] = await db
      .select({
        userId: schema.solutions.userId,
        status: schema.solutions.status,
      })
      .from(schema.solutions)
      .where(eq(schema.solutions.id, solutionId))
      .limit(1)

    if (!solution) {
      return { ok: false, error: "Solution not found." }
    }
    if (solution.status !== "published") {
      return { ok: false, error: "You can only confirm a published solution." }
    }
    if (solution.userId === session.user.id) {
      return { ok: false, error: "You can't confirm your own solution." }
    }

    // Toggle: remove an existing confirmation, otherwise add one. The count is
    // adjusted only by what actually changed (guards against double-clicks).
    const removed = await db
      .delete(schema.solutionConfirmations)
      .where(
        and(
          eq(schema.solutionConfirmations.solutionId, solutionId),
          eq(schema.solutionConfirmations.userId, session.user.id)
        )
      )
      .returning({ solutionId: schema.solutionConfirmations.solutionId })

    let confirmed: boolean
    if (removed.length > 0) {
      await db
        .update(schema.solutions)
        .set({
          confirmationCount: sql`greatest(${schema.solutions.confirmationCount} - 1, 0)`,
        })
        .where(eq(schema.solutions.id, solutionId))
      confirmed = false
    } else {
      const inserted = await db
        .insert(schema.solutionConfirmations)
        .values({ solutionId, userId: session.user.id })
        .onConflictDoNothing()
        .returning({ solutionId: schema.solutionConfirmations.solutionId })
      if (inserted.length > 0) {
        await db
          .update(schema.solutions)
          .set({
            confirmationCount: sql`${schema.solutions.confirmationCount} + 1`,
          })
          .where(eq(schema.solutions.id, solutionId))
      }
      confirmed = true
    }

    const [row] = await db
      .select({ count: schema.solutions.confirmationCount })
      .from(schema.solutions)
      .where(eq(schema.solutions.id, solutionId))

    revalidatePath(`/solutions/${solutionId}`)
    revalidatePath("/browse")
    return { ok: true, confirmed, count: row?.count ?? 0 }
  } catch (error) {
    console.error("[toggleConfirmation] failed:", error)
    return { ok: false, error: "Something went wrong. Please try again." }
  }
}
