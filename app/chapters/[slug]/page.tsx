import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getChapterContent,
  getChapterTitle,
  getAllChapterSlugs,
} from "@/lib/chapters";
import { renderMarkdown } from "@/lib/markdown";
import { allChapters, getPartForChapter } from "@/content/book";
import { getServerLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n";
import { ChapterNav } from "@/components/layout/ChapterNav";
import { PageTOC } from "@/components/layout/PageTOC";
import { ChapterLayout } from "./ChapterLayout";

export async function generateStaticParams() {
  return getAllChapterSlugs().map((slug) => ({ slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = allChapters.find((c) => c.slug === slug);
  if (!chapter) return {};

  const locale = await getServerLocale();
  const s = t(locale);
  const content = getChapterContent(slug, locale);
  const title = getChapterTitle(content);
  const part = getPartForChapter(chapter.number);
  const chapterTitle = s.chapterTitles[chapter.number - 1] ?? chapter.fileTitle;

  return {
    title:
      locale === "en"
        ? `Chapter ${chapter.number}: ${chapterTitle}`
        : `第 ${chapter.number} 章：${chapterTitle}`,
    description: `${part?.title} - ${title}`,
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!allChapters.find((c) => c.slug === slug)) {
    notFound();
  }

  const locale = await getServerLocale();
  const s = t(locale);
  const rawContent = getChapterContent(slug, locale);
  const chapter = allChapters.find((c) => c.slug === slug)!;
  const part = getPartForChapter(chapter.number)!;
  const partStrings = s.parts[part.number - 1];
  const renderedContent = await renderMarkdown(rawContent);

  return (
    <ChapterLayout slug={slug}>
      <div className="flex gap-10 max-w-5xl mx-auto">
        {/* Main content */}
        <article className="flex-1 min-w-0 max-w-[720px]">
          {/* Chapter header */}
          <div className="mb-8 pb-6 border-b border-[var(--border-secondary)]">
            <p className="text-sm text-[var(--accent)] font-medium mb-2">
              {locale === "en"
                ? `Part ${part.number}: ${partStrings.title} · ${partStrings.subtitle}`
                : `第 ${part.number} 部分：${partStrings.title} · ${partStrings.subtitle}`}
            </p>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
            >
              {locale === "en"
                ? `Chapter ${chapter.number}`
                : `第 ${chapter.number} 章`}
            </h1>
          </div>

          {/* Rendered markdown */}
          <div
            className={
              locale === "en"
                ? "chapter-content chapter-content--en"
                : "chapter-content"
            }
          >
            {renderedContent}
          </div>

          {/* Prev/Next navigation */}
          <ChapterNav slug={slug} />
        </article>

        {/* Right-rail TOC */}
        <PageTOC />
      </div>
    </ChapterLayout>
  );
}
