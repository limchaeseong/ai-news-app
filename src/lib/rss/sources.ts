export type FeedSource = {
  name: string;
  url: string;
  // true면 `?paged=N`으로 지난 기사까지 이어서 가져올 수 있는 피드
  paged?: boolean;
};

export const FEED_SOURCES: FeedSource[] = [
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    paged: true,
  },
  {
    // 페이지 이동을 지원하지 않아 피드에 담긴 최신 기사(약 10건)만 가져온다.
    name: "The Verge AI",
    url: "https://theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];
