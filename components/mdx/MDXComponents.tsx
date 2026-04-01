import type { MDXComponents } from "mdx/types";
import { ComponentPropsWithoutRef, ReactNode } from "react";
import type { Locale } from "@/lib/i18n";

function Table({ children }: { children: ReactNode }) {
  return (
    <div className="table-wrapper">
      <table>{children}</table>
    </div>
  );
}

function H2En(props: ComponentPropsWithoutRef<"h2">) {
  return (
    <h2
      {...props}
      style={{
        ...props.style,
        fontFamily: 'var(--font-instrument-serif), "Instrument Serif", serif',
        fontWeight: 400,
      }}
    />
  );
}

export function getMDXComponents(locale: Locale): MDXComponents {
  return {
    table: Table as unknown as MDXComponents["table"],
    ...(locale === "en" ? { h2: H2En as MDXComponents["h2"] } : {}),
  };
}
