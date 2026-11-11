import type { FeedItem } from "@/lib/rss/fetchFeeds";
import { getAnthropic, NEWS_MODEL } from "./client";
import { SYSTEM_PROMPT } from "./prompt";
import { buildJsonSchema, resultSchema, type ResultItem } from "./schema";

const CHUNK_SIZE = 10;
const CONCURRENCY = 3;
const MAX_ATTEMPTS = 2; // 최초 1회 + 재시도 1회

export type CategoryInfo = { id: number; name: string; description: string };

export type ProcessedArticle = {
  item: FeedItem;
  titleKo: string;
  summaryKo: string;
  categoryId: number | null;
};

export type ProcessResult = {
  processed: ProcessedArticle[];
  failed: FeedItem[];
};

async function requestChunk(
  chunk: FeedItem[],
  categories: CategoryInfo[],
): Promise<ResultItem[]> {
  const names = categories.map((c) => c.name);
  const payload = {
    categories: categories.map(({ name, description }) => ({
      name,
      description,
    })),
    articles: chunk.map((item, idx) => ({
      idx,
      source: item.sourceName,
      title: item.originalTitle,
      summary: item.summary,
    })),
  };

  const response = await getAnthropic().messages.create({
    model: NEWS_MODEL,
    max_tokens: 16000,
    system: SYSTEM_PROMPT,
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: buildJsonSchema(names) },
    },
    messages: [
      {
        role: "user",
        content: `카테고리와 기사 목록입니다.\n<articles>\n${JSON.stringify(payload)}\n</articles>`,
      },
    ],
  });

  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
    throw new Error(`응답이 완료되지 않음: ${response.stop_reason}`);
  }
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("텍스트 응답 없음");

  const { results } = resultSchema.parse(JSON.parse(text.text));

  // idx가 정확히 0..n-1을 한 번씩 덮고, 카테고리 이름이 유효한지 확인한다.
  const seen = new Set<number>();
  for (const r of results) {
    if (r.idx < 0 || r.idx >= chunk.length || seen.has(r.idx)) {
      throw new Error(`잘못된 idx: ${r.idx}`);
    }
    if (r.category !== null && !names.includes(r.category)) {
      throw new Error(`알 수 없는 카테고리: ${r.category}`);
    }
    seen.add(r.idx);
  }
  if (seen.size !== chunk.length) throw new Error("일부 기사 결과 누락");
  return results;
}

async function processChunk(
  chunk: FeedItem[],
  categories: CategoryInfo[],
): Promise<ProcessedArticle[] | null> {
  const idByName = new Map(categories.map((c) => [c.name, c.id]));
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const results = await requestChunk(chunk, categories);
      return results.map((r) => ({
        item: chunk[r.idx],
        titleKo: r.titleKo,
        summaryKo: r.summaryKo,
        categoryId: r.category === null ? null : (idByName.get(r.category) ?? null),
      }));
    } catch (error) {
      console.error(`[ai] 청크 처리 실패 (시도 ${attempt}/${MAX_ATTEMPTS})`, error);
    }
  }
  return null;
}

/**
 * 기사를 10건씩 묶어 Claude로 번역·요약·분류한다.
 * 검증까지 통과하지 못한 청크의 기사는 failed로 돌려주며, 저장하지 않으면 다음 수집 때 다시 시도된다.
 */
export async function processArticles(
  items: FeedItem[],
  categories: CategoryInfo[],
): Promise<ProcessResult> {
  const chunks: FeedItem[][] = [];
  for (let i = 0; i < items.length; i += CHUNK_SIZE) {
    chunks.push(items.slice(i, i + CHUNK_SIZE));
  }

  const processed: ProcessedArticle[] = [];
  const failed: FeedItem[] = [];
  let next = 0;

  async function worker() {
    while (next < chunks.length) {
      const chunk = chunks[next++];
      const result = await processChunk(chunk, categories);
      if (result) processed.push(...result);
      else failed.push(...chunk);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, chunks.length) }, worker),
  );
  return { processed, failed };
}
