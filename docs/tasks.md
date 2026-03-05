# Tasks: YarnLog

<!-- 뜨개질 프로젝트/재료 관리 올인원 웹 앱 -->

## Goal

뜨개질 프로젝트와 재료를 체계적으로 관리할 수 있는 올인원 뜨개노트 웹 앱.

## Current Phase

🔄 Phase 3: Feature Enhancement

## Phases

### Phase 1: Requirements & Discovery ✅

- [x] 프로젝트 초기 설정 (Next.js 16 + TypeScript + Tailwind v4)
- [x] 데이터베이스 스키마 설계 (Prisma + PostgreSQL)
- [x] 핵심 기능 정의 (칸반, 대시보드, 재료함)
- [x] 스펙 문서 작성 (spec.md)

### Phase 2: Core Implementation ✅

- [x] 칸반 보드 구현 (DnD Kit 기반 드래그앤드롭)
- [x] 대시보드 UI + 재료함(MaterialStash) 구현
- [x] 소프트 크래프트 디자인 리뉴얼 (올리브/베이지/오렌지 컬러시스템)
- [x] 프로젝트 CRUD API
- [x] 재료 CRUD API

### Phase 3: Feature Enhancement 🔄

- [x] ProjectDetail 리팩토링
- [x] FocusView / FocusHeader 확장
- [x] MaterialStash 대규모 확장
- [x] 폴더 기반 정리 (batch-folder API)
- [x] CompactProjectCard 리디자인
- [x] PDF 인라인 뷰어
- [x] 작업 모드 페이지 (`/project/[id]`)
- [x] GET `/api/projects/[id]` 핸들러
- [ ] 이미지 업로드 안정화
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

## Notes

- 진행할 때마다 Phase 상태를 업데이트하세요: ⏸️ 대기 → 🔄 진행 중 → ✅ 완료
- 결정 사항은 findings.md의 Technical Decisions에 기록하세요.
- 오류는 findings.md의 Issues Encountered에 기록하세요.
