"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updatePrescribedWorkout } from "@/lib/actions/prescriptions";

interface Props {
  prescribedId: string;
  clientId: string;
  blockId: string;
  initial: {
    name: string | null;
    notes: string | null;
    prescribedFor: string;
  };
}

export function PrescribedWorkoutForm({
  prescribedId,
  clientId,
  blockId,
  initial,
}: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          await updatePrescribedWorkout(prescribedId, clientId, blockId, fd);
        })
      }
      className="flex flex-col gap-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="prescribedFor">Date</Label>
          <Input
            id="prescribedFor"
            name="prescribedFor"
            type="date"
            defaultValue={initial.prescribedFor}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            maxLength={80}
            defaultValue={initial.name ?? ""}
            placeholder="e.g. Lower A"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={initial.notes ?? ""}
          placeholder="Anything specific to this session"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
