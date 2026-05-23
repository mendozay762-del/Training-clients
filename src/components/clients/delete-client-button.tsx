"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteClient } from "@/lib/actions/clients";

export function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (
      !confirm(
        `Delete ${clientName} and ALL of their data — workouts, program, stats, intake, and messages? This cannot be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteClient(clientId);
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      className="w-full"
      onClick={onClick}
      disabled={isPending}
    >
      {isPending ? "Deleting…" : "Delete client"}
    </Button>
  );
}
