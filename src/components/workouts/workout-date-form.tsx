"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { updateWorkoutDate } from "@/lib/actions/workouts";

interface Props {
  workoutId: string;
  performedOn: string;
}

export function WorkoutDateForm({ workoutId, performedOn }: Props) {
  const [value, setValue] = useState(performedOn);
  const [isPending, startTransition] = useTransition();

  function commit(next: string) {
    if (!next || next === performedOn) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("workoutId", workoutId);
      fd.set("performedOn", next);
      await updateWorkoutDate(fd);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => commit(value)}
        disabled={isPending}
        className="h-9 w-auto"
      />
    </div>
  );
}
