import { z } from "zod";

export const MESSAGE_CHANNELS = [
  "in_person",
  "text",
  "call",
  "email",
  "instagram",
  "snapchat",
  "other",
] as const;

export type MessageChannel = (typeof MESSAGE_CHANNELS)[number];

export const MESSAGE_CHANNEL_LABELS: Record<MessageChannel, string> = {
  in_person: "In person",
  text: "Text",
  call: "Call",
  email: "Email",
  instagram: "Instagram",
  snapchat: "Snapchat",
  other: "Other",
};

export const createMessageSchema = z.object({
  clientId: z.string().uuid(),
  occurredAt: z.string().min(1, "Date is required"),
  channel: z.enum(MESSAGE_CHANNELS),
  channelOther: z.string().trim().max(40).optional().or(z.literal("")),
  body: z.string().trim().min(1, "Write something").max(5000),
  actionItem: z.string().trim().max(500).optional().or(z.literal("")),
});

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
