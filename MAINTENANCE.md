# 차곡 코드 수정 안내

현재 개발 소스는 프로젝트 맨 위의 `src`입니다. `_archive`는 이전 작업 보관용이고, `배포`는 현재 소스로 만든 업로드용 사본입니다. 수정은 `src`에서 하고 배포 파일을 다시 생성하세요.

| 수정할 내용 | 파일 |
| --- | --- |
| 앱 진입점 | src/main.tsx |
| 공통 상태·저장·운동 시작/종료·백업/복원 | src/App.tsx |
| 오늘의 운동 카드와 진행 화면 | src/pages/TodayPage.tsx |
| 지난 기록 보기·수정 | src/pages/HistoryPage.tsx |
| 설정·백업 버튼·설치 안내 | src/pages/SettingsPage.tsx |
| 운동 추가/수정·사진 선택·자동 부위 입력 | src/components/RoutineEditor.tsx |
| 세트 입력 표 | src/components/Rows.tsx |
| 휴식 타이머 | src/components/RestTimer.tsx |
| 접힌 사진 표시 | src/components/EquipmentPhoto.tsx |
| 기본 운동·데이터 형식·검증·기존 백업 변환 | src/model.ts |
| 운동 이름 별칭과 자동 운동 부위 목록 | src/exerciseCatalog.ts |
| IndexedDB 읽기/쓰기 | src/storage.ts |
| 공통 타입·날짜/시간 표시 | src/types.ts, src/utils/format.ts |
| 색상·배치·모바일 스타일 | src/style.css |
| PWA·캐시·아이콘 설정 | vite.config.ts, public/ |
| GitHub 자동 배포 | .github/workflows/deploy.yml |

## 수정 후 확인

Node.js 22 이상을 사용합니다. 처음에는 `npm ci`로 개발 도구를 설치하세요.

1. `npm run format` — 일정한 들여쓰기와 줄바꿈으로 정리합니다.
2. `npm run format:check` — 형식을 검사합니다.
3. `npm test` — 백업 변환·기록 보존·이름 검색을 검사합니다.
4. `npm run build` — 타입·사용하지 않는 코드·PWA 빌드를 검사합니다.
5. `npm run preview` — 배포 결과를 확인합니다.

## 기록 호환성

- 앱 표시 버전(현재 1.3.0)과 백업의 `version: 2`는 서로 다른 값입니다. 백업 버전을 표시 버전에 맞춰 바꾸면 안 됩니다.
- IndexedDB 이름 `chagok-gym`, 저장 키 `state/main`은 기존 사용자 기록을 불러오는 데 필요합니다.
- `parseBackup`의 버전 1 변환 코드는 기존 사용자 기록과 백업을 지원하므로 유지합니다.
- Session의 routine은 운동 시작 당시 이름과 목록을 보관합니다. 현재 루틴을 수정해도 과거 기록을 다시 쓰지 않습니다.
- 사진은 현재 루틴에 한 번만 저장하고 기록마다 복제하지 않습니다.
- 입력 저장은 순서대로 실행합니다. 캐시 업데이트와 운동 기록 저장소는 별개입니다.

## 배포 파일

`npm run build` 후 Python이 있는 개발 환경에서 `python scripts/package.py`를 실행하면 `배포/깃허브에-올릴-파일`과 업로드 ZIP을 만듭니다. 허용한 소스 파일만 묶으므로 node_modules, 브라우저 기록, 이전 작업 보관본이 포함되지 않습니다.

`_archive`의 임시 수정 스크립트는 과거 버전 전용입니다. 다시 실행하지 마세요.
