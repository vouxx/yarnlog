# Implementation Plan: YarnLog

<!-- 뜨개질 프로젝트/재료 관리 올인원 웹 앱 -->

## Summary

Next.js 16 App Router 기반 SPA + 작업 모드 전용 페이지 구조. Prisma + PostgreSQL로 데이터 관리, @dnd-kit으로 칸반 보드 드래그앤드롭 구현.

## Requirements

<!-- spec.md 참조 -->

1. 프로젝트 CRUD + 칸반 보드 (FR-1~7)
2. 작업 모드: 콘텐츠 뷰어 + 카운터 split view (FR-8~11)
3. 재료함: 실/바늘/부자재 인벤토리 (FR-12~14)
4. 도구: 타이머, 게이지 계산기 (FR-15~16)

## Critical Files

### New Files (향후)

- 반응형 레이아웃 관련 컴포넌트
- 인증 관련 파일 (미정)

### Modified Files (현재 작업 대상)

- `src/components/FocusView.tsx` — 반응형 대응
- `src/app/project/[id]/page.tsx` — 모바일 대응
- `src/app/api/upload/route.ts` — 업로드 안정화

### Reference Files

- `src/types/project.ts` — 타입 정의
- `prisma/schema.prisma` — DB 스키마
- `src/app/globals.css` — 디자인 시스템 (CSS 변수)
- `src/lib/prisma.ts` — Prisma 클라이언트 싱글턴

## Architecture

### User Flow

```text
사용자 → [메인 대시보드 /]
              ├─ 프로젝트 탭 → KanbanBoard → ProjectDetail (인라인)
              │                                    └─ "작업 모드" → /project/[id]
              └─ 재료함 탭 → MaterialStash
```

### Component Tree

```text
FocusView
├── FocusHeader (검색, 정렬, 폴더, 생성)
├── KanbanBoard
│   ├── KanbanColumn (todo / in-progress / done)
│   │   └── ProjectCard (draggable)
│   └── DnD Context (sensors, collision detection)
├── ProjectDetail (인라인 상세/편집)
├── MaterialStash (재료함)
└── DashboardSidebar
    ├── CompactTimer (작업 타이머)
    └── CompactGaugeForm (게이지 계산기)

WorkModePage (/project/[id])
├── ContentViewer (65% — 이미지/PDF/YouTube)
│   └── ThumbnailStrip (첨부파일 전환)
└── ToolPanel (35%)
    ├── StitchCounters (다중 카운터)
    ├── ProgressSlider (진행률)
    ├── MemoEditor (메모)
    └── AttachmentManager (첨부 관리)
```

### Domain Model

```text
Project
├── id (CUID)
├── title, memo, gauge
├── yarns: YarnInfo[]        ← JSON
├── needles: NeedleInfo[]    ← JSON
├── supplies: SupplyInfo[]   ← JSON
├── attachments: Attachment[] ← JSON
├── counters: StitchCounter[] ← JSON
├── progress (0~100), difficulty (1~5)
├── tags[], folder?, status (todo/in-progress/done)
├── position (칸반 정렬)
└── startDate?, endDate?

Material
├── id (CUID)
├── type (yarn/supply/needle)
├── name, brand?, color?, weight?, quantity?, notes?
├── imageUrl?
└── folder?
```

### Data Flow

```text
1. Client: fetch() → Next.js Route Handler
       ↓
2. Route Handler → Prisma Client → PostgreSQL (Neon)
       ↓
3. Response: JSON → Client state update
```

### File Upload Flow

```text
1. Client: FormData → POST /api/upload
       ↓
2. Route Handler: 파일 검증 (타입, 10MB 제한)
       ↓
3. 저장: public/uploads/{timestamp}-{originalName}
       ↓
4. Response: { url, name, type }
```

## Tech Stack

| 영역 | 기술 | 선택 이유 |
|------|------|-----------|
| Framework | Next.js 16 (App Router) | React 19 + 서버 컴포넌트 |
| Language | TypeScript | 타입 안전성 |
| Styling | Tailwind CSS v4 | 유틸리티 기반 빠른 스타일링 |
| Database | PostgreSQL (Neon) | 관계형 데이터, 호스팅 편의 |
| ORM | Prisma | 타입 안전한 쿼리, 마이그레이션 |
| Drag & Drop | @dnd-kit | React 19 호환, 접근성 |
| Icons | Lucide React | 경량, 트리쉐이킹 |
| ID 생성 | cuid() | URL-friendly, 분산 안전 |

## Directory Structure

```
src/
├── app/
│   ├── page.tsx                 # 메인 (FocusView)
│   ├── layout.tsx               # 루트 레이아웃
│   ├── globals.css              # 디자인 시스템 (CSS 변수)
│   ├── project/[id]/page.tsx    # 작업 모드
│   └── api/
│       ├── projects/            # 프로젝트 API
│       ├── materials/           # 재료 API
│       └── upload/              # 파일 업로드
├── components/                  # UI 컴포넌트
├── hooks/                       # 커스텀 훅 (useCounters)
├── types/                       # 타입 정의
└── lib/                         # 유틸리티 (prisma)
```

## Verification

### Build

```bash
npm run build
```

### Dev Server

```bash
npm run dev
```

### Lint

```bash
npm run lint
```

### Manual Test

1. 프로젝트 생성 → 칸반 드래그앤드롭 → 상세 편집
2. 작업 모드 진입 → 콘텐츠 뷰어 + 카운터 동시 사용
3. 재료 등록 → 폴더 분류 → 폴더 삭제 옵션 확인
4. 파일 업로드 (이미지, PDF) → 작업 모드에서 확인

## Considerations

### JSON 필드 사용

yarns, needles, counters 등을 JSON으로 저장. 유연하지만 쿼리 성능에 주의. 현재 규모에서는 문제 없음.

### 파일 저장소

현재 `public/uploads/`에 로컬 저장. 프로덕션 배포 시 S3/Cloudinary 등 외부 스토리지 전환 필요.

### 인증

현재 미구현. 다중 사용자 지원 시 인증 레이어 추가 필요.
