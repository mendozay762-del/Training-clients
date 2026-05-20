"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions } from "@/db/schema";
import {
  createSessionSchema,
  updateSessionSchema,
} from "@/lib/schemas/session";

function strOrNull(s: string | undefined | null): string | null {
  if (s === undefined || s === null) return null;
  const t = s.trim();
  return t.length > 0 ? t : null;
}

export async function createSession(formData: FormData) {
  const parsed = createSessionSchema.parse({
    clientId: formData.get("clientId"),
    startsAt: formData.get("startsAt") ?? "",
    durationMin: formData.get("durationMin") ?? 60,
    location: formData.get("location") ?? "",
    preNotes: formData.get("preNotes") ?? "",
  });

  await db.insert(sessions).values({
    clientId: parsed.clientId,
    startsAt: new Date(parsed.startsAt),
    durationMin: parsed.durationMin,
    location: strOrNull(parsed.location),
    preNotes: strOrNull(parsed.preNotes),
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${parsed.clientId}`);
  revalidatePath(`/clients/${parsed.clientId}/sessions`);
  redirect(`/clients/${parsed.clientId}/sessions`);
}

export async function updateSession(
  sessionId: string,
  clientId: string,
  formData: FormData,
) {
  const parsed = updateSessionSchema.parse({
    startsAt: formData.get("startsAt") ?? "",
    durationMin: formData.get("durationMin") ?? 60,
    location: formData.get("location") ?? "",
    preNotes: formData.get("preNotes") ?? "",
    postNotes: formData.get("postNotes") ?? "",
    status: formData.get("status") ?? "scheduled",
  });

  await db
    .update(sessions)
    .set({
      startsAt: new Date(parsed.startsAt),
      durationMin: parsed.durationMin,
      location: strOrNull(parsed.location),
      preNotes: strOrNull(parsed.preNotes),
      postNotes: strOrNull(parsed.postNotes),
      status: parsed.status,
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/sessions`);
  redirect(`/clients/${clientId}/sessions`);
}

export async function cancelSession(sessionId: string, clientId: string) {
  await db
    .update(sessions)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/sessions`);
}

export async function deleteSession(sessionId: string, clientId: string) {
  await db
    .delete(sessions)
    .where(and(eq(sessions.id, sessionId), eq(sessions.clientId, clientId)));

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/sessions`);
}
