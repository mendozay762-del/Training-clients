"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Client } from "@/db/schema";

interface ClientFormProps {
  action: (formData: FormData) => Promise<void>;
  initial?: Partial<Client>;
  submitLabel: string;
}

export function ClientForm({ action, initial, submitLabel }: ClientFormProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => startTransition(() => action(fd))}
      className="flex flex-col gap-4 p-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={initial?.name ?? ""}
          placeholder="Sarah K."
          autoFocus={!initial}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          defaultValue={initial?.email ?? ""}
          placeholder="optional"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          defaultValue={initial?.phone ?? ""}
          placeholder="optional"
        />
      </div>

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
        <Label htmlFor="goalsSummary">Goals summary</Label>
        <Textarea
          id="goalsSummary"
          name="goalsSummary"
          defaultValue={initial?.goalsSummary ?? ""}
          placeholder="What are they working toward?"
        />
      </div>

      {initial && (
        <input
          type="hidden"
          name="active"
          value={String(initial.active ?? true)}
        />
      )}

      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
