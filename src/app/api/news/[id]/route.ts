import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "로그인이 필요합니다.", 401);

  const { id } = await params;
  if (!/^\d+$/.test(id)) return errorResponse("NOT_FOUND", "뉴스를 찾을 수 없어요.", 404);

  try {
    const deleted = await db
      .delete(articles)
      .where(and(eq(articles.id, Number(id)), eq(articles.userId, userId)))
      .returning({ id: articles.id });
    if (deleted.length === 0) return errorResponse("NOT_FOUND", "뉴스를 찾을 수 없어요.", 404);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[news] 삭제 실패", e);
    return errorResponse("DELETE_FAILED", "뉴스를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.", 500);
  }
}
