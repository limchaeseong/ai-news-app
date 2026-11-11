import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";

const DEFAULT_CATEGORIES = [
  { name: "모델/제품", description: "새 AI 모델, 제품, 기능 출시와 업데이트" },
  { name: "연구", description: "논문, 벤치마크, 기술적 연구 성과" },
  { name: "정책·규제", description: "AI 관련 법, 규제, 정부 정책, 소송" },
  { name: "투자·비즈니스", description: "투자 유치, 인수합병, 실적, 기업 전략" },
  { name: "기타", description: "위 분류에 해당하지 않는 AI 관련 소식" },
];

/** 사용자의 카테고리를 돌려준다. 하나도 없으면 기본 카테고리를 만든다. */
export async function getOrSeedCategories(userId: string) {
  const list = () =>
    db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.id));

  const existing = await list();
  if (existing.length > 0) return existing;

  await db
    .insert(categories)
    .values(DEFAULT_CATEGORIES.map((c) => ({ ...c, userId })))
    .onConflictDoNothing();
  return list();
}
