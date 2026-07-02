"use client";

import { useState, useTransition } from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addWorkoutToProgram } from "@/lib/actions/prescriptions";

interface Props {
  workoutId: string;
  clientId: string;
  programs: { id: string; name: string }[];
}

export function AddToProgramButton({ workoutId, clientId, programs }: Props) {
  const [isPending, startTransition] = useTransition();
  const [blockId, setBlockId] = useState(programs[0]?.id ?? "");

  if (programs.length === 0) return null;

  function add() {
    if (!blockId) return;
    startTransition(async () => {
      await addWorkoutToProgram(workoutId, clientId, blockId);
    });
  }

  return (
    <section className="rounded-card border border-accent-blue/25 bg-accent-blue/5 p-3">
      <div className="flex items-start gap-2">
        <FolderPlus className="mt-0.5 h-4 w-4 shrink-0 text-accent-blue" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">
            This session isn&apos;t in a program yet
          </p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Add it so it shows up as a completed day in the program.
          </p>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {programs.length > 1 && (
              <select
                value={blockId}
                onChange={(e) => setBlockId(e.target.value)}
                disabled={isPending}
                className="rounded-btn border border-border-subtle/60 bg-card px-2 py-1.5 text-sm text-text-primary focus:outline-none"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
            <Button onClick={add} disabled={isPending || !blockId}>
              {isPending
                ? "Adding…"
                : programs.length === 1
                  ? `Add to ${programs[0].name}`
                  : "Add to program"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
