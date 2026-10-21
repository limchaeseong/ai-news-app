# PRD — AI News Collector

## 1. 개요
해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류한 결과를 카드 형태로 보여주며, 원하는 뉴스를 Notion에 저장할 수 있는 개인용 웹앱.

## 2. 목표 / 비목표
**목표**
- 버튼 한 번으로 최신 해외 AI 뉴스를 한국어 요약 카드로 확인
- 카테고리별로 골라 보기, 카테고리 자유 관리
- 마음에 드는 뉴스를 Notion에 저장

**비목표 (이번 범위 아님)**
- 자동/예약 수집 (수동 버튼만)
- 카테고리 추가·수정 시 기존 기사 재분류
- 소스(RSS) 추가·관리 UI
- 모바일 앱, 알림, 공유/댓글

## 3. 사용자
로그인한 개별 사용자. 모든 데이터(기사, 카테고리, 설정)는 사용자별로 분리된다.

## 4. 기능 요구사항

### F1. 로그인 (Clerk)
- 앱 실행 시 로그인이 필요하며, 미로그인 상태에서는 모든 페이지와 API 접근이 차단되고 로그인 화면으로 이동한다.

### F2. 뉴스 가져오기
- 메인 화면의 "뉴스 가져오기" 버튼 클릭 시 수집을 시작한다.
- 소스
  - TechCrunch AI: `https://techcrunch.com/category/artificial-intelligence/feed/`
  - The Verge AI: `https://theverge.com/rss/ai-artificial-intelligence/index.xml`
- 소스당 최신 10건을 가져오고, 이미 저장된 기사(URL 기준)는 건너뛴다.
- 한 소스가 실패해도 나머지는 계속 처리하며, 결과(추가 건수, 실패 소스)를 사용자에게 알린다.
- 처리 중에는 로딩 상태를 표시하고 중복 클릭을 막는다.

### F3. Claude 번역·요약·분류
- 신규 기사마다 한국어 제목, 3~4줄 요약, 카테고리 1개를 생성한다.
- 현재 사용자 카테고리(이름·설명)를 기준으로 분류하며, 맞는 카테고리가 없으면 미분류로 저장한다.
- 기사를 10건 단위로 묶어 호출하고 JSON 구조화 출력을 사용한다. 검증 실패 시 1회 재시도하며, 그래도 실패한 기사는 저장하지 않고 다음 수집 때 다시 시도한다.

### F4. 카테고리 관리
- 추가 / 수정 / 삭제 가능. 사용자 내 이름 중복 불가.
- 기본 카테고리: 모델/제품, 연구, 정책·규제, 투자·비즈니스, 기타
- 추가·수정 시 기존 기사는 재분류하지 않는다 (이후 수집분부터 적용).
- 삭제 시 해당 카테고리 기사만 남은 카테고리 중에서 Claude가 재분류한다.
  - 삭제 확인 창에 영향받는 기사 수와 진행 상태를 표시한다.
  - 재분류가 실패하면 해당 기사는 미분류로 두고 삭제는 진행하며 경고를 표시한다.
  - 남은 카테고리가 없으면 재분류를 생략한다.

### F5. 뉴스 카드 목록 / 필터
- 카드 구성: 한국어 제목, 요약, 출처, 날짜, 카테고리 배지, 원문 링크, `Notion 저장` 버튼
- 최신순 정렬. 카테고리 필터와 "미분류" 필터 제공 (URL 쿼리 `?category=`로 유지되어 새로고침·공유 가능).

### F6. Notion 저장
- 카드의 `Notion 저장` 버튼 클릭 시 Notion MCP 서버를 통해 해당 뉴스를 저장한다.
- 저장 속성: 제목, 요약, 카테고리, 원문 URL, 날짜
- 저장 위치(Notion DB 또는 페이지)는 설정 화면에서 언제든 변경할 수 있다.
  - URL 또는 ID 입력 → 접근 가능 여부 검증 후 저장
  - 미설정 상태에서 저장 시도 시 설정 화면으로 안내
- 이미 저장된 기사는 "저장됨"으로 표시하고 중복 생성을 막는다.
- Notion 연동 토큰만 환경변수로 관리한다.

## 5. 화면
| 경로 | 설명 |
|---|---|
| `/sign-in` | 로그인 |
| `/` | 카드 목록, 카테고리 필터, 뉴스 가져오기 버튼 |
| `/categories` | 카테고리 추가/수정/삭제 |
| `/settings` | Notion 저장 위치 설정 |

## 6. 기술 스택
- Next.js (App Router, TypeScript), Tailwind
- 인증: Clerk
- DB: Neon + Drizzle ORM
- AI: Claude API (`@anthropic-ai/sdk`), 비용 절감을 위해 가볍고 빠른 모델 권장
- Notion: Notion MCP 서버 (`@modelcontextprotocol/sdk` 클라이언트 + `@notionhq/notion-mcp-server`)
- RSS 파싱: `rss-parser`, 입력 검증: zod

## 7. 데이터 모델
- `categories`: id, userId, name, description, createdAt (userId+name unique)
- `user_settings`: userId (PK), notionTargetId, notionTargetType (`database` | `page`), updatedAt
- `articles`: id, userId, sourceName, url, originalTitle, titleKo, summaryKo, categoryId (nullable), publishedAt, fetchedAt, notionPageId (nullable) — (userId, url) unique

## 8. API
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | `/api/news` | 기사 목록 (카테고리 필터) |
| POST | `/api/news/fetch` | 수집·번역·요약·분류·저장 |
| POST | `/api/news/[id]/notion` | Notion 저장 |
| GET, POST | `/api/categories` | 목록, 추가 |
| PATCH, DELETE | `/api/categories/[id]` | 수정, 삭제(+재분류) |
| GET, PUT | `/api/settings` | Notion 저장 위치 조회/변경 |

- 모든 API는 인증 필수, 모든 쿼리는 `userId` 조건 강제.
- 오류 형식: `{ error: { code, message } }` (예: `NOTION_TARGET_NOT_SET` → 409)

## 9. 디렉토리 구조
```
ai-news-collector/
├─ drizzle/
├─ drizzle.config.ts
├─ .env.example
├─ PRD.md
└─ src/
   ├─ middleware.ts
   ├─ app/
   │  ├─ layout.tsx
   │  ├─ page.tsx
   │  ├─ categories/page.tsx
   │  ├─ settings/page.tsx
   │  ├─ sign-in/[[...sign-in]]/page.tsx
   │  └─ api/
   │     ├─ news/route.ts
   │     ├─ news/fetch/route.ts
   │     ├─ news/[id]/notion/route.ts
   │     ├─ categories/route.ts
   │     ├─ categories/[id]/route.ts
   │     └─ settings/route.ts
   ├─ components/ (news/, categories/, settings/, ui/)
   ├─ db/ (index.ts, schema.ts, queries/)
   ├─ lib/
   │  ├─ rss/ (sources.ts, fetchFeeds.ts)
   │  ├─ claude/ (client.ts, processArticles.ts, reclassify.ts, prompts.ts)
   │  ├─ notion/ (mcpClient.ts, saveArticle.ts)
   │  ├─ auth.ts
   │  └─ validators.ts
   └─ types/index.ts
```

## 10. 비기능 요구사항
- **보안**: Claude/Notion 호출은 서버에서만, API 키는 환경변수. 사용자 간 데이터 완전 분리.
- **안정성**: 부분 실패 허용(소스별), 중복 저장 방지, Claude 응답 검증·재시도.
- **성능**: 수집은 배치 처리하고 Route Handler `maxDuration`을 설정한다.
- **UX**: 로딩 상태, 중복 클릭 방지, 오류 코드별 한국어 메시지.
- **환경변수**: `CLERK_*`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NOTION_TOKEN`

## 11. 배포 / 운영 결정
- 로컬 실행을 우선하며 Notion MCP는 stdio 방식으로 사용한다.
- 배포(Vercel) 시에는 원격 MCP로 전환한다. 전송 방식은 `lib/notion/mcpClient.ts` 한 곳에서만 결정해 교체 비용을 최소화한다.

## 12. 구현 순서
1. Next.js 초기화 + Clerk 로그인/보호
2. Neon 연결 + Drizzle 스키마/마이그레이션
3. 카테고리 CRUD + 기본 카테고리 시드 + 삭제 시 재분류
4. RSS 수집 + 중복 제거 + Claude 번역/요약/분류 → 저장
5. 카드 UI + 필터 + 로딩/에러 상태
6. 설정 화면 + Notion MCP 저장 연동
7. `.env.example` 정리, 배포 안내

## 13. 검증 기준
- 미로그인 시 `/` 접근 → 로그인 화면으로 이동
- "뉴스 가져오기" → 두 소스 기사가 한국어 카드로 표시되고, 재클릭 시 중복 없음
- 카테고리 추가/수정/삭제 후 필터 정상 동작, 추가 시 기존 기사 불변
- 카테고리 삭제 → 해당 기사만 재분류, 나머지 기사 변동 없음
- 설정에서 Notion 위치 변경 → 새 위치로 저장, 미설정 시 설정 화면 안내
- `Notion 저장` → Notion에 페이지 생성, 버튼이 "저장됨"으로 변경
- 다른 계정 로그인 시 데이터가 분리되어 있음
