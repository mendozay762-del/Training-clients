"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKeyboardInset } from "@/hooks/use-keyboard-inset";

const TABS = [
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

const HIDDEN_PATHS = ["/clients/new"];
const HIDDEN_PATH_SUFFIXES = ["/intake/edit"];

export function BottomNav() {
  const pathname = usePathname();
  const keyboardInset = useKeyboardInset();

  const isHidden =
    HIDDEN_PATHS.some((p) => pathname === p) ||
    HIDDEN_PATH_SUFFIXES.some((s) => pathname.endsWith(s)) ||
    keyboardInset > 0;

  if (isHidden) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-base/95 backdrop-blur supports-[backdrop-filter]:bg-base/80 border-t border-subtle safe-pb">
      <ul className="flex h-14 items-stretch">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 transition-colors",
                  active
                    ? "text-text-primary"
                    : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="text-[11px] font-medium">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
