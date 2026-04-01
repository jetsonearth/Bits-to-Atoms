import Link from "next/link";
import {
  bookTitle,
  bookSubtitle,
  bookTagline,
  parts,
  allChapters,
} from "@/content/book";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="noise-bg flex flex-col items-center justify-center px-6 pt-32 pb-20">
        <div className="max-w-2xl text-center">
          <h1
            className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight mb-5 leading-[1.15]"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          >
            {bookTitle}
          </h1>
          <p
            className="text-lg sm:text-xl text-[var(--text-secondary)] mb-3"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          >
            {bookSubtitle}
          </p>
          <p
            className="text-[15px] text-[var(--text-tertiary)] max-w-md mx-auto mb-10 leading-relaxed"
            style={{
              fontFamily:
                'var(--font-noto-serif-sc), "Noto Serif SC", serif',
            }}
          >
            {bookTagline}
          </p>
          <Link
            href="/chapters/ch01_what_is_a_robot"
            className="inline-flex items-center gap-2 bg-[var(--text-primary)] text-[var(--bg-primary)] px-7 py-3 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors"
          >
            开始阅读
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Chapter count, below CTA */}
        <p className="mt-10 text-xs text-[var(--text-tertiary)] tracking-wider">
          {allChapters.length} 章 &middot; {parts.length} 部分
        </p>
      </header>

      {/* TOC — flat list with part groupings */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        {parts.map((part, partIdx) => (
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
                style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
              >
                {part.title}
              </h2>
              <span className="text-sm text-[var(--text-tertiary)]">
                {part.subtitle}
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
                    {ch.fileTitle}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
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
