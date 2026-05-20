"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { importFromSheet, type ImportSummary } from "@/lib/actions/prescriptions";

const EXAMPLE = `prescribed_for\tworkout_name\texercise_name\tsets\treps\tload\trpe\trir\tnotes
2026-03-16\tLower A\tBack Squat\t4\t5\t225\t8\t\tTop set after warm-ups
2026-03-16\tLower A\tRDL\t3\t8-10\t185\t\t\tStay tight
2026-03-16\tLower A\tLeg Curl\t3\t12\t60\t\t\t
2026-03-18\tUpper A\tBench Press\t4\t5\t185\t8\t\t
2026-03-18\tUpper A\tDB Row\t3\t8\t70\t\t1\tPer side`;

interface Props {
  blockId: string;
}

export function SheetImportForm({ blockId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [paste, setPaste] = useState("");

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          const r = await importFromSheet(fd);
          setResult(r);
          if (r.ok) setPaste("");
        })
      }
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="blockId" value={blockId} />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="paste"
          className="text-xs font-medium uppercase tracking-wider text-text-secondary"
        >
          Paste from Sheets
        </label>
        <Textarea
          id="paste"
          name="paste"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          required
          rows={10}
          placeholder={EXAMPLE}
          className="min-h-[180px] font-mono text-sm"
        />
        <p className="text-xs text-text-tertiary">
          Header row must include <code className="text-text-secondary">prescribed_for</code>{" "}
          and <code className="text-text-secondary">exercise_name</code>. Optional:
          workout_name, sets, reps, load, rpe, rir, notes. Reps can be{" "}
          <code>8</code>, <code>6-8</code>, or freeform like <code>AMRAP</code>.
          Load can be <code>225</code>, <code>75%</code>, or freeform like{" "}
          <code>BW</code>.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-text-secondary">
        <input
          type="checkbox"
          name="replaceExisting"
          className="h-4 w-4 accent-accent-blue"
        />
        Replace existing prescribed workouts on the same dates
      </label>

      <Button
        type="submit"
        disabled={isPending || paste.trim().length === 0}
      >
        {isPending ? "Importing…" : "Import"}
      </Button>

      {result && (
        <ImportResult result={result} />
      )}
    </form>
  );
}

function ImportResult({ result }: { result: ImportSummary }) {
  if (result.ok) {
    return (
      <div className="rounded-card border border-accent-green/30 bg-accent-green/10 p-3 text-sm">
        <div className="font-medium text-accent-green">
          Imported {result.workoutsCreated} workout
          {result.workoutsCreated === 1 ? "" : "s"} ·{" "}
          {result.exercisesCreated} exercise
          {result.exercisesCreated === 1 ? "" : "s"}
        </div>
        {result.workoutsReplaced > 0 && (
          <div className="mt-1 text-xs text-text-secondary">
            Replaced {result.workoutsReplaced} existing workout
            {result.workoutsReplaced === 1 ? "" : "s"}.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-card border border-accent-red/30 bg-accent-red/10 p-3 text-sm">
      <div className="mb-2 font-medium text-accent-red">
        {result.errors.length} problem
        {result.errors.length === 1 ? "" : "s"} found — nothing was imported.
      </div>
      <ul className="flex flex-col gap-1.5 text-xs">
        {result.errors.slice(0, 10).map((err, i) => (
          <li key={i} className="flex flex-col">
            <span className="text-text-primary">
              Line {err.line} · {err.column}: {err.message}
            </span>
            {err.raw && (
              <span className="truncate text-text-tertiary tabnums">
                {err.raw}
              </span>
            )}
          </li>
        ))}
        {result.errors.length > 10 && (
          <li className="text-text-tertiary">
            …and {result.errors.length - 10} more.
          </li>
        )}
      </ul>
    </div>
  );
}
