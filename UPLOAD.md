# 이번 수정본 GitHub에 올리기

1. 휴대폰의 기존 앱에서 **설정 → JSON 내보내기**로 기록을 먼저 보관합니다.
2. PC에서 **배포 → 깃허브에-올릴-파일** 폴더를 엽니다.
3. GitHub의 기존 **chagok-gym** 저장소에서 **Code → Add file → Upload files**를 누릅니다.
4. 폴더 자체가 아니라 **그 안의 src, public, tests와 나머지 파일 전체**를 선택해 끌어 넣습니다. 목록에 `src/App.tsx`, `src/pages/TodayPage.tsx`, `package.json` 등이 보이면 맞습니다.
5. **Commit changes**를 눌러 main 브랜치에 저장합니다.
6. **Actions → Deploy Pages**가 초록색 성공으로 바뀔 때까지 기다립니다.
7. 휴대폰에서 기존 주소를 열고 운동을 종료/취소한 상태에서 **업데이트** 안내가 나오면 누릅니다. 하단에 **차곡 v1.3**이 보이는지 확인합니다.

ZIP을 GitHub에 그대로 올리지 마세요. ZIP은 보관·전달용이며 먼저 압축을 풀어 안의 파일을 올려야 합니다. `dist`, `node_modules`, `_archive` 폴더를 업로드하지 않습니다.

## .github 폴더가 업로드 목록에 안 보일 때

기존 배포가 성공한 저장소에는 deploy.yml이 이미 있습니다. 이번 앱 수정은 기존 workflow로도 배포할 수 있습니다.

자동 테스트까지 배포 전에 실행하려면 Code에서 `.github/workflows/deploy.yml`을 열고 연필(수정)을 눌러, 현재 업로드 폴더의 같은 파일 내용으로 교체하세요. 파일 이름 칸이 아니라 아래 내용 편집 칸에 붙여넣고 Commit changes를 누릅니다. Settings → Pages → Source는 계속 GitHub Actions로 둡니다.

## 기존 저장소의 오래된 파일

기존 저장소에 `public/equipment.svg`, `src/photos.ts`, `public/photos/`, `public/PHOTO-CREDITS.md`가 남아 있다면 현재 앱에서는 사용하지 않습니다. 이전 버전 파일이므로 GitHub에서 정리해도 됩니다. 앱 기록은 휴대폰 브라우저에 저장되며 이 소스 파일들과 별개입니다.

업데이트 후 설치된 앱을 한 번 온라인으로 연 뒤 비행기 모드에서 다시 열어 보세요. 기존 홈 화면 아이콘을 계속 사용하면 됩니다.
