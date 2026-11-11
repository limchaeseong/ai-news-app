"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

export function AddCategoryButton() {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function open() {
    setName("");
    setDescription("");
    setError(null);
    dialogRef.current?.showModal();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.message ?? "카테고리를 추가하지 못했어요.");
        return;
      }
      dialogRef.current?.close();
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="카테고리 추가"
        className="h-8 rounded-full border border-dashed border-blue-300 px-3 text-sm text-blue-700 hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950 dark:ring-offset-slate-950"
      >
        + 카테고리 추가
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="add-category-title"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-900/40 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        onClick={(e) => {
          // 바깥(backdrop) 클릭 시 닫기
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <h2 id="add-category-title" className="text-lg font-semibold">
            카테고리 추가
          </h2>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            이름
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              required
              autoFocus
              placeholder="예: 로보틱스"
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            설명 <span className="font-normal text-slate-500">(Claude가 분류할 때 참고해요)</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={3}
              placeholder="예: 로봇, 자율주행 등 피지컬 AI 관련 소식"
              className={inputClass}
            />
          </label>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            추가 후 수집하는 뉴스부터 적용돼요. 기존 기사는 다시 분류하지 않아요.
          </p>

          {error && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="h-9 rounded-lg px-4 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || name.trim() === ""}
              className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {saving ? "저장 중…" : "저장"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
