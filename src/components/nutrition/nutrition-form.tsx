"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createNutritionNote } from "@/lib/actions/nutrition";
import { todayInAppTz } from "@/lib/utils";

export function NutritionForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(todayInAppTz());
  }, []);

  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          await createNutritionNote(fd);
          formRef.current?.reset();
        })
      }
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="clientId" value={clientId} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="noteDate">Date</Label>
        <Input
          id="noteDate"
          name="noteDate"
          type="date"
          defaultValue={today}
          key={today}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bodyMd">Note (Markdown OK)</Label>
        <Textarea
          id="bodyMd"
          name="bodyMd"
          required
          maxLength={5000}
          rows={5}
          placeholder="What did they eat, how did macros look, anything to adjust…"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add note"}
      </Button>
    </form>
  );
}
