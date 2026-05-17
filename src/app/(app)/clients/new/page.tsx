import { PageHeader } from "@/components/nav/page-header";
import { IntakeWithViewer } from "@/components/intake/intake-with-viewer";

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="New client" back="/clients" />
      <IntakeWithViewer />
    </>
  );
}
