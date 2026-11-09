import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
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

  let added = 0;
  if (items.length > 0) {
    // 번역·요약·분류 전 단계: 한국어 컬럼은 원문으로 임시 채우고 카테고리는 미분류로 둔다.
    const inserted = await db
      .insert(articles)
      .values(
        items.map((item) => ({
          userId,
          sourceName: item.sourceName,
          url: item.url,
          originalTitle: item.originalTitle,
          titleKo: item.originalTitle,
          summaryKo: item.summary,
          categoryId: null,
          publishedAt: item.publishedAt,
        })),
      )
      .onConflictDoNothing({ target: [articles.userId, articles.url] })
      .returning({ id: articles.id });
    added = inserted.length;
  }

  return NextResponse.json({
    added,
    skipped: items.length - added,
    failedSources,
  });
}
