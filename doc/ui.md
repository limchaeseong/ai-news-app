# UI 가이드

앱 이름: **AI 뉴스 수집기**
메인 화면은 뉴스를 카드 형태로 보여주는 **대시보드**(`/`)다. 기능·데이터 기준은 `PRD.md`, 이 문서는 화면 구성과 스타일 규칙만 다룬다.

## 1. 기본 원칙

- 스타일은 **Tailwind CSS v4** 유틸리티 클래스로만 작성한다. 별도 CSS 파일은 `src/app/globals.css`의 테마 토큰 외에는 만들지 않는다.
- 모든 UI 문구는 한국어. `<html lang="ko">`.
- 라이트/다크 모드는 `prefers-color-scheme`를 따른다. 색은 Tailwind `dark:` 변형으로 지정한다(색상표는 §2).
- 모바일 우선 반응형. 기본 스타일은 모바일, `sm:` `lg:`로 확장한다.
- 컴포넌트는 `src/components/` 아래 `news/`, `categories/`, `settings/`, `ui/`로 나눈다. 재사용 가능한 버튼·배지 등은 `ui/`에 둔다.
- 스크린 리더용 라벨(`aria-label`), 키보드 포커스 표시(`focus-visible:ring-2`)를 모든 버튼·링크에 둔다.

## 2. 디자인 방향과 토큰

**메인 색상은 파란색.** 편안하고 깔끔하며 읽기 쉬운 스타일을 목표로 한다.

- **편안함**: 순백/순흑 대신 살짝 푸른 기운의 밝은 회색 배경(`slate`)과 부드러운 테두리를 쓴다. 강한 대비·그림자·채도 높은 색은 피한다.
- **깔끔함**: 장식을 줄이고 여백을 넉넉히 둔다. 카드 안 `p-5`, 카드 간격 `gap-5`, 섹션 간격 `mt-8`. 파란색은 "지금 눌러야 할 것/선택된 것"에만 쓴다.
- **읽기 쉬움**: 본문 `text-[15px] leading-relaxed`, 요약은 `leading-7`. 글자색은 배경 대비 4.5:1 이상을 유지한다(보조 글자도 `slate-500`/`slate-400`보다 옅게 쓰지 않는다). 줄 길이가 길어지지 않도록 그리드는 최대 3열.

### 색상

| 용도 | 라이트 | 다크 |
|------|--------|------|
| 페이지 배경 | `bg-slate-50` | `dark:bg-slate-950` |
| 카드/패널 배경 | `bg-white` | `dark:bg-slate-900` |
| 테두리 | `border-slate-200` | `dark:border-slate-800` |
| 제목 글자 | `text-slate-900` | `dark:text-slate-100` |
| 본문 글자 | `text-slate-700` | `dark:text-slate-300` |
| 보조 글자 | `text-slate-500` | `dark:text-slate-400` |
| **메인(주요 버튼, 선택된 칩, 링크)** | `bg-blue-600 text-white`, 호버 `hover:bg-blue-700` | `dark:bg-blue-500`, 호버 `dark:hover:bg-blue-400` |
| 연한 파랑(배지, 호버 배경) | `bg-blue-50 text-blue-700` | `dark:bg-blue-950 dark:text-blue-300` |
| 포커스 링 | `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2` | 동일 (`dark:ring-offset-slate-950`) |
| 오류 | `text-red-600` | `dark:text-red-400` |
| 성공(저장됨) | `text-emerald-600` | `dark:text-emerald-400` |

- 앱 전체는 `body`에 `bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300`를 지정하고, `globals.css`의 `--background`/`--foreground` 값도 같은 색으로 맞춘다.
- 파란색 강조는 한 화면에서 주요 버튼 1개와 선택된 카테고리 칩 위주로만 쓴다. 나머지는 연한 파랑 또는 슬레이트.

### 형태·타이포

- 모서리: 카드 `rounded-2xl`, 버튼 `rounded-lg`, 칩·배지 `rounded-full`.
- 그림자: 카드 `shadow-sm`, 호버 `hover:shadow-md hover:border-blue-200 dark:hover:border-slate-700`. 전환은 `transition` 하나로 통일.
- 글꼴은 `--font-sans`(Geist). 앱 이름 `text-xl font-bold`, 카드 제목 `text-lg font-semibold leading-snug`, 본문 `text-[15px]`, 메타 정보 `text-xs`.
- 버튼 높이는 최소 `h-9`(터치 영역 확보), 칩은 `h-8`.

## 3. 대시보드(`/`) 레이아웃

```
┌──────────────────────────────────────────────┐
│ AI 뉴스 수집기                  [뉴스 가져오기] (👤)│  ← 헤더
├──────────────────────────────────────────────┤
│ [전체] [모델/제품] [연구] [정책·규제] … [미분류] [+ 카테고리 추가] │  ← 카테고리 바
├──────────────────────────────────────────────┤
│ ┌────────┐ ┌────────┐ ┌────────┐             │
│ │ 카드   │ │ 카드   │ │ 카드   │             │  ← 뉴스 카드 그리드
│ └────────┘ └────────┘ └────────┘             │
└──────────────────────────────────────────────┘
```

- 전체 컨테이너: `mx-auto w-full max-w-6xl px-4 sm:px-6`.
- 세로 간격: 헤더 → 카테고리 바 `mt-8`, 카테고리 바 → 카드 목록 `mt-6`.

### 3.1 헤더

- 좌측: 앱 이름 **AI 뉴스 수집기** (`text-xl font-bold text-slate-900 dark:text-slate-100`).
- 우측: `뉴스 가져오기` 주요 버튼(`h-9 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400`), 그 옆에 Clerk `UserButton`.
- 현재 `layout.tsx`의 헤더(`UserButton`만 있음)를 이 구성으로 확장한다. 로그인 상태(`<Show when="signed-in">`)에서만 표시한다.
- `뉴스 가져오기` 클릭 중에는 비활성화하고 스피너와 `가져오는 중…` 문구를 보여준다.

### 3.2 카테고리 바 (카드 목록 바로 위)

- 한 줄 가로 배열: `flex flex-wrap items-center gap-2`. 좁은 화면에서는 줄바꿈한다.
- 순서: `전체` → 사용자 카테고리(생성순) → `미분류` → **`+ 카테고리 추가` 버튼(항상 맨 끝)**.
- 카테고리 칩(링크, URL `?category=`로 필터 유지):
  - 기본: `h-8 rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800`
  - 선택됨: `border-transparent bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500`, `aria-current="page"`
  - 칩 안에 기사 수를 작게 표시해도 된다(`text-xs opacity-70`).
- **`+ 카테고리 추가` 버튼**:
  - 칩과 같은 크기이되 연한 파랑 점선 테두리로 구분한다: `h-8 rounded-full border border-dashed border-blue-300 px-3 text-sm text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950`.
  - 라벨은 `+ 카테고리 추가`, 접근성 라벨 `카테고리 추가`.
  - 클릭 시 이름·설명을 입력하는 모달(또는 인라인 폼)을 연다. 저장하면 칩이 이 버튼 앞에 추가된다.
  - 수정·삭제는 `/categories` 화면에서 한다(PRD §5). 삭제 시 재분류 안내 확인창을 띄운다.

### 3.3 뉴스 카드 목록

- 그리드: `grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3`.
- 최신순 정렬(PRD F5).

#### 뉴스 카드 구성

```
┌──────────────────────────┐
│ [카테고리 배지]    TechCrunch · 2026-11-05 │
│ 한국어 제목 (최대 2줄)        │
│ 요약 3~4줄 …               │
│                            │
│ [원문 보기 ↗]   [Notion 저장] │
└──────────────────────────┘
```

- 컨테이너: `flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700`.
- 상단: 카테고리 배지(`rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300`)와 출처·날짜(`text-xs text-slate-500 dark:text-slate-400`). 미분류는 회색 배지(`bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300`).
- 제목: `mt-3 text-lg font-semibold leading-snug text-slate-900 line-clamp-2 dark:text-slate-100`.
- 요약: `mt-2 text-[15px] leading-7 text-slate-700 line-clamp-4 dark:text-slate-300`.
- 하단(`mt-auto pt-4 flex items-center justify-between`):
  - `원문 보기 ↗`: 파란 텍스트 링크(`text-sm font-medium text-blue-600 hover:underline dark:text-blue-400`), `target="_blank" rel="noopener noreferrer"`.
  - `Notion 저장`: 보조 버튼(`h-9 rounded-lg border border-slate-200 px-3 text-sm hover:bg-blue-50 dark:border-slate-700 dark:hover:bg-slate-800`). 저장 중 비활성화+스피너, 저장 후 `저장됨 ✓`(`text-emerald-600`)로 바꾼다. Notion 위치 미설정이면 설정 화면으로 안내한다.

## 4. 상태 화면

| 상태 | 표현 |
|------|------|
| 로딩(목록) | 카드 모양 스켈레톤 6개 (`animate-pulse`, `bg-slate-200 dark:bg-slate-800`) |
| 가져오는 중 | 헤더 버튼만 로딩 표시, 기존 카드는 유지 |
| 빈 목록 | 중앙 정렬 안내 `아직 수집된 뉴스가 없어요. 「뉴스 가져오기」를 눌러 시작하세요.` |
| 필터 결과 없음 | `이 카테고리에는 뉴스가 없어요.` |
| 오류 | 목록 위 배너 `rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700` (다크: `dark:border-red-900 dark:bg-red-950 dark:text-red-300`), 서버 오류 메시지(`error.message`)를 그대로 보여주고 `다시 시도` 버튼 제공 |

## 5. 그 밖의 화면

- `/categories`: 카테고리 목록을 행으로 표시하고 행마다 `수정`·`삭제` 버튼. 상단에 `+ 카테고리 추가`(대시보드와 동일한 폼 재사용).
- `/settings`: Notion 저장 위치 입력 폼 한 개와 `저장` 버튼.
- `/sign-in`: Clerk 로그인 모달(`SignInGate`)을 그대로 사용한다.

## 6. 구현 시 체크리스트

- [ ] `layout.tsx` 메타데이터 title을 `AI 뉴스 수집기`로 변경
- [ ] `globals.css`/`body` 배경·글자색을 §2 색상으로 교체
- [ ] 헤더에 앱 이름·`뉴스 가져오기` 추가
- [ ] 카테고리 바 + 맨 끝 `+ 카테고리 추가` 버튼
- [ ] 뉴스 카드 컴포넌트(`components/news/`)와 반응형 그리드
- [ ] 로딩·빈 상태·오류 상태
- [ ] 라이트/다크 모드 확인, 모바일(≈375px) 확인
