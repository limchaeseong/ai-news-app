import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
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
  title: "AI News Collector",
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
              <header className="flex justify-end p-4">
                <UserButton />
              </header>
            </Show>
          </Suspense>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
