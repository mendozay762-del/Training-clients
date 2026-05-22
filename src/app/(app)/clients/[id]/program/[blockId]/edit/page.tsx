import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { BlockForm } from "@/components/program/block-form";
import { DeleteBlockButton } from "@/components/program/delete-block-button";
import { getBlock } from "@/lib/queries/clients";

export const dynamic = "force-dynamic";

export default async function EditBlockPage({
  params,
}: {
  params: Promise<{ id: string; blockId: string }>;
}) {
  const { id, blockId } = await params;
  const block = await getBlock(blockId);
  if (!block || block.clientId !== id) notFound();

  return (
    <>
      <PageHeader
        title="Edit block"
        back={`/clients/${id}`}
      />
      <div className="flex flex-col gap-4 p-4">
        <section className="rounded-card bg-card p-4">
          <BlockForm clientId={id} initial={block} />
        </section>
        <section className="rounded-card bg-card p-4">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Danger zone
          </h3>
          <p className="mb-3 text-sm text-text-secondary">
            Deleting a block removes its prescribed workouts. Logged sessions
            keep their data but lose the prescription link.
          </p>
          <DeleteBlockButton blockId={blockId} clientId={id} />
        </section>
      </div>
    </>
  );
}
