"use client";

import Link from "next/link";
import { parts, type Part } from "@/content/book";
import { useLocale } from "@/components/LocaleProvider";
import { t } from "@/lib/i18n";

function PartSection({
  part,
  activeSlug,
}: {
  part: Part;
  activeSlug: string;
}) {
  const { locale } = useLocale();
  const s = t(locale);
  const hasActive = part.chapters.some((c) => c.slug === activeSlug);
  const partStrings = s.parts[part.number - 1];

  return (
    <div className="relative mt-7 first:mt-0">
      {/* Part label */}
      <p className="text-xs font-medium text-[var(--text-tertiary)] mb-3">
        <span className="font-mono text-[10px] opacity-40 mr-1.5">
          {String(part.number).padStart(2, "0")}
        </span>
        {partStrings.title}
      </p>

      {/* Chapter links with left indicator rail */}
      <div className="relative">
        {/* Rail line - only show for active part */}
        {hasActive && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--border-primary)]" />
        )}

        {part.chapters.map((ch) => {
          const isActive = ch.slug === activeSlug;
          const chapterTitle = s.chapterTitles[ch.number - 1] ?? ch.fileTitle;
          return (
            <Link
              key={ch.slug}
              href={`/chapters/${ch.slug}`}
              className={`relative block pl-4 py-[5px] text-[13px] leading-snug transition-colors ${
                isActive
                  ? "text-[var(--text-primary)] font-medium"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {/* Active indicator dot */}
              {isActive && (
                <span className="absolute left-[-2.5px] top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-[var(--text-primary)]" />
              )}
              {chapterTitle}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Sidebar({
  activeSlug,
  isOpen,
  onClose,
}: {
  activeSlug: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { locale } = useLocale();
  const s = t(locale);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[var(--bg-primary)] border-r border-[var(--border-secondary)] z-50 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:sticky lg:z-auto lg:h-screen lg:top-0 lg:shrink-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-7 pb-5">
          <Link
            href="/"
            className="block text-base font-semibold text-[var(--text-primary)] hover:opacity-70 transition-opacity leading-tight"
          >
            {s.bookTitle}
          </Link>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-1.5 leading-relaxed">
            {s.bookSubtitle}
          </p>
        </div>

        {/* Navigation */}
        <nav className="px-6 pb-10">
          {parts.map((part) => (
            <PartSection
              key={part.number}
              part={part}
              activeSlug={activeSlug}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
