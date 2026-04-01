"use client";

import { useState } from "react";
import Link from "next/link";
import { parts, type Part } from "@/content/book";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

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
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-md hover:bg-[var(--bg-tertiary)]"
      >
        <ChevronIcon open={open} />
        <span className="text-xs font-semibold text-[var(--text-tertiary)] mr-1">
          {String(part.number).padStart(2, "0")}
        </span>
        {part.title}
      </button>
      {open && (
        <div className="ml-4 pl-3 border-l border-[var(--border-secondary)]">
          {part.chapters.map((ch) => {
            const isActive = ch.slug === activeSlug;
            return (
              <Link
                key={ch.slug}
                href={`/chapters/${ch.slug}`}
                className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isActive
                    ? "bg-[var(--accent-subtle)] text-[var(--accent)] font-medium"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
                }`}
              >
                <span className="text-xs text-[var(--text-tertiary)] mr-1.5">
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
        className={`fixed top-0 left-0 h-full w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)] z-50 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--border-secondary)] px-4 py-4">
          <Link
            href="/"
            className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
          >
            从代码到现实世界
          </Link>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            AI 开发者的机器人全栈指南
          </p>
        </div>

        {/* Navigation */}
        <nav className="p-3">
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
