import type { MDXComponents } from "mdx/types";
import { ReactNode } from "react";

function Table({ children }: { children: ReactNode }) {
  return (
    <div className="table-wrapper">
      <table>{children}</table>
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  table: Table as unknown as MDXComponents["table"],
  // Headings get IDs from rehype-slug, no custom override needed
  // Code blocks get highlighting from rehype-pretty-code
};
