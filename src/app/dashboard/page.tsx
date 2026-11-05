import { auth } from "@clerk/nextjs/server";
import { and, asc, count, desc, eq, isNull, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CategoryBar, UNCATEGORIZED } from "@/components/categories/CategoryBar";
import { ArticleCard } from "@/components/news/ArticleCard";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

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

  const [categoryList, countRows, articleList] = await Promise.all([
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
    db
      .select()
      .from(articles)
      .where(and(eq(articles.userId, userId), categoryFilter))
      .orderBy(
        sql`${articles.publishedAt} desc nulls last`,
        desc(articles.fetchedAt),
      ),
  ]);

  const counts = new Map(countRows.map((r) => [r.categoryId, r.n]));
  const total = countRows.reduce((sum, r) => sum + r.n, 0);
  const categoryNames = new Map(categoryList.map((c) => [c.id, c.name]));

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12 sm:px-6">
      <div className="mt-8">
        <CategoryBar
          categories={categoryList}
          counts={counts}
          total={total}
          selected={selected}
        />
      </div>

      {articleList.length === 0 ? (
        <p className="mt-16 text-center text-slate-500 dark:text-slate-400">
          {total === 0
            ? "아직 수집된 뉴스가 없어요. 「뉴스 가져오기」를 눌러 시작하세요."
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
    </main>
  );
}
