import fs from "fs";
import path from "path";
import { allChapters } from "@/content/book";
import type { Locale } from "./i18n";

const chaptersDir = path.join(process.cwd(), "content", "chapters");

export function getChapterContent(slug: string, locale: Locale = "zh"): string {
  if (locale === "en") {
    const enPath = path.join(chaptersDir, `${slug}.en.md`);
    if (fs.existsSync(enPath)) {
      return fs.readFileSync(enPath, "utf-8");
    }
  }
  // Fallback to Chinese
  const filePath = path.join(chaptersDir, `${slug}.md`);
  return fs.readFileSync(filePath, "utf-8");
}

export function getChapterTitle(content: string): string {
  // Extract title from first ## heading
  const match = content.match(/^##\s+(.+)$/m);
  return match ? match[1] : "Untitled";
}

export interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

export function extractTOCHeadings(content: string): TOCHeading[] {
  const headings: TOCHeading[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match = line.match(/^(#{2,3})\s+(.+)$/);
    if (match) {
      const text = match[2];
      const id = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fff\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      headings.push({
        id,
        text,
        level: match[1].length,
      });
    }
  }

  return headings;
}

export function getAllChapterSlugs(): string[] {
  return allChapters.map((c) => c.slug);
}
