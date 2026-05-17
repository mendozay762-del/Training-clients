"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { clientFormSchema } from "@/lib/schemas/client";

function emptyToNull(v: string | undefined | null): string | null {
  return v && v.length > 0 ? v : null;
}

export async function createClient(formData: FormData) {
  const parsed = clientFormSchema.parse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    startDate: formData.get("startDate") ?? "",
    goalsSummary: formData.get("goalsSummary") ?? "",
    active: true,
  });

  const [row] = await db
    .insert(clients)
    .values({
      name: parsed.name,
      email: emptyToNull(parsed.email),
      phone: emptyToNull(parsed.phone),
      startDate: emptyToNull(parsed.startDate),
      goalsSummary: emptyToNull(parsed.goalsSummary),
      active: true,
    })
    .returning({ id: clients.id });

  revalidatePath("/clients");
  redirect(`/clients/${row.id}`);
}

export async function updateClient(id: string, formData: FormData) {
  const parsed = clientFormSchema.parse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    startDate: formData.get("startDate") ?? "",
    goalsSummary: formData.get("goalsSummary") ?? "",
    active: formData.get("active") === "true",
  });

  await db
    .update(clients)
    .set({
      name: parsed.name,
      email: emptyToNull(parsed.email),
      phone: emptyToNull(parsed.phone),
      startDate: emptyToNull(parsed.startDate),
      goalsSummary: emptyToNull(parsed.goalsSummary),
      active: parsed.active,
      updatedAt: new Date(),
    })
    .where(eq(clients.id, id));

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClient(id: string) {
  await db.delete(clients).where(eq(clients.id, id));
  revalidatePath("/clients");
  redirect("/clients");
}
