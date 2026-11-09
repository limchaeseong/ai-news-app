import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { FetchNewsButton } from "@/components/news/FetchNewsButton";
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
      >
        <body className="min-h-full flex flex-col">
          <Suspense fallback={null}>
            <Show when="signed-in">
              <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  AI 뉴스 수집기
                </span>
                <div className="flex items-center gap-3">
                  <FetchNewsButton />
                  <UserButton />
                </div>
              </header>
            </Show>
          </Suspense>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
