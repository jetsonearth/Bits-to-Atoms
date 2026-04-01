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
      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-24 pb-16 text-center">
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
          style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
        >
          {bookTitle}
        </h1>
        <p
          className="text-lg sm:text-xl text-[var(--text-secondary)] mb-6"
          style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
        >
          {bookSubtitle}
        </p>
        <p className="text-base text-[var(--text-tertiary)] max-w-xl mx-auto mb-10 leading-relaxed">
          {bookTagline}
        </p>
        <Link
          href="/chapters/ch01_what_is_a_robot"
          className="inline-flex items-center gap-2 bg-[var(--text-primary)] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[var(--accent)] transition-colors"
        >
          开始阅读
          <span>&rarr;</span>
        </Link>
      </header>

      {/* Divider */}
      <div className="max-w-3xl mx-auto px-6">
        <hr className="border-[var(--border-primary)]" />
      </div>

      {/* TOC Overview */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2
          className="text-sm font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-8 text-center"
          style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
        >
          全书目录 &middot; 9 部分 &middot; 26 章
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parts.map((part) => (
            <div
              key={part.number}
              className="group border border-[var(--border-primary)] rounded-xl p-5 hover:border-[var(--accent)] hover:shadow-sm transition-all"
            >
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-xs font-semibold text-[var(--text-tertiary)]">
                  Part {part.number}
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">
                  &middot; {part.chapters.length} 章
                </span>
              </div>
              <h3
                className="text-lg font-semibold mb-0.5 group-hover:text-[var(--accent)] transition-colors"
                style={{
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                }}
              >
                {part.title}
              </h3>
              <p className="text-sm text-[var(--text-tertiary)] mb-4">
                {part.subtitle}
              </p>

              <ul className="space-y-1">
                {part.chapters.map((ch) => (
                  <li key={ch.slug}>
                    <Link
                      href={`/chapters/${ch.slug}`}
                      className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors py-0.5"
                    >
                      <span className="text-xs text-[var(--text-tertiary)] w-5 shrink-0">
                        {String(ch.number).padStart(2, "0")}
                      </span>
                      {ch.fileTitle}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-3xl mx-auto px-6 py-12 text-center border-t border-[var(--border-secondary)]">
        <p className="text-sm text-[var(--text-tertiary)]">
          By Jetson &middot; Built with DimOS
        </p>
      </footer>
    </div>
  );
}
