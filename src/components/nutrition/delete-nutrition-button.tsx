"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteNutritionNote } from "@/lib/actions/nutrition";

export function DeleteNutritionButton({
  id,
  clientId,
}: {
  id: string;
  clientId: string;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteNutritionNote(id, clientId);
        })
      }
      className="flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:bg-card-hover hover:text-accent-red disabled:opacity-50"
      aria-label="Delete note"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
