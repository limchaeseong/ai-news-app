import type { Article } from "@/db/schema";
import { withNotionClient } from "./mcpClient";

export class NotionConfigError extends Error {}

const text = (content: string) => [{ type: "text", text: { content } }];
// Notion rich_text 한 덩어리는 2000자 제한이다.
const clip = (s: string, n = 2000) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/** 기사 한 건을 Notion 데이터베이스에 페이지로 만들고 페이지 ID를 반환한다. */
export async function saveArticleToNotion(
  article: Article,
  categoryName: string | null,
): Promise<string> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    throw new NotionConfigError("NOTION_DATABASE_ID 환경변수가 설정되어 있지 않습니다.");
  }

  const properties: Record<string, unknown> = {
    제목: { title: text(clip(article.titleKo)) },
    원제목: { rich_text: text(clip(article.originalTitle)) },
    출처: { select: { name: article.sourceName.replaceAll(",", " ") } },
    "원문 링크": { url: article.url },
  };
  if (categoryName) {
    properties["카테고리"] = { select: { name: categoryName.replaceAll(",", " ") } };
  }
  if (article.publishedAt) {
    properties["발행일"] = { date: { start: article.publishedAt.toISOString() } };
  }

  const children = [
    {
      object: "block",
      type: "paragraph",
      paragraph: { rich_text: text(clip(article.summaryKo)) },
    },
  ];

  const result = await withNotionClient((client) =>
    client.callTool({
      name: "API-post-page",
      arguments: {
        parent: { database_id: databaseId },
        properties,
        children,
      },
    }),
  );

  const first = Array.isArray(result.content) ? result.content[0] : undefined;
  const raw = first && first.type === "text" ? first.text : "";
  if (result.isError) throw new Error(`Notion 저장 실패: ${raw.slice(0, 300)}`);

  let id: unknown;
  try {
    id = JSON.parse(raw)?.id;
  } catch {
    // fallthrough
  }
  if (typeof id !== "string") throw new Error(`Notion 응답을 해석하지 못했습니다: ${raw.slice(0, 300)}`);
  return id;
}
