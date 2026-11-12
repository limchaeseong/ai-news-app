import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { NotionConfigError, saveArticleToNotion } from "@/lib/notion/saveArticle";

export const maxDuration = 60;

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "로그인이 필요합니다.", 401);

  const { id } = await params;
  if (!/^\d+$/.test(id)) return errorResponse("NOT_FOUND", "뉴스를 찾을 수 없어요.", 404);

  const [article] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.id, Number(id)), eq(articles.userId, userId)));
  if (!article) return errorResponse("NOT_FOUND", "뉴스를 찾을 수 없어요.", 404);

  if (article.notionPageId) {
    return NextResponse.json({ notionPageId: article.notionPageId });
  }

  let categoryName: string | null = null;
  if (article.categoryId !== null) {
    const [category] = await db
      .select({ name: categories.name })
      .from(categories)
      .where(and(eq(categories.id, article.categoryId), eq(categories.userId, userId)));
    categoryName = category?.name ?? null;
  }

  try {
    const notionPageId = await saveArticleToNotion(article, categoryName);
    await db
      .update(articles)
      .set({ notionPageId })
      .where(and(eq(articles.id, article.id), eq(articles.userId, userId)));
    return NextResponse.json({ notionPageId });
  } catch (e) {
    if (e instanceof NotionConfigError) {
      return errorResponse("NOTION_TARGET_NOT_SET", e.message, 409);
    }
    console.error("[notion] 저장 실패", e);
    return errorResponse("NOTION_SAVE_FAILED", "Notion에 저장하지 못했어요. 잠시 후 다시 시도해 주세요.", 502);
  }
}
