import type { Article } from "@/db/schema";
import { DeleteArticleButton } from "./DeleteArticleButton";
import { SaveToNotionButton } from "./SaveToNotionButton";

const dateFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Seoul" });

type Props = {
  article: Article;
  categoryName: string | null;
};

export function ArticleCard({ article, categoryName }: Props) {
  const date = article.publishedAt ?? article.fetchedAt;

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:border-blue-200 hover:shadow-md focus-within:border-blue-300 motion-safe:hover:-translate-y-0.5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:focus-within:border-slate-600">
      {/* 호버·포커스 시 왼쪽에 자라나는 파란 막대: 카드가 반응하고 있음을 알려 준다 */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-6 bottom-6 -left-px w-[3px] origin-center scale-y-0 rounded-r-full bg-blue-600 transition-transform duration-200 group-focus-within:scale-y-100 group-hover:scale-y-100 dark:bg-blue-500"
      />

      <div className="flex items-center justify-between gap-3 pr-8">
        <span
          className={
            categoryName
              ? "shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : "shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          }
        >
          {categoryName ?? "미분류"}
        </span>
        <p className="min-w-0 truncate text-xs text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {article.sourceName}
          </span>
          <span
            aria-hidden
            className="mx-1.5 text-slate-300 dark:text-slate-600"
          >
            |
          </span>
          <time dateTime={date.toISOString()} className="tabular-nums">
            {dateFormat.format(date)}
          </time>
        </p>
      </div>

      <h2 className="mt-4 line-clamp-2 text-lg leading-snug font-semibold tracking-tight break-keep text-slate-900 transition-colors group-hover:text-blue-700 dark:text-slate-100 dark:group-hover:text-blue-300">
        {article.titleKo}
      </h2>
      <p className="mt-2.5 line-clamp-4 text-[15px] leading-7 break-keep text-slate-700 dark:text-slate-300">
        {article.summaryKo}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link inline-flex items-center gap-1 rounded text-sm font-medium text-blue-600 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:text-blue-400 dark:ring-offset-slate-900"
        >
          원문 보기
          <span
            aria-hidden
            className="inline-block transition-transform motion-safe:group-hover/link:translate-x-0.5 motion-safe:group-hover/link:-translate-y-0.5"
          >
            ↗
          </span>
        </a>
        <SaveToNotionButton
          articleId={article.id}
          saved={article.notionPageId !== null}
        />
      </div>
      <DeleteArticleButton articleId={article.id} />
    </article>
  );
}
