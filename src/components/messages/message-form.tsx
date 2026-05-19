"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  MESSAGE_CHANNELS,
  MESSAGE_CHANNEL_LABELS,
  type MessageChannel,
} from "@/lib/schemas/messages";
import { createMessage } from "@/lib/actions/messages";

export function MessageForm({ clientId }: { clientId: string }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [now, setNow] = useState("");
  const [channel, setChannel] = useState<MessageChannel>("in_person");
  const [channelOther, setChannelOther] = useState("");

  useEffect(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    setNow(d.toISOString().slice(0, 16));
  }, []);

  return (
    <form
      ref={formRef}
      action={(fd) =>
        startTransition(async () => {
          fd.set("channel", channel);
          fd.set("channelOther", channelOther);
          await createMessage(fd);
          formRef.current?.reset();
          setChannel("in_person");
          setChannelOther("");
        })
      }
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="clientId" value={clientId} />

      <div className="flex flex-col gap-1.5">
        <Label>Channel</Label>
        <div className="flex flex-wrap gap-1.5">
          {MESSAGE_CHANNELS.map((c) => {
            const selected = channel === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setChannel(c)}
                className={cn(
                  "h-9 rounded-full border px-3 text-xs font-medium transition-colors",
                  selected
                    ? "bg-accent-blue/15 border-accent-blue/60 text-accent-blue"
                    : "bg-card/60 border-border-subtle/40 text-text-secondary hover:text-text-primary",
                )}
              >
                {MESSAGE_CHANNEL_LABELS[c]}
              </button>
            );
          })}
        </div>
        {channel === "other" && (
          <Input
            type="text"
            placeholder="Specify channel"
            value={channelOther}
            onChange={(e) => setChannelOther(e.target.value)}
            maxLength={40}
            className="mt-1"
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="occurredAt">When</Label>
        <Input
          id="occurredAt"
          name="occurredAt"
          type="datetime-local"
          defaultValue={now}
          key={now}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          name="body"
          required
          maxLength={5000}
          rows={3}
          placeholder="What was discussed? Any concerns, wins, changes…"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="actionItem">Action item (optional)</Label>
        <Input
          id="actionItem"
          name="actionItem"
          type="text"
          maxLength={500}
          placeholder="What needs to happen next, and by whom"
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Logging…" : "Log message"}
      </Button>
    </form>
  );
}
