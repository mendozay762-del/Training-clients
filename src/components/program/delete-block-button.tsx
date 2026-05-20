"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteBlock } from "@/lib/actions/prescriptions";

interface Props {
  blockId: string;
  clientId: string;
}

export function DeleteBlockButton({ blockId, clientId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this block and all its prescribed workouts?")) {
          return;
        }
        startTransition(async () => {
          await deleteBlock(blockId, clientId);
          router.push(`/clients/${clientId}/program`);
        });
      }}
    >
      {isPending ? "Deleting…" : "Delete block"}
    </Button>
  );
}
