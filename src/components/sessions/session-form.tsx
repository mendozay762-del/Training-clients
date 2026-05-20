"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSession, updateSession } from "@/lib/actions/sessions";
import {
  SESSION_STATUSES,
  SESSION_STATUS_LABELS,
} from "@/lib/schemas/session";
import type { Session } from "@/db/schema";

interface Props {
  clientId: string;
  initial?: Session | null;
}

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultStart(): string {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return toLocalInput(d);
}

export function SessionForm({ clientId, initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const editing = Boolean(initial);

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const local = String(fd.get("startsAtLocal") ?? "");
          if (local) {
            const d = new Date(local);
            if (!Number.isNaN(d.getTime())) {
              fd.set("startsAt", d.toISOString());
            }
          }
          if (initial) {
            await updateSession(initial.id, clientId, fd);
          } else {
            await createSession(fd);
          }
        })
      }
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="clientId" value={clientId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startsAtLocal">Date &amp; time</Label>
        <Input
          id="startsAtLocal"
          name="startsAtLocal"
          type="datetime-local"
          required
          defaultValue={
            initial ? toLocalInput(new Date(initial.startsAt)) : defaultStart()
          }
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="durationMin">Duration (min)</Label>
          <Input
            id="durationMin"
            name="durationMin"
            type="number"
            inputMode="numeric"
            step="5"
            min="5"
            max="480"
            defaultValue={initial?.durationMin ?? 60}
          />
        </div>
        {editing && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={initial?.status ?? "scheduled"}
              className="flex h-11 w-full rounded-btn bg-card-hover/40 px-3 text-base text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
            >
              {SESSION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {SESSION_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          maxLength={120}
          defaultValue={initial?.location ?? ""}
          placeholder="e.g. Home gym, Gold's, Zoom"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="preNotes">Pre-session notes</Label>
        <Textarea
          id="preNotes"
          name="preNotes"
          defaultValue={initial?.preNotes ?? ""}
          placeholder="Anything to prep or remember for this session"
        />
      </div>

      {editing && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="postNotes">Post-session notes</Label>
          <Textarea
            id="postNotes"
            name="postNotes"
            defaultValue={initial?.postNotes ?? ""}
            placeholder="How it went"
          />
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending
          ? "Saving…"
          : editing
            ? "Save session"
            : "Schedule session"}
      </Button>
    </form>
  );
}
