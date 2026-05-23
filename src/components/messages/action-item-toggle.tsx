"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleActionDone } from "@/lib/actions/messages";

interface Props {
  id: string;
  clientId: string;
  actionItem: string;
  done: boolean;
}

export function ActionItemToggle({ id, clientId, actionItem, done }: Props) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      aria-pressed={done}
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await toggleActionDone(id, clientId, !done);
        })
      }
      className={cn(
        "flex w-full items-start gap-2 rounded-btn border px-3 py-2 text-left text-sm transition-colors disabled:opacity-50",
        done
          ? "bg-accent-green/10 border-accent-green/30 text-text-tertiary line-through"
          : "bg-accent-amber/10 border-accent-amber/30 text-text-primary",
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border",
          done
            ? "bg-accent-green border-accent-green"
            : "border-border-subtle",
        )}
      >
        {done && <Check className="h-3.5 w-3.5 text-white" />}
      </span>
      <span className="flex-1">{actionItem}</span>
    </button>
  );
}
