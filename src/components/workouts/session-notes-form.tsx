"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { endWorkout } from "@/lib/actions/workouts";

interface Props {
  workoutId: string;
  initialNotes: string | null;
}

export function SessionNotesForm({ workoutId, initialNotes }: Props) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [savedAt, setSavedAt] = useState<Date | null>(
    initialNotes ? new Date() : null,
  );

  function save() {
    const fd = new FormData();
    fd.set("workoutId", workoutId);
    fd.set("notes", notes);
    startTransition(async () => {
      await endWorkout(fd);
      setSavedAt(new Date());
    });
  }

  return (
    <section className="flex flex-col gap-2 rounded-card bg-card p-4">
      <Label htmlFor="notes">Session notes</Label>
      <Textarea
        id="notes"
        rows={4}
        maxLength={5000}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="60 seconds: what worked, what to change, any pain or wins."
      />
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-text-tertiary">
          {savedAt
            ? `Saved ${savedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`
            : "Unsaved"}
        </span>
        <Button type="button" onClick={save} disabled={isPending}>
          {isPending ? "Saving…" : "Save notes"}
        </Button>
      </div>
    </section>
  );
}
