import Link from "next/link";
import { getAdjacentChapters, getPartForChapter } from "@/content/book";

export function ChapterNav({ slug }: { slug: string }) {
  const { prev, next } = getAdjacentChapters(slug);

  return (
    <nav className="flex justify-between items-stretch gap-4 mt-16 pt-8 border-t border-[var(--border-primary)]">
      {prev ? (
        <Link
          href={`/chapters/${prev.slug}`}
          className="group flex-1 flex flex-col items-start p-4 rounded-lg border border-[var(--border-secondary)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors"
        >
          <span className="text-xs text-[var(--text-tertiary)] mb-1">
            &larr; 上一章
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
            {String(prev.number).padStart(2, "0")}. {prev.fileTitle}
          </span>
          {getPartForChapter(prev.number)?.number !==
            getPartForChapter(
              prev.number + 1
            )?.number && (
            <span className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {getPartForChapter(prev.number)?.title}
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
            下一章 &rarr;
          </span>
          <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--accent)] transition-colors">
            {String(next.number).padStart(2, "0")}. {next.fileTitle}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
