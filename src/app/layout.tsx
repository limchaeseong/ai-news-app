import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { FetchNewsButton } from "@/components/news/FetchNewsButton";
import { HeaderNewsCount } from "@/components/news/HeaderNewsCount";
import { Footer } from "@/components/ui/Footer";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 뉴스 수집기",
  description: "해외 AI 뉴스를 한국어 요약 카드로 모아 보는 앱",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider>
      <html
        lang="ko"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          {/* 첫 페인트 전에 저장된(또는 OS) 테마를 적용해 깜빡임을 막는다 */}
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var t=localStorage.getItem("theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`,
            }}
          />
        </head>
        <body className="min-h-full flex flex-col">
          <Suspense fallback={null}>
            <Show when="signed-in">
              <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    AI 뉴스 수집기
                  </span>
                  <Suspense fallback={null}>
                    <HeaderNewsCount />
                  </Suspense>
                </div>
                <div className="flex items-center gap-3">
                  <FetchNewsButton />
                  <ThemeToggle />
                  <UserButton />
                </div>
              </header>
            </Show>
          </Suspense>
          {children}
          <Suspense fallback={null}>
            <Show when="signed-in">
              <Footer />
            </Show>
          </Suspense>
        </body>
      </html>
    </ClerkProvider>
  );
}
