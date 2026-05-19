"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteGoal } from "@/lib/actions/goals";

export function DeleteGoalButton({
  id,
  clientId,
}: {
  id: string;
  clientId: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteGoal(id, clientId);
        })
      }
      className="flex h-11 w-11 items-center justify-center rounded-full bg-card-hover/40 text-text-tertiary hover:bg-card-hover hover:text-accent-red disabled:opacity-50"
      aria-label="Delete goal"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
