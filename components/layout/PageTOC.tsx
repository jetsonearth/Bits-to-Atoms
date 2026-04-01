"use client";

import { useEffect, useState } from "react";

interface DOMHeading {
  id: string;
  text: string;
  level: number;
}

export function PageTOC() {
  const [headings, setHeadings] = useState<DOMHeading[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    // Discover headings from the actual DOM (rehype-slug generated IDs)
    const content = document.querySelector(".chapter-content");
    if (!content) return;

    const elements = content.querySelectorAll("h2[id], h3[id]");
    const found: DOMHeading[] = [];
    elements.forEach((el) => {
      found.push({
        id: el.id,
        text: el.textContent?.trim() || "",
        level: el.tagName === "H3" ? 3 : 2,
      });
    });

    // Skip the first h2 (it's the chapter title)
    const tocHeadings = found.slice(1);
    setHeadings(tocHeadings);

    // Observe all headings for active tracking
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    for (const h of tocHeadings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  if (headings.length < 2) return null;

  return (
    <nav className="hidden xl:block w-52 shrink-0 ml-12">
      <div className="sticky top-8">
        <p className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">
          On this page
        </p>
        <ul className="space-y-2.5">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block text-[13px] leading-snug transition-colors ${
                  h.level === 3 ? "pl-3" : ""
                } ${
                  activeId === h.id
                    ? "text-[var(--accent)] font-medium"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
