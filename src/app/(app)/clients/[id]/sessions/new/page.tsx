import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { SessionForm } from "@/components/sessions/session-form";
import { getClient } from "@/lib/queries/clients";

export const dynamic = "force-dynamic";

export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <>
      <PageHeader title="Schedule session" back={`/clients/${id}`} />
      <div className="p-4">
        <section className="rounded-card bg-card p-4">
          <SessionForm clientId={id} />
        </section>
      </div>
    </>
  );
}
