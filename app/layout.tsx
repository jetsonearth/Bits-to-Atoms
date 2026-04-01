import type { Metadata } from "next";
import { inter, notoSerifSC, geistMono } from "@/lib/fonts";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${notoSerifSC.variable} ${geistMono.variable} h-full`}
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
        <div className="relative z-[1]">{children}</div>
        <ThemeToggle />
      </body>
    </html>
  );
}
