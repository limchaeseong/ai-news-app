export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 sm:px-6"
    >
      <div className="mt-8 h-8 w-2/3 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="h-52 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
          />
        ))}
      </div>
    </main>
  );
}
