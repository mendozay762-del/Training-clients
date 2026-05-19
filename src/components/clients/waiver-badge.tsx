import Link from "next/link";
import { ShieldCheck, ShieldAlert } from "lucide-react";

interface WaiverBadgeProps {
  acceptedAt: Date | null;
  intakeHref: string;
}

export function WaiverBadge({ acceptedAt, intakeHref }: WaiverBadgeProps) {
  if (acceptedAt) {
    const signedOn = new Date(acceptedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-green/10 px-2.5 py-1 text-xs font-medium text-accent-green">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
        Waiver signed {signedOn}
      </div>
    );
  }

  return (
    <Link
      href={intakeHref}
      className="inline-flex items-center gap-1.5 rounded-full bg-accent-amber/10 px-2.5 py-1 text-xs font-medium text-accent-amber hover:bg-accent-amber/20"
    >
      <ShieldAlert className="h-3.5 w-3.5" aria-hidden />
      Waiver not signed
    </Link>
  );
}
