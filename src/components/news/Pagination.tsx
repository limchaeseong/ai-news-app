import Link from "next/link";

type Props = {
  page: number;
  totalPages: number;
  // 페이지 번호를 받아 이동할 주소를 만든다 (카테고리 필터 유지용).
  hrefFor: (page: number) => string;
};

const SIBLINGS = 2; // 현재 페이지 앞뒤로 보여줄 번호 수

const base =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:ring-offset-slate-950";
const idle =
  "border-slate-200 bg-white text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800";
const active =
  "border-transparent bg-blue-600 font-medium text-white dark:bg-blue-500";
const disabled =
  "cursor-not-allowed border-slate-200 text-slate-400 opacity-50 dark:border-slate-800 dark:text-slate-500";

export function Pagination({ page, totalPages, hrefFor }: Props) {
  if (totalPages <= 1) return null;

  // 항상 1과 마지막 페이지를 보이고, 현재 페이지 앞뒤 2개씩을 보인다.
  // 가운데 구간이 1 또는 마지막 페이지와 이어지지 않는 쪽에만 "..."를 넣는다.
  const start = Math.max(2, page - SIBLINGS);
  const end = Math.min(totalPages - 1, page + SIBLINGS);
  const items: (number | "start-ellipsis" | "end-ellipsis")[] = [1];
  if (start > 2) items.push("start-ellipsis");
  for (let p = start; p <= end; p++) items.push(p);
  if (end < totalPages - 1) items.push("end-ellipsis");
  items.push(totalPages);

  return (
    <nav
      aria-label="페이지"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <NavButton label="처음" target={1} enabled={page > 1} hrefFor={hrefFor} />
      <NavButton
        label="이전"
        target={page - 1}
        enabled={page > 1}
        hrefFor={hrefFor}
      />
      {items.map((item) =>
        typeof item === "number" ? (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            className={`${base} ${item === page ? active : idle}`}
          >
            {item}
          </Link>
        ) : (
          <span
            key={item}
            aria-hidden
            className="inline-flex h-9 items-center px-1 text-sm text-slate-400 dark:text-slate-500"
          >
            ...
          </span>
        ),
      )}
      <NavButton
        label="다음"
        target={page + 1}
        enabled={page < totalPages}
        hrefFor={hrefFor}
      />
      <NavButton
        label="끝"
        target={totalPages}
        enabled={page < totalPages}
        hrefFor={hrefFor}
      />
    </nav>
  );
}

function NavButton({
  label,
  target,
  enabled,
  hrefFor,
}: {
  label: string;
  target: number;
  enabled: boolean;
  hrefFor: (page: number) => string;
}) {
  return enabled ? (
    <Link href={hrefFor(target)} className={`${base} ${idle}`}>
      {label}
    </Link>
  ) : (
    <span aria-disabled className={`${base} ${disabled}`}>
      {label}
    </span>
  );
}
