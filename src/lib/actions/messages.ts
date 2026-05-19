"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { clientMessages } from "@/db/schema";
import { createMessageSchema } from "@/lib/schemas/messages";

export async function createMessage(formData: FormData) {
  const parsed = createMessageSchema.parse({
    clientId: formData.get("clientId"),
    occurredAt: formData.get("occurredAt") ?? "",
    channel: formData.get("channel"),
    channelOther: formData.get("channelOther") ?? "",
    body: formData.get("body") ?? "",
    actionItem: formData.get("actionItem") ?? "",
  });

  const channelOther =
    parsed.channel === "other" && parsed.channelOther
      ? parsed.channelOther
      : null;
  const actionItem =
    parsed.actionItem && parsed.actionItem.length > 0 ? parsed.actionItem : null;

  await db.insert(clientMessages).values({
    clientId: parsed.clientId,
    occurredAt: new Date(parsed.occurredAt),
    channel: parsed.channel,
    channelOther,
    body: parsed.body,
    actionItem,
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${parsed.clientId}`);
  revalidatePath(`/clients/${parsed.clientId}/messages`);
}

export async function deleteMessage(id: string, clientId: string) {
  await db.delete(clientMessages).where(eq(clientMessages.id, id));
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/messages`);
}

export async function toggleActionDone(
  id: string,
  clientId: string,
  done: boolean,
) {
  await db
    .update(clientMessages)
    .set({ actionDone: done, updatedAt: new Date() })
    .where(eq(clientMessages.id, id));
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/messages`);
}
