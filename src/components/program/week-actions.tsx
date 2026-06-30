"use client";

import { useTransition } from "react";
import { deletePrescribedWorkouts } from "@/lib/actions/prescriptions";

interface Props {
  clientId: string;
  blockId: string;
  weekLabel: string;
  // Un-logged day ids in this week, and in this week + every later week.
  weekIds: string[];
  fromHereIds: string[];
}

function dayCount(n: number) {
  return `${n} planned day${n === 1 ? "" : "s"}`;
}

export function WeekActions({
  clientId,
  blockId,
  weekLabel,
  weekIds,
  fromHereIds,
}: Props) {
  const [isPending, startTransition] = useTransition();

  function deleteWeek() {
    if (weekIds.length === 0) return;
    if (
      !confirm(
        `Delete ${weekLabel} — ${dayCount(weekIds.length)}? Logged sessions are kept. This can't be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deletePrescribedWorkouts(clientId, blockId, weekIds);
    });
  }

  function cutFromHere() {
    if (fromHereIds.length === 0) return;
    if (
      !confirm(
        `Delete ${weekLabel} and everything after it — ${dayCount(fromHereIds.length)}? Logged sessions are kept. This can't be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deletePrescribedWorkouts(clientId, blockId, fromHereIds);
    });
  }

  if (weekIds.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={deleteWeek}
        disabled={isPending}
        className="rounded-btn px-2 py-1 text-[11px] font-medium text-text-tertiary hover:bg-card-hover hover:text-accent-red disabled:opacity-50"
      >
        Delete week
      </button>
      {fromHereIds.length > weekIds.length && (
        <button
          type="button"
          onClick={cutFromHere}
          disabled={isPending}
          className="rounded-btn px-2 py-1 text-[11px] font-medium text-text-tertiary hover:bg-card-hover hover:text-accent-red disabled:opacity-50"
        >
          Cut from here ↓
        </button>
      )}
    </div>
  );
}
