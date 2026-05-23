import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { DeleteClientButton } from "@/components/clients/delete-client-button";
import { updateClient } from "@/lib/actions/clients";
import { getClient } from "@/lib/queries/clients";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const boundUpdate = updateClient.bind(null, id);

  return (
    <>
      <PageHeader title="Edit client" back={`/clients/${id}`} />
      <ClientForm
        action={boundUpdate}
        initial={client}
        submitLabel="Save changes"
      />
      <div className="px-4 pb-8">
        <DeleteClientButton clientId={id} clientName={client.name} />
        <p className="mt-2 text-center text-xs text-text-tertiary">
          Deletes all of this client&apos;s data. Cannot be undone.
        </p>
      </div>
    </>
  );
}
