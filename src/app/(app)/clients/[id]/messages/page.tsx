import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { MessageForm } from "@/components/messages/message-form";
import { DeleteMessageButton } from "@/components/messages/delete-message-button";
import { ActionItemToggle } from "@/components/messages/action-item-toggle";
import { ChannelPill } from "@/components/messages/channel-pill";
import { getClient, listMessages } from "@/lib/queries/clients";
import type { MessageChannel } from "@/lib/schemas/messages";

export const dynamic = "force-dynamic";

function formatWhen(d: Date): string {
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ClientMessagesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, messages] = await Promise.all([
    getClient(id),
    listMessages(id),
  ]);
  if (!client) notFound();

  const openActions = messages.filter(
    (m) => m.actionItem && !m.actionDone,
  ).length;

  return (
    <>
      <PageHeader title="Messages" back={`/clients/${id}`} />

      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-card bg-card p-4">
          <div className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Log a message
          </div>
          <MessageForm clientId={id} />
        </section>

        {openActions > 0 && (
          <div className="rounded-card border border-accent-amber/30 bg-accent-amber/10 p-3 text-sm text-text-primary">
            <span className="font-semibold">{openActions}</span> open action
            item{openActions === 1 ? "" : "s"}
          </div>
        )}

        {messages.length === 0 ? (
          <p className="text-center text-sm text-text-tertiary">
            No messages logged yet.
          </p>
        ) : (
          <section className="rounded-card bg-card p-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-text-secondary">
              History ({messages.length})
            </div>
            <ul className="flex flex-col gap-4">
              {messages.map((m) => (
                <li
                  key={m.id}
                  className="flex items-start justify-between gap-3 border-b border-white/[0.04] pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ChannelPill
                        channel={m.channel as MessageChannel}
                        channelOther={m.channelOther}
                      />
                      <span className="text-xs text-text-tertiary tabnums">
                        {formatWhen(new Date(m.occurredAt))}
                      </span>
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm text-text-primary">
                      {m.body}
                    </div>
                    {m.actionItem && (
                      <div className="mt-2">
                        <ActionItemToggle
                          id={m.id}
                          clientId={id}
                          actionItem={m.actionItem}
                          done={m.actionDone}
                        />
                      </div>
                    )}
                  </div>
                  <DeleteMessageButton id={m.id} clientId={id} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
