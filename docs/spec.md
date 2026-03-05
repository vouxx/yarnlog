# Feature Specification: YarnLog

<!-- 뜨개질 프로젝트/재료 관리 올인원 웹 앱 -->

## Overview

뜨개질 작업자가 프로젝트 진행 상황, 재료 인벤토리, 작업 중 카운터/타이머를 한 곳에서 관리할 수 있는 웹 앱.

## User Scenarios & Acceptance Criteria

### US-1: 프로젝트 관리

> As a 뜨개질 작업자,
> I 프로젝트를 생성하고 상태별로 관리할 수 있다,
> So that 여러 작업을 체계적으로 추적할 수 있다.

**Scenario: 프로젝트 생성**

- Given 메인 대시보드에 있을 때
- When 새 프로젝트를 생성하면
- Then 칸반 보드의 "할 일" 컬럼에 카드가 추가된다

**Scenario: 프로젝트 상태 변경**

- Given 칸반 보드에 프로젝트가 있을 때
- When 카드를 다른 컬럼으로 드래그하면
- Then 상태가 변경된다 (todo → in-progress → done)

**Scenario: 프로젝트 상세 편집**

- Given 프로젝트 카드를 클릭했을 때
- When 상세 정보(실, 바늘, 게이지, 난이도 등)를 입력하면
- Then 정보가 저장되고 카드에 반영된다

### US-2: 작업 모드

> As a 뜨개질 작업자,
> I 도안을 보면서 동시에 코 수를 셀 수 있다,
> So that 작업 흐름이 끊기지 않는다.

**Scenario: 콘텐츠 보며 카운터 사용**

- Given 작업 모드 페이지(`/project/[id]`)에 있을 때
- When 왼쪽에서 도안(이미지/PDF/YouTube)을 보면서 오른쪽 카운터를 조작하면
- Then 카운터 값이 즉시 반영되고 자동 저장된다

**Scenario: 첨부파일 전환**

- Given 여러 첨부파일이 있을 때
- When 하단 썸네일 스트립에서 다른 파일을 클릭하면
- Then 콘텐츠 뷰어가 해당 파일로 전환된다

### US-3: 재료함 관리

> As a 뜨개질 작업자,
> I 보유한 실, 바늘, 부자재를 인벤토리로 관리할 수 있다,
> So that 어떤 재료가 있는지 한눈에 파악할 수 있다.

**Scenario: 재료 등록**

- Given 재료함 탭에 있을 때
- When 새 재료(실/바늘/부자재)를 등록하면
- Then 타입별 목록에 표시된다

**Scenario: 폴더 정리**

- Given 재료가 여러 개 있을 때
- When 폴더를 만들어 재료를 분류하면
- Then 폴더별로 필터링하여 볼 수 있다

**Scenario: 폴더 삭제**

- Given 재료가 포함된 폴더를 삭제할 때
- When 삭제 버튼을 누르면
- Then "폴더만 삭제(재료는 미분류로)" / "폴더와 재료 모두 삭제" 옵션이 표시된다

### US-4: 도구

> As a 뜨개질 작업자,
> I 작업 시간과 게이지 계산을 할 수 있다,
> So that 작업 효율을 높일 수 있다.

**Scenario: 게이지 계산**

- Given 사이드바 게이지 계산기에서
- When 게이지와 원하는 너비를 입력하면
- Then 필요한 코 수가 계산된다

## Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | 프로젝트 CRUD (생성/조회/수정/삭제) | MUST |
| FR-2 | 칸반 보드 드래그앤드롭 상태 관리 (todo/in-progress/done) | MUST |
| FR-3 | 프로젝트 상세: 실, 바늘, 부자재, 게이지, 난이도(1~5), 태그, 메모 | MUST |
| FR-4 | 폴더 기반 정리 (프로젝트, 재료) | MUST |
| FR-5 | 검색 & 정렬 | MUST |
| FR-6 | 진행률 트래커 (0~100%) | MUST |
| FR-7 | 시작일/종료일 | SHOULD |
| FR-8 | 작업 모드 split view (콘텐츠 뷰어 + 카운터) | MUST |
| FR-9 | 다중 커스텀 카운터 (코바늘/대바늘) | MUST |
| FR-10 | 첨부파일 뷰어 (이미지, PDF, YouTube) | MUST |
| FR-11 | 첨부파일 업로드 + YouTube/URL 링크 | MUST |
| FR-12 | 재료 CRUD (실/바늘/부자재) | MUST |
| FR-13 | 재료 이미지 첨부 | SHOULD |
| FR-14 | 폴더 일괄 작업 (batch-folder) | SHOULD |
| FR-15 | 작업 타이머 | SHOULD |
| FR-16 | 게이지 계산기 | SHOULD |
| FR-17 | 반응형 모바일 레이아웃 | SHOULD |
| FR-18 | 작업 모드 모바일 대응 | SHOULD |
| FR-19 | 인증/로그인 | SHOULD |
| FR-20 | 다크 모드 | SHOULD |

## Constraints

| ID | Constraint | Priority |
|----|-----------|----------|
| CON-1 | UI 언어는 한국어 | MUST |
| CON-2 | 디자인: 소프트 크래프트 톤 (올리브/베이지/오렌지) | MUST |
| CON-3 | 폰트: Geist (sans) + Noto Serif KR (serif) | MUST |
| CON-4 | 파일 업로드 최대 10MB (JPEG/PNG/GIF/WebP/PDF) | MUST |

## Success Criteria

| ID | Criteria |
|----|----------|
| SC-1 | 프로젝트를 생성하고 칸반 보드에서 드래그앤드롭으로 상태 관리 가능 |
| SC-2 | 작업 모드에서 도안을 보면서 카운터를 동시에 사용 가능 |
| SC-3 | 재료함에서 실/바늘/부자재를 등록하고 폴더별로 관리 가능 |
| SC-4 | 모바일에서도 핵심 기능 사용 가능 |

## API Specification

<!-- OpenAPI 형식 대신 테이블로 정리 -->

| Method | Path | 설명 |
|--------|------|------|
| GET/POST | `/api/projects` | 프로젝트 목록 / 생성 |
| GET/PATCH/DELETE | `/api/projects/[id]` | 프로젝트 조회 / 수정 / 삭제 |
| PATCH/DELETE | `/api/projects/batch-folder` | 일괄 폴더 이동/삭제 |
| GET/POST/PATCH/DELETE | `/api/materials` | 재료 CRUD + 일괄 작업 |
| PATCH/DELETE | `/api/materials/[id]` | 재료 개별 수정/삭제 |
| PATCH/DELETE | `/api/materials/batch-folder` | 일괄 폴더 이동/삭제 |
| POST | `/api/upload` | 파일 업로드 |

## Out of Scope

<!-- 이 문서에 포함하지 않는 항목. plan.md, findings.md에서 다룹니다. -->

- 도메인 모델 상세 (→ findings.md)
- 코드 예시 및 구현 상세 (→ plan.md)
- 디렉토리 구조 (→ plan.md)
