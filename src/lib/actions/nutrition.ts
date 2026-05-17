"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { nutritionNotes } from "@/db/schema";
import { nutritionFormSchema } from "@/lib/schemas/nutrition";

export async function createNutritionNote(formData: FormData) {
  const parsed = nutritionFormSchema.parse({
    clientId: formData.get("clientId"),
    noteDate: formData.get("noteDate") ?? "",
    bodyMd: formData.get("bodyMd"),
  });

  await db.insert(nutritionNotes).values({
    clientId: parsed.clientId,
    noteDate:
      parsed.noteDate && parsed.noteDate.length > 0
        ? parsed.noteDate
        : new Date().toISOString().slice(0, 10),
    bodyMd: parsed.bodyMd,
  });

  revalidatePath(`/clients/${parsed.clientId}`);
  revalidatePath(`/clients/${parsed.clientId}/nutrition`);
}

export async function deleteNutritionNote(id: string, clientId: string) {
  await db.delete(nutritionNotes).where(eq(nutritionNotes.id, id));
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/nutrition`);
}
