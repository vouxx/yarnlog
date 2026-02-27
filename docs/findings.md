# Findings & Decisions

> **기술적 발견, 중요한 결정이 있을 때마다 이 파일을 즉시 업데이트하세요.**

## Requirements

- [x] 프로젝트 생성/수정/삭제 (CRUD)
- [x] 칸반 보드 (todo → wip → done 상태 관리)
- [x] 대시보드 (진행중/완료 프로젝트 요약)
- [x] 재료함 (실, 바늘, 부자재 관리)
- [x] 폴더 기반 정리
- [x] 폴더 삭제 시 옵션 팝업 (폴더만 삭제 / 재료도 함께 삭제)
- [x] 이미지/PDF 업로드 및 첨부 (인라인 뷰어)
- [x] 작업 모드 페이지 (콘텐츠 보면서 단수 카운터 동시 사용)
- [ ] 반응형 모바일 레이아웃

## Research Findings

### 코드베이스 구조

- 프레임워크: Next.js 16 (App Router) + React 19 + TypeScript
- 스타일링: Tailwind CSS v4
- DB/ORM: Prisma + PostgreSQL
- 드래그앤드롭: @dnd-kit/core + @dnd-kit/sortable
- 아이콘: lucide-react

### 디렉토리 구조

```
src/
├── app/
│   ├── api/
│   │   ├── materials/       # 재료 CRUD + batch-folder
│   │   ├── projects/        # 프로젝트 CRUD + batch-folder
│   │   └── upload/          # 파일 업로드 (이미지/PDF)
│   ├── project/[id]/        # 작업 모드 페이지 (콘텐츠 뷰어 + 단수 카운터)
│   ├── layout.tsx
│   ├── page.tsx             # 메인 페이지 (SPA)
│   └── globals.css
├── components/
│   ├── KanbanBoard.tsx      # 칸반 보드 (메인 뷰)
│   ├── KanbanColumn.tsx     # 칸반 컬럼 (todo/wip/done)
│   ├── ProjectDetail.tsx    # 프로젝트 상세 (인라인)
│   ├── FocusView.tsx        # 포커스 뷰
│   ├── FocusHeader.tsx      # 포커스 헤더
│   ├── FocusSection.tsx     # 포커스 섹션
│   ├── MaterialStash.tsx    # 재료함
│   ├── DashboardSidebar.tsx # 대시보드 사이드바
│   ├── Sidebar.tsx          # 메인 사이드바
│   ├── ActiveProjectCard.tsx
│   ├── CompactProjectCard.tsx
│   ├── GalleryCard.tsx
│   ├── ProjectCard.tsx
│   ├── Dropdown.tsx
│   └── ToolsPanel.tsx
├── types/
│   └── project.ts           # 타입 정의
```

### DB 스키마

- **Project**: id, title, memo, gauge, yarns(JSON), needles(JSON), supplies(JSON), attachments(JSON), progress(0~100), difficulty(1~5), tags, folder, counters(JSON), status(todo/wip/done), position, startDate, endDate
- **Material**: id, type(yarn/supply/needle), name, brand, color, weight, quantity, notes, imageUrl, folder

### API 엔드포인트

| Method | Path | 설명 |
| --- | --- | --- |
| GET/POST | `/api/projects` | 프로젝트 목록 조회 / 생성 |
| GET/PATCH/DELETE | `/api/projects/[id]` | 프로젝트 조회 / 수정 / 삭제 |
| PUT | `/api/projects/batch-folder` | 프로젝트 일괄 폴더 이동 |
| GET/POST | `/api/materials` | 재료 목록 조회 / 생성 |
| GET/PUT/DELETE | `/api/materials/[id]` | 재료 상세 / 수정 / 삭제 |
| PUT | `/api/materials/batch-folder` | 재료 일괄 폴더 이동 |
| POST | `/api/upload` | 파일 업로드 (이미지/PDF) |

## Technical Decisions

| Decision | Rationale |
| --- | --- |
| SPA 구조 (page.tsx 중심) + 작업 모드 별도 페이지 | 기본 탐색은 SPA, 도안 보며 작업할 때는 전용 페이지(`/project/[id]`) |
| JSON 필드 (yarns, needles 등) | 유연한 배열 데이터 저장, 별도 테이블 불필요 |
| position 필드 | 칸반 보드 내 카드 순서 관리 |
| ProjectModal → ProjectDetail | 모달 대신 인라인 상세 뷰로 전환하여 UX 개선 |
| batch-folder API | 다중 항목 폴더 이동을 단일 요청으로 처리 |
| 폴더 삭제 커스텀 팝업 | confirm() 대신 2가지 옵션 제공 (폴더만/재료도 함께) |
| 작업 모드 = 별도 페이지 | 모달 내 split view는 공간 부족 → 전용 페이지로 분리하여 풀 뷰포트 활용 |
| PDF 뷰어 = iframe | 브라우저 내장 PDF 뷰어 활용, 별도 라이브러리 불필요 |

## Issues Encountered

### 1. Prisma 빌드 오류

**문제**: Vercel 배포 시 Prisma Client 미생성

**해결**: `build` 스크립트에 `prisma generate &&` 추가

**결과**: 해결됨 (커밋 3c57145)

## Resources

### 코드 참조

- 메인 페이지: `src/app/page.tsx`
- 타입 정의: `src/types/project.ts`
- Prisma 스키마: `prisma/schema.prisma`
- 글로벌 스타일: `src/app/globals.css`

## Learnings

### 디자인 시스템 (커밋 d735cb6)

소프트 크래프트 디자인 리뉴얼 적용:
- 올리브/베이지/오렌지 컬러시스템
- 따뜻하고 부드러운 크래프트 느낌의 UI 톤
