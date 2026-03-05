# Progress Log

> **각 단계를 완료하거나 문제가 발생하면 업데이트하세요.**

<!-- 시간순 작업 기록. tasks.md보다 상세. -->

## Session History

### 커밋 0a4bb81 — 프로젝트 초기화

### Phase 1: Requirements & Discovery ✅

**작업 내역**:

1. Create Next App으로 프로젝트 초기화
2. Next.js 16 + React 19 + TypeScript + Tailwind v4 설정

**생성/수정 파일**:

- 프로젝트 전체 초기 파일

---

### 커밋 3ebca67 — 칸반 보드 구현

### Phase 2: Core Implementation 🔄

**작업 내역**:

1. 뜨개노트 칸반 보드 구현
2. DnD Kit 기반 드래그앤드롭
3. 프로젝트 CRUD API

**생성/수정 파일**:

- `src/components/KanbanBoard.tsx`
- `src/components/KanbanColumn.tsx`
- `src/app/api/projects/` 관련 파일들

---

### 커밋 447ed7d — 대시보드 + 재료함

### Phase 2: Core Implementation 🔄

**작업 내역**:

1. YarnLog 대시보드 UI 구현
2. 재료함(MaterialStash) 구현
3. 재료 CRUD API

**생성/수정 파일**:

- `src/components/DashboardSidebar.tsx`
- `src/components/MaterialStash.tsx`
- `src/app/api/materials/` 관련 파일들

---

### 커밋 3c57145 — 빌드 수정

**작업 내역**:

1. build 시 prisma generate 누락 수정

**생성/수정 파일**:

- `package.json`

---

### 커밋 d735cb6 — 디자인 리뉴얼

### Phase 2: Core Implementation ✅

**작업 내역**:

1. 소프트 크래프트 디자인 리뉴얼
2. 올리브/베이지/오렌지 컬러시스템 적용

**생성/수정 파일**:

- `src/app/globals.css`
- 다수 컴포넌트 스타일 업데이트

---

### 커밋 ec418cc — 기능 확장

### Phase 3: Feature Enhancement 🔄

**작업 내역**:

1. ProjectDetail 대규모 리팩토링
2. MaterialStash 대규모 확장
3. FocusHeader / FocusView 확장
4. KanbanBoard 기능 추가
5. CompactProjectCard 리디자인
6. DashboardSidebar 업데이트
7. ProjectModal 제거 → ProjectDetail 인라인 전환
8. batch-folder API 추가 (projects, materials)
9. Dropdown 컴포넌트 신규 추가
10. 폴더 삭제 확인 팝업 구현
11. 작업 모드 전용 페이지 (`/project/[id]`) 구현
12. PDF 인라인 뷰어 추가
13. GET `/api/projects/[id]` 핸들러 추가

**생성/수정 파일**:

- `src/app/project/[id]/page.tsx` (신규)
- `src/app/api/projects/[id]/route.ts` (수정)
- `src/app/api/materials/batch-folder/route.ts` (신규)
- `src/components/ProjectDetail.tsx` (수정)
- `src/components/MaterialStash.tsx` (수정)
- `src/components/FocusView.tsx` (수정)
- `src/components/FocusHeader.tsx` (수정)
- `src/components/KanbanBoard.tsx` (수정)
- `src/components/CompactProjectCard.tsx` (수정)
- `src/components/DashboardSidebar.tsx` (수정)
- `src/components/Dropdown.tsx` (신규)
- `src/components/ProjectModal.tsx` (삭제)
- 외 다수

---

### Session 2026-03-05 — 문서 체계 정비

**작업 내역**:

1. README.md 작성 (create-next-app 기본 → 프로젝트 맞춤)
2. 5-File Planning 워크플로우 도입
   - `docs/spec.md` 신규 생성
   - `docs/plan.md` 신규 생성
3. 기존 3개 파일 (tasks/findings/progress) 템플릿에 맞춰 재구성
4. 메모리 업데이트 (MEMORY.md + planning-workflow.md)

**생성/수정 파일**:

- `README.md` (전면 재작성)
- `docs/spec.md` (신규)
- `docs/plan.md` (신규)
- `docs/tasks.md` (재구성)
- `docs/findings.md` (재구성)
- `docs/progress.md` (재구성)

---

## Test Results

<!-- Phase 4에서 업데이트 -->

| Test | Input | Expected | Actual | Status |
| --- | --- | --- | --- | --- |
| 아직 없음 | - | - | - | - |

## Error Log

<!-- 에러 요약. 상세 내용은 findings.md Issues Encountered 참조. -->

| Timestamp | Error | Attempt | Resolution |
| --- | --- | --- | --- |
| 2026-02-28 | Prisma 빌드 오류 | 1 | build 스크립트에 prisma generate 추가 |
| 2026-02-28 | HTML button 중첩 | 1 | span role="button"으로 변경 |

## 5-Question Reboot Check

<!-- 5개 모두 답할 수 있으면 작업 재개 가능. -->

작업 재개 시 이 질문들로 컨텍스트 복구:

| Question | Answer |
| --- | --- |
| 1. 현재 어느 단계인가? | Phase 3: Feature Enhancement (핵심 기능 완료, 안정화 남음) |
| 2. 다음에 할 일은? | 이미지 업로드 안정화, 반응형 최적화, 작업 모드 모바일 대응 |
| 3. 목표는? | 뜨개질 프로젝트/재료 관리 올인원 웹 앱 |
| 4. 지금까지 배운 것? | findings.md 참조 |
| 5. 완료한 작업은? | 칸반보드, 대시보드, 재료함, 디자인 리뉴얼, 프로젝트 상세, 작업 모드, 문서 체계(5-File) |
