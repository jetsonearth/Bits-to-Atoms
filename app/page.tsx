import Link from "next/link";
import {
  parts,
  allChapters,
} from "@/content/book";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const locale = await getServerLocale();
  const s = t(locale);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="noise-bg flex flex-col items-center justify-center px-6 pt-40 pb-12">
        <div className="max-w-2xl text-center">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
            style={{
              fontFamily:
                locale === "en"
                  ? 'var(--font-instrument-serif), "Instrument Serif", serif'
                  : "var(--font-inter), Inter, sans-serif",
              fontWeight: locale === "en" ? 400 : 700,
            }}
          >
            {s.bookTitle}
          </h1>
          <p
            className="text-xl sm:text-2xl text-[var(--text-secondary)] mb-4"
            style={{
              fontFamily:
                locale === "en"
                  ? 'var(--font-instrument-serif), "Instrument Serif", serif'
                  : "var(--font-inter), Inter, sans-serif",
            }}
          >
            {s.bookSubtitle}
          </p>
          <p
            className="text-base sm:text-lg text-[var(--text-secondary)] max-w-lg mx-auto mb-10 leading-relaxed"
            style={{
              fontFamily:
                locale === "en"
                  ? 'var(--font-inter), Inter, sans-serif'
                  : 'var(--font-noto-serif-sc), "Noto Serif SC", serif',
            }}
          >
            {s.bookTagline}
          </p>
          <Link
            href="/chapters/ch01_what_is_a_robot"
            className="inline-flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-7 py-3 rounded-lg text-sm font-medium hover:opacity-80 transition-all"
          >
            {s.startReading}
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Chapter count */}
        <p className="mt-8 text-xs text-[var(--text-tertiary)] tracking-wider">
          {allChapters.length} {s.chapters} &middot; {parts.length} {s.partsLabel}
        </p>
      </header>

      {/* TOC — flat list with part groupings */}
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-20">
        {parts.map((part, partIdx) => {
          const partStrings = s.parts[part.number - 1];
          return (
            <div
              key={part.number}
              className={partIdx > 0 ? "mt-12" : ""}
            >
              {/* Part header */}
              <div className="flex items-baseline gap-3 mb-4">
                <span
                  className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest shrink-0"
                  style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
                >
                  Part {part.number}
                </span>
                <h2
                  className="text-xl font-semibold"
                  style={{
                    fontFamily:
                      locale === "en"
                        ? 'var(--font-instrument-serif), "Instrument Serif", serif'
                        : "var(--font-inter), Inter, sans-serif",
                    fontWeight: locale === "en" ? 400 : 600,
                  }}
                >
                  {partStrings.title}
                </h2>
                <span className="text-sm text-[var(--text-tertiary)]">
                  {partStrings.subtitle}
                </span>
              </div>

              {/* Chapter list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 pl-0 sm:pl-14">
                {part.chapters.map((ch) => (
                  <Link
                    key={ch.slug}
                    href={`/chapters/${ch.slug}`}
                    className="group flex items-baseline gap-3 py-2 border-b border-[var(--border-secondary)] hover:border-[var(--text-tertiary)] transition-colors"
                  >
                    <span className="text-xs font-mono text-[var(--text-tertiary)] shrink-0 group-hover:text-[var(--text-secondary)] transition-colors">
                      {String(ch.number).padStart(2, "0")}
                    </span>
                    <span className="text-[15px] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                      {s.chapterTitles[ch.number - 1] ?? ch.fileTitle}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-secondary)]">
        <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
          <p className="text-xs text-[var(--text-tertiary)]">
            By Jetson
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Dimensional
          </p>
        </div>
      </footer>
    </div>
  );
}
