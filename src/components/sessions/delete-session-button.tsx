"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteSession } from "@/lib/actions/sessions";

interface Props {
  sessionId: string;
  clientId: string;
}

export function DeleteSessionButton({ sessionId, clientId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="destructive"
      className="w-full"
      disabled={isPending}
      onClick={() => {
        if (!confirm("Delete this session?")) return;
        startTransition(async () => {
          await deleteSession(sessionId, clientId);
          router.push(`/clients/${clientId}/sessions`);
        });
      }}
    >
      {isPending ? "Deleting…" : "Delete session"}
    </Button>
  );
}
