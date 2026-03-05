# Findings & Decisions

> **기술적 발견, 중요한 결정이 있을 때마다 이 파일을 즉시 업데이트하세요.**

## Requirements

<!-- spec.md의 핵심 요구사항 요약 -->

- [x] 프로젝트 CRUD + 칸반 보드 (FR-1~7)
- [x] 작업 모드 split view (FR-8~11)
- [x] 재료함 인벤토리 (FR-12~14)
- [x] 도구: 타이머, 게이지 계산기 (FR-15~16)
- [ ] 반응형 모바일 (FR-17~18)
- [ ] 인증/로그인 (FR-19)
- [ ] 다크 모드 (FR-20)

## Research Findings

### 코드베이스 구조

- 프레임워크: Next.js 16 (App Router) + React 19 + TypeScript
- 스타일링: Tailwind CSS v4
- DB/ORM: Prisma + PostgreSQL (Neon)
- 드래그앤드롭: @dnd-kit/core + @dnd-kit/sortable
- 아이콘: lucide-react

### 기존 패턴

- API: Next.js Route Handlers (`src/app/api/`)
- DB 접근: Prisma Client 싱글턴 (`src/lib/prisma.ts`)
- 배열 데이터: JSON 필드 (yarns, needles, counters 등)
- 일괄 작업: batch-folder API 패턴
- 컴포넌트: 인라인 상세 뷰 (모달 아님)

## Resources

### 문서

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma Docs](https://www.prisma.io/docs)
- [@dnd-kit](https://dndkit.com/)

### 코드 참조

- 메인 페이지: `src/app/page.tsx`
- 타입 정의: `src/types/project.ts`
- Prisma 스키마: `prisma/schema.prisma`
- 글로벌 스타일: `src/app/globals.css`
- Prisma 클라이언트: `src/lib/prisma.ts`

### API 엔드포인트

- GET/POST `/api/projects`
- GET/PATCH/DELETE `/api/projects/[id]`
- PATCH/DELETE `/api/projects/batch-folder`
- GET/POST/PATCH/DELETE `/api/materials`
- PATCH/DELETE `/api/materials/[id]`
- PATCH/DELETE `/api/materials/batch-folder`
- POST `/api/upload`

## Technical Decisions

| Decision | Rationale |
| --- | --- |
| Next.js 16 App Router | React 19 + 서버 컴포넌트 활용 |
| Prisma + PostgreSQL (Neon) | 타입 안전한 ORM, 호스팅 편의 |
| Tailwind CSS v4 | 유틸리티 기반 빠른 스타일링 |
| @dnd-kit | React 19 호환, 접근성 |
| SPA + 작업 모드 별도 페이지 | 기본 탐색은 SPA, 작업 시 전용 페이지 |
| JSON 필드 (yarns, needles 등) | 유연한 배열 저장, 별도 테이블 불필요 |
| ProjectModal → ProjectDetail 인라인 | 모달 대신 인라인으로 UX 개선 |
| PDF 뷰어 = iframe | 브라우저 내장 뷰어 활용, 라이브러리 불필요 |
| 폴더 삭제 커스텀 팝업 | confirm() 대신 2가지 옵션 제공 |
| 올리브/베이지/오렌지 컬러시스템 | 소프트 크래프트 느낌의 따뜻한 UI |
| cuid() ID | 분산 환경 안전, URL-friendly |

## Issues Encountered

<!-- 에러 상세 기록. progress.md Error Log는 요약 참조용. -->

### 1. Prisma 빌드 오류

**문제**: Vercel 배포 시 Prisma Client 미생성

**원인**: build 스크립트에 `prisma generate` 누락

**해결**: `package.json` build 스크립트에 `prisma generate &&` 추가

**결과**: 해결됨 (커밋 3c57145)

### 2. HTML 중첩 규칙 위반

**문제**: `<button>` 안에 `<button>` 중첩으로 경고

**원인**: ProjectDetail 내 버튼 컴포넌트 구조

**해결**: 내부 요소를 `<span role="button">`로 변경

**결과**: 해결됨

## Learnings

### 디자인 시스템 (커밋 d735cb6)

소프트 크래프트 디자인 리뉴얼 적용:
- 올리브/베이지/오렌지 컬러시스템
- 따뜻하고 부드러운 크래프트 느낌의 UI 톤

### 작업 모드 설계 판단

- 모달 내 split view는 공간 부족 → 전용 페이지(`/project/[id]`)로 분리
- 풀 뷰포트(`h-screen`) 활용이 작업 경험에 핵심

### 폴더 삭제 UX

- `confirm()` 대신 커스텀 팝업으로 2가지 옵션 제공
- 사용자에게 명확한 선택지를 주는 것이 더 안전
