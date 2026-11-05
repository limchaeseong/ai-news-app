import Link from "next/link";
import type { Category } from "@/db/schema";

export const UNCATEGORIZED = "uncategorized";

type Props = {
  categories: Category[];
  counts: Map<number | null, number>;
  total: number;
  // undefined: 전체, UNCATEGORIZED: 미분류, 그 외: 카테고리 id 문자열
  selected: string | undefined;
};

const chipBase =
  "inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none dark:ring-offset-slate-950";
const chipIdle =
  "border-slate-200 bg-white text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800";
const chipActive =
  "border-transparent bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400";

function Chip({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${chipBase} ${active ? chipActive : chipIdle}`}
    >
      {label}
      <span className="text-xs opacity-70">{count}</span>
    </Link>
  );
}

export function CategoryBar({ categories, counts, total, selected }: Props) {
  return (
    <nav aria-label="카테고리" className="flex flex-wrap items-center gap-2">
      <Chip
        href="/dashboard"
        label="전체"
        count={total}
        active={selected === undefined}
      />
      {categories.map((c) => (
        <Chip
          key={c.id}
          href={`/dashboard?category=${c.id}`}
          label={c.name}
          count={counts.get(c.id) ?? 0}
          active={selected === String(c.id)}
        />
      ))}
      <Chip
        href={`/dashboard?category=${UNCATEGORIZED}`}
        label="미분류"
        count={counts.get(null) ?? 0}
        active={selected === UNCATEGORIZED}
      />
      {/* 카테고리 추가 폼/API(구현 순서 3단계) 전까지는 비활성화 */}
      <button
        type="button"
        disabled
        aria-label="카테고리 추가"
        className="h-8 rounded-full border border-dashed border-blue-300 px-3 text-sm text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
      >
        + 카테고리 추가
      </button>
    </nav>
  );
}
