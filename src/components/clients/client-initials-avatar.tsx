import { getInitials, cn } from "@/lib/utils";

const PALETTE = [
  "bg-[#1e3a8a]",
  "bg-[#7c2d12]",
  "bg-[#14532d]",
  "bg-[#581c87]",
  "bg-[#831843]",
  "bg-[#134e4a]",
  "bg-[#713f12]",
  "bg-[#1e293b]",
];

function colorFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}

interface Props {
  name: string;
  id: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
};

export function ClientInitialsAvatar({
  name,
  id,
  size = "md",
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-card font-semibold text-text-primary",
        colorFor(id),
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}
