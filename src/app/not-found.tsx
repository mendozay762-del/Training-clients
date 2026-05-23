import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-semibold">Not found.</h1>
      <p className="max-w-md text-sm text-text-secondary">
        That page or record doesn&apos;t exist — it may have been deleted, or
        the link is wrong.
      </p>
      <Link
        href="/clients"
        className="mt-2 rounded-btn bg-accent-blue px-4 py-2 text-sm font-semibold text-white hover:bg-accent-blue/90"
      >
        Go to clients
      </Link>
    </div>
  );
}
