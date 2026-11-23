"use client";

// 라이트/다크 모드 전환 버튼. 선택은 localStorage("theme")에 저장하고,
// 저장값이 없으면 OS 설정을 따른다(초기 적용은 layout.tsx의 인라인 스크립트가 한다).
// 아이콘은 CSS(dark:)로 바꿔서 서버/클라이언트 렌더링 결과가 어긋나지 않게 한다.
export function ThemeToggle() {
  function handleClick() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      // 저장소 사용 불가(시크릿 모드 등): 이번 방문에만 적용하고 무시한다
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="라이트/다크 모드 전환"
      title="라이트/다크 모드 전환"
      className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:ring-offset-slate-950 dark:hover:bg-slate-800"
    >
      {/* 라이트 모드일 때: 달(다크로 전환) */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="size-[18px] dark:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      {/* 다크 모드일 때: 해(라이트로 전환) */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="hidden size-[18px] dark:block"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
