"use client";

import { useState } from "react";

type Props = { articleId: number; saved: boolean };

export function SaveToNotionButton({ articleId, saved: initialSaved }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${articleId}/notion`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "저장하지 못했어요.");
        return;
      }
      setSaved(true);
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  if (saved) {
    return (
      <button
        type="button"
        disabled
        className="h-9 cursor-not-allowed rounded-lg border border-slate-200 px-3 text-sm text-emerald-600 dark:border-slate-700 dark:text-emerald-400"
      >
        저장됨 ✓
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:ring-offset-slate-900 dark:hover:bg-slate-800"
      >
        {loading && (
          <span
            aria-hidden
            className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"
          />
        )}
        {loading ? "저장 중…" : "뉴스 저장"}
      </button>
      {error && (
        <span role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
