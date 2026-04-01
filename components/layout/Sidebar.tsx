"use client";

import { useState } from "react";
import Link from "next/link";
import { parts, type Part } from "@/content/book";

function PartSection({
  part,
  activeSlug,
  defaultOpen,
}: {
  part: Part;
  activeSlug: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-1.5 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-mono text-[10px] opacity-50">
          {String(part.number).padStart(2, "0")}
        </span>
        <span className="font-medium text-[var(--text-secondary)]">
          {part.title}
        </span>
      </button>
      {open && (
        <div className="ml-3 mt-0.5 space-y-px">
          {part.chapters.map((ch) => {
            const isActive = ch.slug === activeSlug;
            return (
              <Link
                key={ch.slug}
                href={`/chapters/${ch.slug}`}
                className={`flex items-center gap-2 px-2 py-1.5 text-[13px] rounded transition-colors ${
                  isActive
                    ? "text-[var(--text-primary)] font-medium bg-[var(--bg-tertiary)]"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                <span className="font-mono text-[10px] w-4 shrink-0 opacity-40">
                  {String(ch.number).padStart(2, "0")}
                </span>
                {ch.fileTitle}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  activeSlug,
  isOpen,
  onClose,
}: {
  activeSlug: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const activePartNumber =
    parts.find((p) => p.chapters.some((c) => c.slug === activeSlug))?.number ?? 1;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[var(--bg-primary)] border-r border-[var(--border-secondary)] z-50 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto lg:min-h-screen ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--text-primary)] hover:opacity-70 transition-opacity"
          >
            从代码到现实世界
          </Link>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
            AI 开发者的机器人全栈指南
          </p>
        </div>

        {/* Subtle divider */}
        <div className="mx-5 mb-4 border-t border-[var(--border-secondary)]" />

        {/* Navigation */}
        <nav className="px-5 pb-8">
          {parts.map((part) => (
            <PartSection
              key={part.number}
              part={part}
              activeSlug={activeSlug}
              defaultOpen={part.number === activePartNumber}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}
