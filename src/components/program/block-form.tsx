"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BLOCK_STATUSES,
  BLOCK_STYLES,
  BLOCK_STYLE_LABELS,
} from "@/lib/schemas/prescriptions";
import { createBlock, updateBlock } from "@/lib/actions/prescriptions";
import type { TrainingBlock } from "@/db/schema";

interface Props {
  clientId: string;
  initial?: TrainingBlock | null;
}

export function BlockForm({ clientId, initial }: Props) {
  const [isPending, startTransition] = useTransition();
  const editing = Boolean(initial);

  return (
    <form
      action={(fd) =>
        startTransition(async () => {
          if (initial) {
            await updateBlock(initial.id, clientId, fd);
          } else {
            await createBlock(fd);
          }
        })
      }
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="clientId" value={clientId} />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={80}
          defaultValue={initial?.name ?? ""}
          placeholder="e.g. Off-season hypertrophy"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="style">Style</Label>
          <select
            id="style"
            name="style"
            defaultValue={initial?.style ?? ""}
            className="flex h-11 w-full rounded-btn bg-card-hover/40 px-3 text-base text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
          >
            <option value="">—</option>
            {BLOCK_STYLES.map((s) => (
              <option key={s} value={s}>
                {BLOCK_STYLE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        {editing && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={initial?.status ?? "draft"}
              className="flex h-11 w-full rounded-btn bg-card-hover/40 px-3 text-base text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue"
            >
              {BLOCK_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">Start date</Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            defaultValue={initial?.startDate ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">End date</Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            defaultValue={initial?.endDate ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="weeklySplitSummary">Weekly split</Label>
        <Input
          id="weeklySplitSummary"
          name="weeklySplitSummary"
          maxLength={200}
          defaultValue={initial?.weeklySplitSummary ?? ""}
          placeholder="e.g. Mon Lower · Wed Upper · Fri Full"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={initial?.notes ?? ""}
          placeholder="Anything that doesn't fit into the per-exercise rows"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending
          ? "Saving…"
          : editing
            ? "Update block"
            : "Create block"}
      </Button>
    </form>
  );
}
