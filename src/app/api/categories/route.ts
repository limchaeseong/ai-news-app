import { auth } from "@clerk/nextjs/server";
import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { categories } from "@/db/schema";

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

const createSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(30, "이름은 30자 이하로 입력해 주세요."),
  description: z.string().trim().max(200, "설명은 200자 이하로 입력해 주세요.").default(""),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "로그인이 필요합니다.", 401);

  const list = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(asc(categories.createdAt), asc(categories.id));
  return NextResponse.json({ categories: list });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return errorResponse("UNAUTHORIZED", "로그인이 필요합니다.", 401);

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "INVALID_INPUT",
      parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다.",
      400,
    );
  }

  // 추가해도 기존 기사는 재분류하지 않는다(이후 수집분부터 적용).
  const [created] = await db
    .insert(categories)
    .values({ userId, ...parsed.data })
    .onConflictDoNothing({ target: [categories.userId, categories.name] })
    .returning();

  if (!created) {
    return errorResponse("DUPLICATE_NAME", "이미 같은 이름의 카테고리가 있어요.", 409);
  }
  return NextResponse.json({ category: created }, { status: 201 });
}
