# YarnLog 🧶

나의 뜨개질 프로젝트를 기록하고 관리하는 웹 애플리케이션.

프로젝트 진행 상황 추적, 재료 인벤토리 관리, 작업 중 카운터와 타이머까지 — 뜨개질에 필요한 모든 것을 한 곳에서.

## 주요 기능

### 프로젝트 관리
- **칸반 보드** — 드래그 앤 드롭으로 프로젝트를 할 일 / 진행 중 / 완료 상태로 관리
- **프로젝트 상세** — 실 정보, 바늘, 부자재, 게이지, 난이도, 태그, 메모 등 기록
- **폴더 정리** — 프로젝트를 폴더별로 분류
- **검색 & 정렬** — 제목, 태그로 검색하고 다양한 기준으로 정렬

### 작업 모드
- **코바늘/대바늘 카운터** — 여러 개의 커스텀 카운터로 코 수 관리
- **진행률 트래커** — 0~100% 슬라이더로 진행 상황 추적
- **첨부파일 뷰어** — 도안 이미지, PDF, YouTube 영상을 작업 화면에서 바로 확인
- **메모** — 작업 중 떠오르는 메모를 바로 기록

### 재료함 (Stash)
- **실, 바늘, 부자재** 인벤토리를 한눈에 관리
- **이미지 첨부** — 재료 사진 등록
- **폴더 분류** & 일괄 작업 지원

### 도구
- **작업 타이머** — 사이드바에서 바로 사용
- **게이지 계산기** — 게이지로 필요한 코 수 계산

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Drag & Drop | @dnd-kit |
| Icons | Lucide React |

## 시작하기

### 사전 요구사항

- Node.js 18+
- PostgreSQL 데이터베이스 (또는 [Neon](https://neon.tech) 등 호스팅 DB)

### 설치

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env
# .env 파일에 DATABASE_URL 설정

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### 환경변수

```
DATABASE_URL="postgresql://..."
```

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                 # 대시보드 (메인)
│   ├── project/[id]/page.tsx    # 작업 모드
│   └── api/
│       ├── projects/            # 프로젝트 CRUD
│       ├── materials/           # 재료 CRUD
│       └── upload/              # 파일 업로드
├── components/
│   ├── FocusView.tsx            # 대시보드 메인 뷰
│   ├── KanbanBoard.tsx          # 칸반 보드
│   ├── ProjectDetail.tsx        # 프로젝트 상세/편집
│   ├── MaterialStash.tsx        # 재료함
│   └── DashboardSidebar.tsx     # 사이드바 (타이머, 계산기)
├── hooks/
│   └── useCounters.ts           # 카운터 상태 관리
├── types/
│   └── project.ts               # 타입 정의
└── lib/
    └── prisma.ts                # Prisma 클라이언트
```

## 스크립트

```bash
npm run dev       # 개발 서버
npm run build     # 프로덕션 빌드
npm run start     # 프로덕션 서버
npm run lint      # ESLint 검사
```
