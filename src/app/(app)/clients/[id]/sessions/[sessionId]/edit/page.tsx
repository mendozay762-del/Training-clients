import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { SessionForm } from "@/components/sessions/session-form";
import { DeleteSessionButton } from "@/components/sessions/delete-session-button";
import { getSession } from "@/lib/queries/clients";

export const dynamic = "force-dynamic";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;
  const session = await getSession(sessionId);
  if (!session || session.clientId !== id) notFound();

  return (
    <>
      <PageHeader title="Edit session" back={`/clients/${id}/sessions`} />
      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-card bg-card p-4">
          <SessionForm clientId={id} initial={session} />
        </section>
        <section className="rounded-card bg-card p-4">
          <DeleteSessionButton sessionId={sessionId} clientId={id} />
          <p className="mt-2 text-center text-xs text-text-tertiary">
            Or set status to Cancelled above to keep it on the record.
          </p>
        </section>
      </div>
    </>
  );
}
