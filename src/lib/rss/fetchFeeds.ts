import Parser from "rss-parser";
import { FEED_SOURCES } from "./sources";

export type FeedItem = {
  sourceName: string;
  url: string;
  originalTitle: string;
  summary: string;
  publishedAt: Date;
};

export type FetchFeedsResult = {
  items: FeedItem[];
  failedSources: string[];
};

const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_PAGES = 10;
const SUMMARY_MAX_LENGTH = 300;

const parser = new Parser({
  timeout: 10_000,
  headers: { "User-Agent": "ai-news-collector/0.1" },
});

function toPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string): string {
  return text.length > SUMMARY_MAX_LENGTH
    ? `${text.slice(0, SUMMARY_MAX_LENGTH).trimEnd()}…`
    : text;
}

/** 모든 소스의 RSS를 파싱해 지난 24시간 이내 기사만 돌려준다. 소스별 실패는 격리한다. */
export async function fetchFeeds(now = new Date()): Promise<FetchFeedsResult> {
  const since = now.getTime() - WINDOW_MS;

  const results = await Promise.allSettled(
    FEED_SOURCES.map(async (source) => {
      const items: FeedItem[] = [];
      for (let page = 1; page <= (source.paged ? MAX_PAGES : 1); page++) {
        const pageUrl =
          page === 1 ? source.url : `${source.url}?paged=${page}`;
        let feedItems;
        try {
          feedItems = (await parser.parseURL(pageUrl)).items;
        } catch (error) {
          // 첫 페이지 실패는 소스 실패, 이후 페이지 실패(끝 도달 등)는 거기서 멈춘다.
          if (page === 1) throw error;
          break;
        }
        if (feedItems.length === 0) break;

        let reachedOld = false;
        for (const item of feedItems) {
          const url = item.link?.trim();
          const title = item.title?.trim();
          const published = item.isoDate ?? item.pubDate;
          if (!url || !title || !published) continue;

          const publishedAt = new Date(published);
          if (Number.isNaN(publishedAt.getTime())) continue;
          if (publishedAt.getTime() < since) {
            reachedOld = true;
            continue;
          }

          items.push({
            sourceName: source.name,
            url,
            originalTitle: title,
            summary: truncate(
              toPlainText(item.contentSnippet ?? item.content ?? ""),
            ),
            publishedAt,
          });
        }
        // 이 페이지에 기간보다 오래된 기사가 있으면 더 이전 페이지는 볼 필요가 없다.
        if (reachedOld) break;
      }
      return items;
    }),
  );

  const items: FeedItem[] = [];
  const failedSources: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") items.push(...result.value);
    else {
      failedSources.push(FEED_SOURCES[i].name);
      console.error(`[rss] ${FEED_SOURCES[i].name} 수집 실패`, result.reason);
    }
  });

  return { items, failedSources };
}
