"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { upsertBodyStats } from "@/lib/actions/body-stats";
import { currentWeekStart } from "@/lib/utils";
import type { BodyStat } from "@/db/schema";

interface Props {
  clientId: string;
  initial?: BodyStat | null;
}

export function BodyStatsForm({ clientId, initial }: Props) {
  const [isPending, startTransition] = useTransition();

  const weekStart =
    initial?.weekStart ?? currentWeekStart();

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          await upsertBodyStats(fd);
        })
      }
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="clientId" value={clientId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="weekStart">Week starting (Mon)</Label>
        <Input
          id="weekStart"
          name="weekStart"
          type="date"
          defaultValue={weekStart}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="weightLbs">Weight (lb)</Label>
          <Input
            id="weightLbs"
            name="weightLbs"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            defaultValue={initial?.weightLbs ?? ""}
            placeholder="—"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sleepHoursAvg">Sleep (hrs avg)</Label>
          <Input
            id="sleepHoursAvg"
            name="sleepHoursAvg"
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            max="24"
            defaultValue={initial?.sleepHoursAvg ?? ""}
            placeholder="—"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="wellness">Wellness (1–10)</Label>
        <Input
          id="wellness"
          name="wellness"
          type="number"
          inputMode="numeric"
          step="1"
          min="1"
          max="10"
          defaultValue={initial?.wellness ?? ""}
          placeholder="—"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={initial?.notes ?? ""}
          placeholder="Anything noteworthy this week"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : initial ? "Update week" : "Save week"}
      </Button>
    </form>
  );
}
