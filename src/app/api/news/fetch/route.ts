import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { processArticles } from "@/lib/ai/processArticles";
import { getOrSeedCategories } from "@/lib/categories";
import { fetchFeeds } from "@/lib/rss/fetchFeeds";

export const maxDuration = 60;

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "로그인이 필요합니다.", 401);

  const { items, failedSources } = await fetchFeeds();

  if (failedSources.length > 0 && items.length === 0) {
    return errorResponse(
      "FEED_FETCH_FAILED",
      `뉴스를 가져오지 못했습니다: ${failedSources.join(", ")}`,
      502,
    );
  }

  // 이미 저장된 기사는 Claude를 호출하지 않는다.
  const existing =
    items.length > 0
      ? await db
          .select({ url: articles.url })
          .from(articles)
          .where(
            and(
              eq(articles.userId, userId),
              inArray(articles.url, items.map((i) => i.url)),
            ),
          )
      : [];
  const existingUrls = new Set(existing.map((e) => e.url));
  const newItems = items.filter((i) => !existingUrls.has(i.url));

  let added = 0;
  let failed = 0;
  if (newItems.length > 0) {
    const categoryList = await getOrSeedCategories(userId);
    const { processed, failed: failedItems } = await processArticles(
      newItems,
      categoryList,
    );
    failed = failedItems.length;

    if (processed.length > 0) {
      const inserted = await db
        .insert(articles)
        .values(
          processed.map(({ item, titleKo, summaryKo, categoryId }) => ({
            userId,
            sourceName: item.sourceName,
            url: item.url,
            originalTitle: item.originalTitle,
            titleKo,
            summaryKo,
            categoryId,
            publishedAt: item.publishedAt,
          })),
        )
        .onConflictDoNothing({ target: [articles.userId, articles.url] })
        .returning({ id: articles.id });
      added = inserted.length;
    }
  }

  return NextResponse.json({
    added,
    skipped: items.length - newItems.length,
    failed,
    failedSources,
  });
}
