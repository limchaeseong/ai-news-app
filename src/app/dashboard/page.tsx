import { auth } from "@clerk/nextjs/server";
import { and, asc, count, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  CategoryBar,
  UNCATEGORIZED,
} from "@/components/categories/CategoryBar";
import { ArticleCard } from "@/components/news/ArticleCard";
import { Pagination } from "@/components/news/Pagination";
import { SearchForm } from "@/components/news/SearchForm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

const PAGE_SIZE = 9;

export const metadata = { title: "대시보드 | AI 뉴스 수집기" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // 알 수 없는 값은 "전체"로 취급한다.
  const raw = (await searchParams).category;
  const param = typeof raw === "string" ? raw : undefined;
  const selected =
    param === UNCATEGORIZED || (param !== undefined && /^\d+$/.test(param))
      ? param
      : undefined;

  const categoryFilter =
    selected === undefined
      ? undefined
      : selected === UNCATEGORIZED
        ? isNull(articles.categoryId)
        : eq(articles.categoryId, Number(selected));

  // 검색어: 앞뒤 공백 제거, 최대 100자. LIKE 와일드카드(%, _, \)는 이스케이프한다.
  const rawQ = (await searchParams).q;
  const q = (typeof rawQ === "string" ? rawQ.trim() : "").slice(0, 100);
  const pattern = `%${q.replace(/[\\%_]/g, "\\$&")}%`;
  const searchFilter = q
    ? or(
        ilike(articles.titleKo, pattern),
        ilike(articles.originalTitle, pattern),
        ilike(articles.summaryKo, pattern),
      )
    : undefined;

  const [categoryList, countRows] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.createdAt), asc(categories.id)),
    db
      .select({ categoryId: articles.categoryId, n: count() })
      .from(articles)
      .where(eq(articles.userId, userId))
      .groupBy(articles.categoryId),
  ]);

  const counts = new Map(countRows.map((r) => [r.categoryId, r.n]));
  const total = countRows.reduce((sum, r) => sum + r.n, 0);

  // 현재 필터(카테고리 + 검색어)에 해당하는 기사 수로 전체 페이지 수를 구하고,
  // 범위를 벗어난 page는 보정한다.
  const [{ n: filteredTotal }] = await db
    .select({ n: count() })
    .from(articles)
    .where(and(eq(articles.userId, userId), categoryFilter, searchFilter));
  const totalPages = Math.max(1, Math.ceil(filteredTotal / PAGE_SIZE));
  const rawPage = (await searchParams).page;
  const requested =
    typeof rawPage === "string" && /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const page = Math.min(Math.max(requested, 1), totalPages);

  const articleList = await db
    .select()
    .from(articles)
    .where(and(eq(articles.userId, userId), categoryFilter, searchFilter))
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
      desc(articles.id),
    )
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  const hrefFor = (p: number) => {
    const query = new URLSearchParams();
    if (selected !== undefined) query.set("category", selected);
    if (q) query.set("q", q);
    if (p > 1) query.set("page", String(p));
    const qs = query.toString();
    return qs ? `/dashboard?${qs}` : "/dashboard";
  };

  const categoryNames = new Map(categoryList.map((c) => [c.id, c.name]));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 sm:px-6">
      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
        <div className="min-w-0 flex-1">
          <CategoryBar
            categories={categoryList}
            counts={counts}
            total={total}
            selected={selected}
          />
        </div>
        <div className="w-full lg:w-80 lg:shrink-0">
          <SearchForm query={q} category={selected} />
        </div>
      </div>

      {articleList.length === 0 ? (
        <p className="mt-16 text-center text-slate-500 dark:text-slate-400">
          {total === 0
            ? "아직 수집된 뉴스가 없어요. 「뉴스 가져오기」를 눌러 시작하세요."
            : q
              ? `「${q}」에 대한 검색 결과가 없어요.`
              : "이 카테고리에는 뉴스가 없어요."}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {articleList.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              categoryName={
                article.categoryId === null
                  ? null
                  : (categoryNames.get(article.categoryId) ?? null)
              }
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </main>
  );
}
