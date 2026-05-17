import { PageHeader } from "@/components/nav/page-header";
import { ClientForm } from "@/components/clients/client-form";
import { createClient } from "@/lib/actions/clients";

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="New client" back="/clients" />
      <ClientForm action={createClient} submitLabel="Create client" />
    </>
  );
}
