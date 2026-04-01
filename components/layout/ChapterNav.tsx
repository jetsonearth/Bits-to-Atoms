import Link from "next/link";
import { getAdjacentChapters, getPartForChapter } from "@/content/book";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";

export async function ChapterNav({ slug }: { slug: string }) {
  const { prev, next } = getAdjacentChapters(slug);
  const locale = await getServerLocale();
  const s = t(locale);

  return (
    <nav className="flex justify-between items-stretch gap-4 mt-16 pt-8 border-t border-[var(--border-primary)]">
      {prev ? (
        <Link
          href={`/chapters/${prev.slug}`}
          className="group flex-1 flex flex-col items-start p-4 rounded-lg border border-[var(--border-secondary)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors"
        >
          <span className="text-xs text-[var(--text-tertiary)] mb-1">
            &larr; {s.prevChapter}
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
            {String(prev.number).padStart(2, "0")}. {s.chapterTitles[prev.number - 1] ?? prev.fileTitle}
          </span>
          {getPartForChapter(prev.number)?.number !==
            getPartForChapter(
              prev.number + 1
            )?.number && (
            <span className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {s.parts[(getPartForChapter(prev.number)?.number ?? 1) - 1]?.title}
            </span>
          )}
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Link
          href={`/chapters/${next.slug}`}
          className="group flex-1 flex flex-col items-end p-4 rounded-lg border border-[var(--border-secondary)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors text-right"
        >
          <span className="text-xs text-[var(--text-tertiary)] mb-1">
            {s.nextChapter} &rarr;
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
            {String(next.number).padStart(2, "0")}. {s.chapterTitles[next.number - 1] ?? next.fileTitle}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
