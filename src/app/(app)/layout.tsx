import { BottomNav } from "@/components/nav/bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh pb-20">
      <main className="mx-auto max-w-2xl">{children}</main>
      <BottomNav />
    </div>
  );
}
