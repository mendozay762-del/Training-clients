import { notFound } from "next/navigation";
import { PageHeader } from "@/components/nav/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { updateClient, deleteClient } from "@/lib/actions/clients";
import { getClient } from "@/lib/queries/clients";
import { Button } from "@/components/ui/button";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const boundUpdate = updateClient.bind(null, id);
  const boundDelete = deleteClient.bind(null, id);

  return (
    <>
      <PageHeader title="Edit client" back={`/clients/${id}`} />
      <ClientForm
        action={boundUpdate}
        initial={client}
        submitLabel="Save changes"
      />
      <form action={boundDelete} className="px-4 pb-8">
        <Button type="submit" variant="destructive" className="w-full">
          Delete client
        </Button>
        <p className="mt-2 text-center text-xs text-text-tertiary">
          Deletes all of this client&apos;s data. Cannot be undone.
        </p>
      </form>
    </>
  );
}
