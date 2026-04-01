import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getChapterContent,
  getChapterTitle,
  getAllChapterSlugs,
} from "@/lib/chapters";
import { renderMarkdown } from "@/lib/markdown";
import { allChapters, getPartForChapter } from "@/content/book";
import { ChapterNav } from "@/components/layout/ChapterNav";
import { PageTOC } from "@/components/layout/PageTOC";
import { ChapterLayout } from "./ChapterLayout";

export async function generateStaticParams() {
  return getAllChapterSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const chapter = allChapters.find((c) => c.slug === slug);
  if (!chapter) return {};

  const content = getChapterContent(slug);
  const title = getChapterTitle(content);
  const part = getPartForChapter(chapter.number);

  return {
    title: `第 ${chapter.number} 章：${chapter.fileTitle}`,
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

  const rawContent = getChapterContent(slug);
  const chapter = allChapters.find((c) => c.slug === slug)!;
  const part = getPartForChapter(chapter.number)!;
  const renderedContent = await renderMarkdown(rawContent);

  return (
    <ChapterLayout slug={slug}>
      <div className="flex gap-10 max-w-5xl mx-auto">
        {/* Main content */}
        <article className="flex-1 min-w-0 max-w-[720px]">
          {/* Chapter header */}
          <div className="mb-8 pb-6 border-b border-[var(--border-secondary)]">
            <p className="text-sm text-[var(--accent)] font-medium mb-2">
              第 {part.number} 部分：{part.title} &middot; {part.subtitle}
            </p>
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-inter), Inter, sans-serif" }}
            >
              第 {chapter.number} 章
            </h1>
          </div>

          {/* Rendered markdown */}
          <div className="chapter-content">{renderedContent}</div>

          {/* Prev/Next navigation */}
          <ChapterNav slug={slug} />
        </article>

        {/* Right-rail TOC */}
        <PageTOC />
      </div>
    </ChapterLayout>
  );
}
