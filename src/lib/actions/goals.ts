"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { goals } from "@/db/schema";
import { goalFormSchema } from "@/lib/schemas/goal";

export async function createGoal(formData: FormData) {
  const parsed = goalFormSchema.parse({
    clientId: formData.get("clientId"),
    body: formData.get("body"),
    targetDate: formData.get("targetDate") ?? "",
  });

  await db.insert(goals).values({
    clientId: parsed.clientId,
    body: parsed.body,
    targetDate:
      parsed.targetDate && parsed.targetDate.length > 0
        ? parsed.targetDate
        : null,
  });

  revalidatePath(`/clients/${parsed.clientId}`);
  revalidatePath(`/clients/${parsed.clientId}/goals`);
}

export async function toggleGoalDone(id: string, clientId: string) {
  const row = await db
    .select({ done: goals.done })
    .from(goals)
    .where(eq(goals.id, id))
    .limit(1);
  if (row.length === 0) return;
  const nextDone = !row[0].done;
  await db
    .update(goals)
    .set({ done: nextDone, doneAt: nextDone ? new Date() : null })
    .where(eq(goals.id, id));

  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/goals`);
}

export async function deleteGoal(id: string, clientId: string) {
  await db.delete(goals).where(eq(goals.id, id));
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/goals`);
}
