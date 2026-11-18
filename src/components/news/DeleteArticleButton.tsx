"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { articleId: number };

export function DeleteArticleButton({ articleId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/news/${articleId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "삭제하지 못했어요.");
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label="뉴스 삭제"
        title="삭제"
        className="inline-flex size-7 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-red-400"
      >
        {loading ? (
          <span
            aria-hidden
            className="size-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-red-500"
          />
        ) : (
          <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        )}
      </button>
      {error && (
        <span role="alert" className="rounded bg-white px-1 text-xs text-red-600 dark:bg-slate-900 dark:text-red-400">
          {error}
        </span>
      )}
    </div>
  );
}
