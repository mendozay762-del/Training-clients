"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGoal } from "@/lib/actions/goals";

export function GoalForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          await createGoal(fd);
          formRef.current?.reset();
        })
      }
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="clientId" value={clientId} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">Goal</Label>
        <Input
          id="body"
          name="body"
          required
          maxLength={500}
          placeholder="e.g. Hit 405 lb squat by Dec"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="targetDate">Target date (optional)</Label>
        <Input id="targetDate" name="targetDate" type="date" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add goal"}
      </Button>
    </form>
  );
}
