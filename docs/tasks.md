# Project: YarnLog (뜨개질 프로젝트 관리 앱)

## Goal

뜨개질 프로젝트와 재료를 체계적으로 관리할 수 있는 웹 앱 구축. 칸반 보드, 대시보드, 재료함, 프로젝트 상세 관리 기능을 포함한 올인원 뜨개노트.

## Current Phase

🔄 Phase 3: Implementation (기능 확장 및 리팩토링)

## Phases

### Phase 1: Requirements & Discovery ✅

- [x] 프로젝트 초기 설정 (Next.js 16 + TypeScript + Tailwind v4)
- [x] 데이터베이스 스키마 설계 (Prisma + PostgreSQL)
- [x] 핵심 기능 정의 (칸반, 대시보드, 재료함)

### Phase 2: Core Implementation ✅

- [x] 칸반 보드 구현 (DnD Kit 기반 드래그앤드롭)
- [x] 대시보드 UI + 재료함(MaterialStash) 구현
- [x] 소프트 크래프트 디자인 리뉴얼 (올리브/베이지/오렌지 컬러시스템)
- [x] 프로젝트 CRUD API (Next.js Route Handlers)
- [x] 재료 CRUD API

### Phase 3: Feature Enhancement 🔄

- [x] 프로젝트 상세 화면 (ProjectDetail) 리팩토링
- [x] FocusView / FocusHeader 확장
- [x] MaterialStash 대규모 확장
- [x] 폴더 기반 정리 (batch-folder API)
- [x] CompactProjectCard 리디자인
- [x] PDF 인라인 뷰어 (ProjectDetail 모달 내)
- [x] 작업 모드 페이지 (`/project/[id]` — 콘텐츠 뷰어 + 단수 카운터 split view)
- [x] GET `/api/projects/[id]` 핸들러 추가
- [ ] 미커밋 변경사항 정리 및 커밋
- [ ] 이미지 업로드 기능 안정화
- [ ] 반응형 레이아웃 최적화
- [ ] 작업 모드 모바일 대응

### Phase 4: Polish & Testing ⏸️

- [ ] 전체 UI/UX 검수
- [ ] 에러 핸들링 강화
- [ ] 로딩/빈 상태 처리
- [ ] 빌드 테스트 및 배포 준비

### Phase 5: Delivery ⏸️

- [ ] 배포 (Vercel 등)
- [ ] 최종 리뷰
- [ ] 사용자 전달

## Key Questions

1. 인증/로그인 기능이 필요한가?
2. 배포 대상 플랫폼은? (Vercel, self-hosted 등)
3. 이미지 저장소는? (로컬, S3, Cloudinary 등)

## Decisions Made

| Decision | Rationale |
| --- | --- |
| Next.js 16 App Router | 최신 React 19 + 서버 컴포넌트 활용 |
| Prisma + PostgreSQL | 타입 안전한 ORM, 관계형 데이터 관리 |
| Tailwind CSS v4 | 유틸리티 기반 빠른 스타일링 |
| DnD Kit | React 18/19 호환 드래그앤드롭 |
| 올리브/베이지/오렌지 컬러시스템 | 소프트 크래프트 느낌의 따뜻한 UI |
| ProjectModal 제거 | ProjectDetail 인라인 방식으로 전환 |
| cuid() ID | 분산 환경 안전, URL-friendly |

## Errors Encountered

| Error | Attempt | Resolution |
| --- | --- | --- |
| build 시 Prisma 미생성 | 1 | build 스크립트에 `prisma generate` 추가 |

## Notes

- 진행할 때마다 Phase 상태를 업데이트하세요: ⏸️ → 🔄 → ✅
- 중요한 결정을 내리기 전에 이 계획을 다시 읽어보세요.
- 모든 오류를 기록하세요. 삽질을 반복하는 걸 막을 수 있습니다.
