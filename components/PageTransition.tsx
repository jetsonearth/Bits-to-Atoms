"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "@/components/LocaleProvider";

export function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale } = useLocale();

  return (
    <div key={`${pathname}:${locale}`} className="page-transition">
      {children}
    </div>
  );
}
