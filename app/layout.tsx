import type { Metadata } from "next";
import {
  inter,
  notoSerifSC,
  geistMono,
  instrumentSerif,
} from "@/lib/fonts";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { LocaleProvider } from "@/components/LocaleProvider";
import { getServerLocale } from "@/lib/locale-server";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "从代码到现实世界 - AI 开发者的机器人全栈指南",
    template: "%s - 从代码到现实世界",
  },
  description:
    "写给每一个写过 Python、训过模型、但从没让一台机器在真实世界里动起来的人。",
  metadataBase: new URL("https://robotics-guide.vercel.app"),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();

  return (
    <html
      lang={locale === "en" ? "en" : "zh-CN"}
      className={`${inter.variable} ${notoSerifSC.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme'),d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-full bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased transition-colors duration-300">
        <div className="paper-texture" aria-hidden="true" />
        <LocaleProvider initial={locale}>
          <div className="relative z-[1]">{children}</div>
          <LanguageToggle />
          <ThemeToggle />
        </LocaleProvider>
      </body>
    </html>
  );
}
