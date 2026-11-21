const bar = "animate-pulse rounded-full bg-slate-200 dark:bg-slate-800";

export function ArticleCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between gap-3">
        <div className={`h-5 w-16 ${bar}`} />
        <div className={`h-4 w-28 ${bar}`} />
      </div>
      <div className={`mt-4 h-5 w-4/5 ${bar}`} />
      <div className={`mt-4 h-3.5 w-full ${bar}`} />
      <div className={`mt-2 h-3.5 w-full ${bar}`} />
      <div className={`mt-2 h-3.5 w-2/3 ${bar}`} />
      <div className="mt-auto flex items-center justify-between">
        <div className={`h-4 w-20 ${bar}`} />
        <div className={`h-7 w-24 ${bar}`} />
      </div>
    </div>
  );
}
