# Progress Log

> **각 단계를 완료하거나 문제가 발생하면 업데이트하세요.**

## Session History

### 커밋 0a4bb81 — 프로젝트 초기화

**Phase 1: Requirements & Discovery ✅**

**작업 내역**:

1. Create Next App으로 프로젝트 초기화
2. Next.js 16 + React 19 + TypeScript + Tailwind v4 설정

**생성/수정 파일**:

- 프로젝트 전체 초기 파일

---

### 커밋 3ebca67 — 칸반 보드 구현

**Phase 2: Core Implementation 🔄**

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

**Phase 2: Core Implementation 🔄**

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

**Phase 2: Core Implementation ✅**

**작업 내역**:

1. 소프트 크래프트 디자인 리뉴얼
2. 올리브/베이지/오렌지 컬러시스템 적용

**생성/수정 파일**:

- `src/app/globals.css`
- 다수 컴포넌트 스타일 업데이트

---

### 미커밋 변경사항 — 기능 확장

**Phase 3: Feature Enhancement 🔄**

**작업 내역**:

1. ProjectDetail 대규모 리팩토링 (+1099줄 변경)
2. MaterialStash 대규모 확장 (+952줄 변경)
3. FocusHeader 확장 (+325줄 변경)
4. FocusView 리팩토링 (+292줄 변경)
5. KanbanBoard 기능 추가 (+114줄 변경)
6. CompactProjectCard 리디자인 (+82줄 변경)
7. DashboardSidebar 업데이트 (+78줄 변경)
8. ProjectModal 제거 (-683줄)
9. batch-folder API 추가 (projects, materials)
10. Dropdown 컴포넌트 신규 추가
11. logo.svg 추가

**생성/수정 파일**:

- `prisma/schema.prisma` (수정)
- `src/app/api/materials/[id]/route.ts` (수정)
- `src/app/api/materials/route.ts` (수정)
- `src/app/api/materials/batch-folder/route.ts` (신규)
- `src/app/api/projects/batch-folder/route.ts` (수정)
- `src/components/ActiveProjectCard.tsx` (수정)
- `src/components/CompactProjectCard.tsx` (수정)
- `src/components/DashboardSidebar.tsx` (수정)
- `src/components/FocusHeader.tsx` (수정)
- `src/components/FocusSection.tsx` (수정)
- `src/components/FocusView.tsx` (수정)
- `src/components/GalleryCard.tsx` (수정)
- `src/components/KanbanBoard.tsx` (수정)
- `src/components/KanbanColumn.tsx` (수정)
- `src/components/MaterialStash.tsx` (수정)
- `src/components/ProjectDetail.tsx` (수정)
- `src/components/ProjectModal.tsx` (삭제)
- `src/components/Sidebar.tsx` (수정)
- `src/components/Dropdown.tsx` (신규)
- `src/types/project.ts` (수정)
- `public/logo.svg` (신규)

---

### Session 2026-02-28 — 폴더 삭제 확인 팝업

**Phase 3: Feature Enhancement 🔄**

**작업 내역**:

1. 폴더별 보기에서 선택된 폴더 탭에 X(삭제) 버튼 추가
2. `confirm()` 대신 커스텀 삭제 확인 팝업 구현
   - 재료가 있을 때: "폴더만 삭제 (재료는 미분류로 이동)" / "폴더와 재료 모두 삭제" 2가지 옵션
   - 재료가 없을 때: 단순 삭제 확인
3. 전체보기 폴더 섹션의 휴지통 버튼도 동일 팝업 적용
4. `handleDeleteFolder`에 `deleteContents` 파라미터 추가

**생성/수정 파일**:

- `src/components/MaterialStash.tsx` (수정)

### Session 2026-02-28 — 작업 모드 페이지 (콘텐츠 뷰어 + 단수 카운터)

**Phase 3: Feature Enhancement 🔄**

**작업 내역**:

1. PDF 첨부 시 인라인 뷰어로 표시하도록 변경 (ProjectDetail 모달 내)
2. 작업 모드 전용 페이지 신규 구현 (`/project/[id]`)
   - 왼쪽 65%: 콘텐츠 뷰어 (PDF / 이미지 / YouTube) + 썸네일 스트립으로 첨부파일 전환
   - 오른쪽 35%: 단수 카운터(항상 보임, 큰 버튼) + 진행률 슬라이더 + 메모 + URL 링크
   - 전체 뷰포트 높이 활용 (`h-screen`), 콘텐츠 보면서 단수 세기 가능
3. GET `/api/projects/[id]` 핸들러 추가 (단일 프로젝트 조회)
4. ProjectDetail 모달에 "작업 모드" 버튼 추가 (viewable 첨부파일 있을 때만 표시)
5. HTML 중첩 규칙 위반 수정 (`<button>` 안 `<button>` → `<span role="button">`)

**생성/수정 파일**:

- `src/app/project/[id]/page.tsx` (신규 — 작업 모드 페이지)
- `src/app/api/projects/[id]/route.ts` (수정 — GET 핸들러 추가)
- `src/components/ProjectDetail.tsx` (수정 — PDF 인라인 뷰어, 작업 모드 버튼)

---

## 5-Question Reboot Check

작업 재개 시 이 질문들로 컨텍스트 복구:

| Question | Answer |
| --- | --- |
| 1. 현재 어느 단계인가? | Phase 3: Feature Enhancement (작업 모드 페이지 추가 완료, 미커밋 상태) |
| 2. 다음에 할 일은? | 미커밋 변경사항 정리/커밋, 반응형 최적화, 작업 모드 모바일 대응 |
| 3. 목표는? | 뜨개질 프로젝트/재료 관리 올인원 웹 앱 |
| 4. 지금까지 배운 것? | findings.md 참조 |
| 5. 완료한 작업은? | 칸반보드, 대시보드, 재료함, 디자인 리뉴얼, 프로젝트 상세, 작업 모드 페이지 |
