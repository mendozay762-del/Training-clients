import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { BlockForm } from "@/components/program/block-form";
import { getClient } from "@/lib/queries/clients";

export const dynamic = "force-dynamic";

export default async function NewBlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <>
      <PageHeader title="New block" back={`/clients/${id}/program`} />
      <div className="p-4">
        <section className="rounded-card bg-card p-4">
          <p className="mb-4 text-sm text-text-secondary">
            Block metadata only here — exercises come from a Sheets paste on
            the block page after you save.
          </p>
          <BlockForm clientId={id} />
        </section>
      </div>
    </>
  );
}
