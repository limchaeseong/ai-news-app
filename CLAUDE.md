# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 현재 상태

스캐폴드·의존성 설치, 인증(1단계), DB 스키마·마이그레이션(2단계)까지 끝난 상태이며 나머지 앱 코드는 아직 없다. 범위, 데이터 모델, API, 디렉토리 구조(§9), 구현 순서(§12)는 `doc/PRD.md`가 기준 문서다. 그 순서를 따른다. 화면 구성·스타일(Tailwind, 파란색 메인) 규칙은 `doc/ui.md`를 따른다. 1단계(Clerk 인증)는 구현되어 있다: `src/proxy.ts`가 미로그인 요청을 차단하고(API는 401 JSON, 페이지는 `/sign-in`으로 rewrite), `/sign-in`의 `SignInGate`가 로그인 모달을 자동으로 연다. 페이지 차단은 layout이 아니라 반드시 proxy에서 한다(layout에서 children을 숨겨도 페이지 RSC 데이터가 응답에 포함됨).

2단계(DB)는 구현되어 있다: `src/db/schema.ts`에 `categories`, `articles`, `user_settings` 테이블이 있고, `src/db/index.ts`가 `@neondatabase/serverless` + `drizzle-orm/neon-http`로 `db`를 export한다. 마이그레이션은 `drizzle/`에 있으며 Neon `ai-news` 프로젝트에 적용되어 있다. 개발 확인용 예제 데이터(userId `user_example123`)가 들어 있는데, 실제 로그인 계정에는 보이지 않으므로 필요 없으면 지운다. 루트의 `.mcp.json`은 Claude Code에서 Neon MCP 서버를 쓰기 위한 설정이다.

Notion 저장(F6)은 구현되어 있다: 카드의 `SaveToNotionButton` → `POST /api/news/[id]/notion` → `src/lib/notion/saveArticle.ts`가 `mcpClient.ts`(로컬 stdio)로 `API-post-page`를 호출해 `NOTION_DATABASE_ID`의 DB(속성: 제목·원제목·출처·카테고리·발행일·원문 링크, 본문에 요약)에 저장하고 `articles.notionPageId`를 기록한다. 현재는 `user_settings`/설정 화면 없이 환경변수 `NOTION_API_TOKEN`, `NOTION_DATABASE_ID`를 쓴다.

## 명령어

- `npm run dev` : 개발 서버 실행 (http://localhost:3000, 코드 수정 시 자동 반영)
- `npm run build` : 프로덕션 빌드 생성. 배포 전 빌드 오류·타입 오류 확인에도 사용
- `npm run start` : 빌드된 결과물로 프로덕션 서버 실행 (먼저 `npm run build` 필요)
- `npm run lint` : ESLint로 코드 검사 (flat config, `eslint.config.mjs`)
- `npx tsc --noEmit` : 파일을 생성하지 않고 TypeScript 타입 검사만 수행
- `npm install <패키지>` / `npm install -D <패키지>` : 런타임 / 개발용 의존성 추가
- DB 마이그레이션(`npx drizzle-kit generate`, `npx drizzle-kit migrate`) : 스키마(`src/db/schema.ts`) 변경 후 각각 마이그레이션 SQL 생성(`drizzle/`), Neon DB에 적용. `drizzle.config.ts`가 `.env.local`의 `DATABASE_URL`을 직접 로드한다
- 테스트 러너는 설정되어 있지 않다.

## 커스텀 명령어

`.claude/commands/`에 프로젝트 전용 슬래시 명령어가 있다.

- `/news-workflow <브랜치 이름>` : 새 기능 개발 워크플로우. main 확인 → 새 브랜치 생성(이름이 없으면 영어 소문자-하이픈 형식으로 제안) → 개발 시작 안내 및 CLAUDE.md 기반 스택·컨벤션 안내 → 사용자가 `완료`/`done`을 입력하면 변경 파일 목록과 커밋 메시지 제안, 확인 후 커밋하고 main에 병합 → 작업 요약. 병합 후 푸시는 하지 않는다.

## Next.js 버전 주의사항

Next 16 / React 19 / Tailwind v4를 사용한다. `AGENTS.md`는 이전 버전과 API·규칙이 다를 수 있다고 경고한다(예: `middleware` 이름이 바뀌었을 수 있음). Next 관련 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 해당 가이드를 먼저 읽는다. Next 16에서 `middleware`는 `proxy`로 이름이 바뀌어 `src/proxy.ts`를 쓴다(PRD §9의 `middleware.ts`는 구버전 표기). Clerk v7에서는 `SignedIn`/`SignedOut` 대신 `<Show when="signed-in">`을 쓴다.

## 아키텍처 (PRD 기준)

개인용 웹앱: RSS 수집(TechCrunch AI, The Verge AI) → Claude가 한국어로 번역·요약·분류 → 카드 UI → 선택적 Notion 저장.

- 스택: Clerk 인증, Neon + Drizzle, `@anthropic-ai/sdk`(가볍고 빠른 모델), `rss-parser`, zod, Notion은 MCP(`@modelcontextprotocol/sdk` 클라이언트가 `@notionhq/notion-mcp-server`를 실행).
- 모든 데이터는 사용자별로 분리한다. 모든 쿼리에 `userId` 조건을 걸고, 모든 API 라우트는 인증을 요구한다. 오류 형식은 `{ error: { code, message } }`.
- Claude 호출은 기사 10건씩 묶어 JSON 구조화 출력으로 하고, zod로 검증하며 1회 재시도한다. 그래도 실패한 기사는 저장하지 않아 다음 수집 때 다시 시도된다. 카테고리를 삭제하면 해당 카테고리 기사만 남은 카테고리 중에서 재분류한다(실패 시 미분류로 두고 삭제는 진행).
- Notion 전송 방식(로컬 stdio, Vercel 배포 시 원격 MCP)은 `src/lib/notion/mcpClient.ts` 한 곳에서만 결정한다.
- 환경변수: `CLERK_*`, `DATABASE_URL`, `ANTHROPIC_API_KEY`, `NOTION_TOKEN`. Notion 저장 위치(DB/페이지)는 환경변수가 아니라 `user_settings`에 사용자별로 저장한다.
- 수집 Route Handler에는 `maxDuration`을 설정한다.

## 문서 관리

프로젝트 문서(`PRD.md`, `ui.md` 등 새로 만드는 md 파일)는 루트의 `doc/` 디렉토리에서 관리한다. 도구가 루트에서 읽는 `CLAUDE.md`, `AGENTS.md`, `README.md`만 루트에 둔다.
