"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Result = { tone: "info" | "warn" | "error"; text: string };

export function FetchNewsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setResult({
          tone: "error",
          text: data?.error?.message ?? "뉴스를 가져오지 못했어요.",
        });
        return;
      }
      const failed: string[] = data.failedSources ?? [];
      const aiFailed: number = data.failed ?? 0;
      setResult({
        tone: failed.length > 0 || aiFailed > 0 ? "warn" : "info",
        text:
          `${data.added}건 추가, ${data.skipped}건 중복` +
          (aiFailed > 0 ? ` · ${aiFailed}건 처리 실패(다음에 재시도)` : "") +
          (failed.length > 0 ? ` · 실패: ${failed.join(", ")}` : ""),
      });
      router.refresh();
    } catch {
      setResult({ tone: "error", text: "네트워크 오류가 발생했어요." });
    } finally {
      setLoading(false);
    }
  }

  const toneClass = {
    info: "text-slate-600 dark:text-slate-300",
    warn: "text-amber-600 dark:text-amber-400",
    error: "text-red-600 dark:text-red-400",
  };

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span role="status" className={`hidden text-sm sm:inline ${toneClass[result.tone]}`}>
          {result.text}
        </span>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
      >
        {loading && (
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
        )}
        {loading ? "가져오는 중…" : "뉴스 가져오기"}
      </button>
    </div>
  );
}
