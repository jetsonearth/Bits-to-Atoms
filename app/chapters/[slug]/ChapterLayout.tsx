"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

function MenuIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  );
}

export function ChapterLayout({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { locale } = useLocale();
  const s = t(locale);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeSlug={slug}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 min-w-0 bg-[var(--bg-content)]">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 lg:hidden bg-[var(--bg-primary)]/80 backdrop-blur-sm border-b border-[var(--border-secondary)] px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <MenuIcon />
            <span>{s.toc}</span>
          </button>
        </div>

        <div className="px-6 py-10 lg:px-12 lg:py-16">{children}</div>
      </main>
    </div>
  );
}
