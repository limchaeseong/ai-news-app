# AI News Collector

해외 AI 뉴스를 RSS로 수집하고, Claude가 한국어로 번역·요약·카테고리 분류한 결과를 카드로 보여주며, 원하는 뉴스를 Notion에 저장할 수 있는 개인용 웹앱입니다.

## 주요 기능

- **로그인(Clerk)**: 미로그인 상태에서는 모든 페이지와 API 접근이 차단됩니다.
- **뉴스 가져오기**: TechCrunch AI, The Verge AI의 최신 기사를 수집하고 이미 저장된 기사(URL 기준)는 건너뜁니다.
- **Claude 번역·요약·분류**: 한국어 제목, 요약, 카테고리를 생성합니다. 기사 10건씩 묶어 JSON 구조화 출력으로 호출합니다.
- **카테고리 관리**: 사용자별로 추가·수정·삭제할 수 있습니다. 삭제하면 해당 기사를 남은 카테고리로 재분류합니다.
- **카드 목록 / 필터**: 최신순 정렬과 카테고리 필터를 제공합니다.
- **Notion 저장**: 카드의 버튼으로 Notion 데이터베이스에 저장합니다. Notion MCP 서버를 통해 연동합니다.

모든 데이터는 사용자별로 분리되어 저장됩니다.

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| 인증 | Clerk |
| DB | Neon (Postgres) + Drizzle ORM |
| AI | Claude API (`@anthropic-ai/sdk`) |
| Notion 연동 | MCP (`@modelcontextprotocol/sdk` + `@notionhq/notion-mcp-server`) |
| 기타 | `rss-parser`, zod |

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경변수

루트에 `.env.local` 파일을 만들고 아래 값을 채웁니다.

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=

# Neon
DATABASE_URL=

# Claude
ANTHROPIC_API_KEY=

# Notion
NOTION_API_TOKEN=
NOTION_DATABASE_ID=
```

### 3. DB 마이그레이션

```bash
npx drizzle-kit migrate
```

### 4. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 명령어

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과로 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |
| `npx tsc --noEmit` | 타입 검사 |
| `npx drizzle-kit generate` | 스키마 변경 후 마이그레이션 SQL 생성 |
| `npx drizzle-kit migrate` | 마이그레이션을 DB에 적용 |

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── categories/        # 카테고리 API
│   │   └── news/
│   │       ├── fetch/         # 뉴스 수집 API
│   │       └── [id]/notion/   # Notion 저장 API
│   ├── dashboard/
│   └── sign-in/
├── components/
├── db/                        # Drizzle 스키마와 DB 클라이언트
├── lib/                       # 수집, Claude 호출, Notion 연동 등
└── proxy.ts                   # 인증 차단 (Next 16의 middleware)
drizzle/                       # 마이그레이션 SQL
doc/                           # 프로젝트 문서
```

## 문서

- [`doc/PRD.md`](doc/PRD.md): 범위, 데이터 모델, API, 구현 순서
- [`doc/ui.md`](doc/ui.md): 화면 구성과 스타일 규칙

## 구현 현황

- [x] Clerk 인증
- [x] DB 스키마·마이그레이션
- [x] 뉴스 수집 및 Claude 번역·요약·분류
- [x] 카테고리 추가
- [x] Notion 저장
- [ ] 카테고리 수정·삭제, 설정 화면 등 나머지 기능은 `doc/PRD.md`의 구현 순서를 따릅니다.
