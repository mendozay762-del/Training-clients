"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bodyStats } from "@/db/schema";
import { bodyStatsFormSchema } from "@/lib/schemas/body-stats";

function nanToNull<T>(v: T): T | null {
  if (typeof v === "number" && Number.isNaN(v)) return null;
  if (v === undefined || v === "") return null;
  return v;
}

export async function upsertBodyStats(formData: FormData) {
  const parsed = bodyStatsFormSchema.parse({
    clientId: formData.get("clientId"),
    weekStart: formData.get("weekStart"),
    weightLbs: formData.get("weightLbs") || undefined,
    sleepHoursAvg: formData.get("sleepHoursAvg") || undefined,
    wellness: formData.get("wellness") || undefined,
    notes: formData.get("notes") ?? "",
  });

  const values = {
    clientId: parsed.clientId,
    weekStart: parsed.weekStart,
    weightLbs:
      nanToNull(parsed.weightLbs) !== null
        ? String(parsed.weightLbs)
        : null,
    sleepHoursAvg:
      nanToNull(parsed.sleepHoursAvg) !== null
        ? String(parsed.sleepHoursAvg)
        : null,
    wellness: nanToNull(parsed.wellness) as number | null,
    notes: parsed.notes && parsed.notes.length > 0 ? parsed.notes : null,
  };

  const existing = await db
    .select({ id: bodyStats.id })
    .from(bodyStats)
    .where(
      and(
        eq(bodyStats.clientId, parsed.clientId),
        eq(bodyStats.weekStart, parsed.weekStart),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(bodyStats)
      .set(values)
      .where(eq(bodyStats.id, existing[0].id));
  } else {
    await db.insert(bodyStats).values(values);
  }

  revalidatePath(`/clients/${parsed.clientId}`);
  revalidatePath(`/clients/${parsed.clientId}/stats`);
}

export async function deleteBodyStats(id: string, clientId: string) {
  await db.delete(bodyStats).where(eq(bodyStats.id, id));
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/stats`);
}
