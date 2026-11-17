import Link from "next/link";

type Props = {
  query: string;
  // 검색 시 유지할 카테고리 필터 (undefined: 전체)
  category: string | undefined;
};

// JS 없이도 동작하는 GET 폼: 검색 버튼 클릭과 Enter 키 모두 /dashboard?q=... 로 이동한다.
// 새 검색은 항상 1페이지부터 시작하므로 page 값은 보내지 않는다.
export function SearchForm({ query, category }: Props) {
  return (
    <form
      action="/dashboard"
      method="get"
      role="search"
      className="flex items-center gap-2"
    >
      {category !== undefined && (
        <input type="hidden" name="category" value={category} />
      )}
      <input
        type="search"
        name="q"
        defaultValue={query}
        maxLength={100}
        placeholder="키워드로 뉴스 검색"
        aria-label="키워드 검색"
        className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <button
        type="submit"
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-blue-500 dark:ring-offset-slate-950 dark:hover:bg-blue-400"
      >
        검색
      </button>
      {query && (
        <Link
          href={
            category !== undefined
              ? `/dashboard?category=${category}`
              : "/dashboard"
          }
          className="inline-flex h-10 shrink-0 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
