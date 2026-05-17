"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { toggleGoalDone } from "@/lib/actions/goals";
import { cn } from "@/lib/utils";

interface Props {
  id: string;
  clientId: string;
  body: string;
  done: boolean;
}

export function GoalToggleRow({ id, clientId, body, done }: Props) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleGoalDone(id, clientId);
        })
      }
      className="flex w-full items-center gap-2.5 text-left text-sm disabled:opacity-50"
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border",
          done
            ? "border-accent-green bg-accent-green text-black"
            : "border-text-tertiary",
        )}
      >
        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
      <span
        className={cn(
          "flex-1",
          done ? "text-text-tertiary line-through" : "text-text-primary",
        )}
      >
        {body}
      </span>
    </button>
  );
}
