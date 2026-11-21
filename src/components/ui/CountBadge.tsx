export function CountBadge({ count }: { count: number }) {
  return (
    <span
      className="inline-flex h-8 items-center rounded-full bg-blue-50 px-3 text-sm font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300"
      aria-label={`수집된 뉴스 총 ${count}개`}
    >
      총 {count.toLocaleString("ko-KR")}개의 뉴스
    </span>
  );
}
