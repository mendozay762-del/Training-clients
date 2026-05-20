import { z } from "zod";

export const SESSION_STATUSES = ["scheduled", "completed", "cancelled"] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
};

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const optionalText = (max: number) =>
  z.preprocess(emptyToUndef, z.string().trim().max(max).optional());

export const createSessionSchema = z.object({
  clientId: z.string().uuid(),
  startsAt: z.string().min(1, "Date and time are required"),
  durationMin: z.coerce.number().int().min(5).max(480).default(60),
  location: optionalText(120),
  preNotes: optionalText(2000),
});

export type CreateSessionInput = z.infer<typeof createSessionSchema>;

export const updateSessionSchema = z.object({
  startsAt: z.string().min(1, "Date and time are required"),
  durationMin: z.coerce.number().int().min(5).max(480).default(60),
  location: optionalText(120),
  preNotes: optionalText(2000),
  postNotes: optionalText(2000),
  status: z.enum(SESSION_STATUSES),
});

export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
