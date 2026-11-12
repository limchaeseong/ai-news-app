import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// Notion MCP 전송 방식은 이 파일에서만 결정한다.
// 현재: 로컬 stdio(@notionhq/notion-mcp-server를 자식 프로세스로 실행). Vercel 배포 시 원격 MCP로 교체한다.
const SERVER_ENTRY = path.join(
  process.cwd(),
  "node_modules",
  "@notionhq",
  "notion-mcp-server",
  "bin",
  "cli.mjs",
);

export async function withNotionClient<T>(
  fn: (client: Client) => Promise<T>,
): Promise<T> {
  const token = process.env.NOTION_API_TOKEN ?? process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_API_TOKEN 환경변수가 설정되어 있지 않습니다.");

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER_ENTRY],
    env: { ...(process.env as Record<string, string>), NOTION_TOKEN: token },
    stderr: "ignore",
  });
  const client = new Client({ name: "ai-news-collector", version: "0.1.0" });
  await client.connect(transport);
  try {
    return await fn(client);
  } finally {
    await client.close().catch(() => {});
  }
}
