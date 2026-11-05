import type { Article } from "@/db/schema";

const dateFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" });

type Props = {
  article: Article;
  categoryName: string | null;
};

export function ArticleCard({ article, categoryName }: Props) {
  const date = article.publishedAt ?? article.fetchedAt;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-center justify-between gap-3">
        <span
          className={
            categoryName
              ? "rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : "rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }
        >
          {categoryName ?? "미분류"}
        </span>
        <span className="truncate text-xs text-slate-500 dark:text-slate-400">
          {article.sourceName} · {dateFormat.format(date)}
        </span>
      </div>
      <h2 className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-slate-900 dark:text-slate-100">
        {article.titleKo}
      </h2>
      <p className="mt-2 line-clamp-4 text-[15px] leading-7 text-slate-700 dark:text-slate-300">
        {article.summaryKo}
      </p>
      <div className="mt-auto flex items-center justify-between pt-4">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded text-sm font-medium text-blue-600 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-blue-400 dark:ring-offset-slate-900"
        >
          원문 보기 ↗
        </a>
        {/* Notion 저장 연동(구현 순서 6단계) 전까지는 비활성화 */}
        <button
          type="button"
          disabled
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700"
        >
          Notion 저장
        </button>
      </div>
    </article>
  );
}
