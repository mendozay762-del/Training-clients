"use client";

import { useState, useTransition } from "react";
import { Flame, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteSet, updateSet } from "@/lib/actions/workouts";
import { epleyOneRm } from "@/lib/schemas/workouts";

type SetState = {
  reps: string;
  weightLbs: string;
  rpe: string;
  rir: string;
  isWarmup: boolean;
};

function toStr(v: number | string | null | undefined): string {
  if (v === null || v === undefined) return "";
  return String(v);
}

function buildFormData(setId: string, s: SetState): FormData {
  const fd = new FormData();
  fd.set("setId", setId);
  fd.set("reps", s.reps);
  fd.set("weightLbs", s.weightLbs);
  fd.set("rpe", s.rpe);
  fd.set("rir", s.rir);
  fd.set("isWarmup", s.isWarmup ? "true" : "false");
  return fd;
}

interface Props {
  id: string;
  setIndex: number;
  initial: {
    reps: number;
    weightLbs: string | null;
    rpe: string | null;
    rir: number | null;
    isWarmup: boolean;
  };
}

export function SetRow({ id, setIndex, initial }: Props) {
  const [state, setState] = useState<SetState>({
    reps: toStr(initial.reps),
    weightLbs: toStr(initial.weightLbs),
    rpe: toStr(initial.rpe),
    rir: toStr(initial.rir),
    isWarmup: initial.isWarmup,
  });
  const [isPending, startTransition] = useTransition();

  const repsNum = state.reps === "" ? null : Number(state.reps);
  const weightNum = state.weightLbs === "" ? null : Number(state.weightLbs);
  const e1rm =
    !state.isWarmup &&
    repsNum !== null &&
    weightNum !== null &&
    !Number.isNaN(repsNum) &&
    !Number.isNaN(weightNum)
      ? epleyOneRm(weightNum, repsNum)
      : null;

  function commit(next: SetState) {
    setState(next);
    startTransition(async () => {
      await updateSet(buildFormData(id, next));
    });
  }

  function onDelete() {
    if (!confirm("Delete this set?")) return;
    startTransition(async () => {
      await deleteSet(id);
    });
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[24px_1fr_1fr_1fr_1fr_44px] items-center gap-2 rounded-btn border border-border-subtle/30 bg-card/40 p-2 transition-opacity",
        state.isWarmup && "opacity-60",
        isPending && "opacity-80",
      )}
    >
      <button
        type="button"
        title={state.isWarmup ? "Working set" : "Mark as warm-up"}
        onClick={() => commit({ ...state, isWarmup: !state.isWarmup })}
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold tabnums",
          state.isWarmup
            ? "bg-accent-amber/20 text-accent-amber"
            : "bg-card-hover text-text-tertiary hover:text-text-primary",
        )}
        aria-label={state.isWarmup ? "Marked as warm-up" : "Mark as warm-up"}
      >
        {state.isWarmup ? <Flame className="h-3.5 w-3.5" /> : setIndex}
      </button>

      <CellInput
        label="reps"
        value={state.reps}
        type="number"
        onChange={(v) => setState({ ...state, reps: v })}
        onCommit={(v) => commit({ ...state, reps: v })}
      />
      <CellInput
        label="lb"
        value={state.weightLbs}
        type="number"
        onChange={(v) => setState({ ...state, weightLbs: v })}
        onCommit={(v) => commit({ ...state, weightLbs: v })}
        step="2.5"
      />
      <CellInput
        label="RPE"
        value={state.rpe}
        type="number"
        onChange={(v) => setState({ ...state, rpe: v })}
        onCommit={(v) => commit({ ...state, rpe: v })}
        step="0.5"
      />
      <CellInput
        label="RIR"
        value={state.rir}
        type="number"
        onChange={(v) => setState({ ...state, rir: v })}
        onCommit={(v) => commit({ ...state, rir: v })}
      />

      <button
        type="button"
        onClick={onDelete}
        disabled={isPending}
        className="flex h-10 w-10 items-center justify-center rounded-full text-text-tertiary hover:bg-card-hover hover:text-accent-red disabled:opacity-50"
        aria-label="Delete set"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {e1rm !== null && (
        <div className="col-span-6 -mt-1 pl-8 text-[11px] text-text-tertiary tabnums">
          ≈ {e1rm.toFixed(0)} lb 1RM
        </div>
      )}
    </div>
  );
}

interface CellInputProps {
  label: string;
  value: string;
  type: "number" | "text";
  onChange: (v: string) => void;
  onCommit: (v: string) => void;
  step?: string;
}

function CellInput({
  label,
  value,
  type,
  onChange,
  onCommit,
  step,
}: CellInputProps) {
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(value);
  const [focusValue, setFocusValue] = useState(value);

  // Keep draft in sync if parent value changes externally (e.g. prefill).
  if (!focused && draft !== value) {
    setDraft(value);
  }

  return (
    <label className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-text-tertiary">
        {label}
      </span>
      <input
        type={type}
        inputMode="decimal"
        step={step}
        value={focused ? draft : value}
        onFocus={() => {
          setDraft(value);
          setFocusValue(value);
          setFocused(true);
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          onChange(e.target.value);
        }}
        onBlur={() => {
          setFocused(false);
          if (draft !== focusValue) {
            onCommit(draft);
          }
        }}
        className="w-full rounded-btn bg-transparent px-1 py-1 text-base font-semibold text-text-primary tabnums focus:bg-card-hover focus:outline-none"
      />
    </label>
  );
}
