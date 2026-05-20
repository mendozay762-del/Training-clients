"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deletePrescribedWorkout,
  skipPrescription,
  startSessionFromPrescription,
  unskipPrescription,
} from "@/lib/actions/prescriptions";

interface Props {
  prescribedId: string;
  clientId: string;
  blockId: string;
  status: string;
  hasActualWorkout: boolean;
}

export function PrescribedActions({
  prescribedId,
  clientId,
  blockId,
  status,
  hasActualWorkout,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [showSkip, setShowSkip] = useState(false);
  const [skipReason, setSkipReason] = useState("");

  function onStart() {
    startTransition(async () => {
      await startSessionFromPrescription(prescribedId);
    });
  }

  function onSkipSubmit() {
    const fd = new FormData();
    if (skipReason.trim()) fd.set("reason", skipReason.trim());
    startTransition(async () => {
      await skipPrescription(prescribedId, clientId, blockId, fd);
      setShowSkip(false);
      setSkipReason("");
    });
  }

  function onUnskip() {
    startTransition(async () => {
      await unskipPrescription(prescribedId, clientId, blockId);
    });
  }

  function onDelete() {
    if (!confirm("Delete this prescribed workout?")) return;
    startTransition(async () => {
      await deletePrescribedWorkout(prescribedId, clientId, blockId);
      window.location.href = `/clients/${clientId}/program/${blockId}`;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {!hasActualWorkout && status !== "skipped" && (
          <Button onClick={onStart} disabled={isPending}>
            {isPending ? "Starting…" : "Start session"}
          </Button>
        )}
        {status === "skipped" ? (
          <Button
            variant="secondary"
            onClick={onUnskip}
            disabled={isPending}
          >
            Un-skip
          </Button>
        ) : (
          !showSkip && (
            <Button
              variant="secondary"
              onClick={() => setShowSkip(true)}
              disabled={isPending}
            >
              Skip
            </Button>
          )
        )}
        <Button
          variant="ghost"
          onClick={onDelete}
          disabled={isPending}
          className="text-accent-red hover:text-accent-red"
        >
          Delete
        </Button>
      </div>

      {showSkip && (
        <div className="flex flex-col gap-2 rounded-md bg-card-hover/40 p-3">
          <label
            htmlFor="skipReason"
            className="text-xs font-medium uppercase tracking-wider text-text-secondary"
          >
            Skip reason (optional)
          </label>
          <Input
            id="skipReason"
            value={skipReason}
            onChange={(e) => setSkipReason(e.target.value)}
            maxLength={500}
            placeholder="e.g. sick, scheduling, deload day"
          />
          <div className="flex gap-2">
            <Button onClick={onSkipSubmit} disabled={isPending}>
              {isPending ? "Saving…" : "Confirm skip"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowSkip(false);
                setSkipReason("");
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
