import Link from "next/link";
import {
  bookTitle,
  bookSubtitle,
  bookTagline,
  parts,
} from "@/content/book";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero with subtle texture */}
      <header className="noise-bg border-b border-[var(--border-secondary)] bg-[var(--bg-secondary)]">
        <div className="relative max-w-3xl mx-auto px-6 pt-28 pb-20 text-center">
          {/* Subtle chapter count badge */}
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-tertiary)] border border-[var(--border-primary)] rounded-full px-3 py-1 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-tertiary)]" />
            26 chapters &middot; 9 parts
          </p>

          <h1
            className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight mb-5 text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          >
            {bookTitle}
          </h1>
          <p
            className="text-lg sm:text-xl text-[var(--text-secondary)] mb-4"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          >
            {bookSubtitle}
          </p>
          <p
            className="text-base text-[var(--text-tertiary)] max-w-lg mx-auto mb-12 leading-relaxed"
            style={{
              fontFamily:
                'var(--font-noto-serif-sc), "Noto Serif SC", serif',
            }}
          >
            {bookTagline}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/chapters/ch01_what_is_a_robot"
              className="inline-flex items-center gap-2 bg-[var(--text-primary)] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-neutral-700 transition-colors"
            >
              开始阅读
              <span>&rarr;</span>
            </Link>
            <Link
              href="#toc"
              className="inline-flex items-center gap-2 border border-[var(--border-primary)] px-6 py-3 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
            >
              浏览目录
            </Link>
          </div>
        </div>
      </header>

      {/* TOC Overview */}
      <section id="toc" className="max-w-5xl mx-auto px-6 py-20">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-px flex-1 bg-[var(--border-primary)]" />
          <h2
            className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-[0.15em] shrink-0"
            style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
          >
            目录
          </h2>
          <div className="h-px flex-1 bg-[var(--border-primary)]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {parts.map((part) => (
            <div
              key={part.number}
              className="group relative border border-[var(--border-primary)] rounded-xl p-6 transition-all duration-200 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:border-[var(--text-tertiary)]"
            >
              {/* Part number - large faint background */}
              <span className="absolute top-3 right-4 text-5xl font-bold text-[var(--bg-tertiary)] select-none pointer-events-none transition-colors duration-200 group-hover:text-[var(--border-primary)]">
                {part.number}
              </span>

              <div className="relative">
                <p className="text-[10px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-2">
                  Part {part.number} &middot; {part.chapters.length} 章
                </p>
                <h3
                  className="text-lg font-semibold mb-0.5 transition-colors"
                  style={{
                    fontFamily: "var(--font-inter), Inter, sans-serif",
                  }}
                >
                  {part.title}
                </h3>
                <p className="text-sm text-[var(--text-tertiary)] mb-5">
                  {part.subtitle}
                </p>

                <ul className="space-y-1.5 border-t border-[var(--border-secondary)] pt-4">
                  {part.chapters.map((ch) => (
                    <li key={ch.slug}>
                      <Link
                        href={`/chapters/${ch.slug}`}
                        className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-0.5 group/link"
                      >
                        <span className="text-[11px] font-mono text-[var(--text-tertiary)] w-5 shrink-0 group-hover/link:text-[var(--text-secondary)]">
                          {String(ch.number).padStart(2, "0")}
                        </span>
                        {ch.fileTitle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="noise-bg bg-[var(--bg-secondary)] border-t border-[var(--border-secondary)]">
        <div className="relative max-w-3xl mx-auto px-6 py-10 text-center">
          <p className="text-sm text-[var(--text-tertiary)]">
            By Jetson &middot; Dimensional
          </p>
        </div>
      </footer>
    </div>
  );
}
