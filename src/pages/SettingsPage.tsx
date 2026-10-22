import type { Data } from '../model';
import type { ChangeData, InstallPromptEvent } from '../types';
import { RoutineEditor } from '../components/RoutineEditor';
export function SettingsPage({
  data,
  change,
  offline,
  install,
  onInstalled,
  exportData,
  restore,
  notice,
}: {
  data: Data;
  change: ChangeData;
  offline: boolean;
  install: InstallPromptEvent | null;
  onInstalled: () => void;
  exportData: () => void;
  restore: (file?: File) => Promise<void>;
  notice: string;
}) {
  return (
    <>
      <div className="eyebrow">MAKE IT YOURS</div>
      <h1>나에게 맞게 설정</h1>
      <RoutineEditor data={data} change={change} />
      <section className="exercise">
        <h2>휴식과 화면</h2>
        <label>
          기본 휴식 시간
          <select
            value={data.settings.rest}
            onChange={(e) =>
              change((d) => {
                d.settings.rest = Number(e.target.value);
              })
            }
          >
            {[60, 90, 120].map((s) => (
              <option key={s} value={s}>
                {s}초
              </option>
            ))}
          </select>
        </label>
        <label>
          화면 모드
          <select
            value={data.settings.theme}
            onChange={(e) =>
              change((d) => {
                d.settings.theme = e.target.value as 'light' | 'dark';
              })
            }
          >
            <option value="light">라이트</option>
            <option value="dark">다크</option>
          </select>
        </label>
      </section>
      <section className="exercise">
        <h2>내 데이터 백업</h2>
        <p>
          기록, 설정, 진행 중인 운동을 JSON 파일로 보관합니다. 브라우저 데이터
          삭제나 휴대폰 변경 전 꼭 백업하세요.
        </p>
        <div className="actions">
          <button onClick={exportData}>↓ JSON 내보내기</button>
          <label className="fileButton">
            ↑ JSON 복원
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                void restore(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
        </div>
        {notice && <p role="status">{notice}</p>}
      </section>
      <section className="exercise">
        <h2>앱으로 사용하기</h2>
        <p>
          {offline || !!navigator.serviceWorker?.controller
            ? '오프라인 준비 완료'
            : '첫 온라인 방문에서 앱 파일을 저장합니다.'}
        </p>
        {install ? (
          <button
            onClick={async () => {
              await install.prompt();
              onInstalled();
            }}
          >
            홈 화면에 설치
          </button>
        ) : (
          <p>
            Chrome 메뉴(⋮) → 홈 화면에 추가 → 설치. 삼성 인터넷은 메뉴(☰) →
            현재 페이지 추가 → 홈 화면을 이용하세요.
          </p>
        )}
        <p className="muted">
          사진 없이 운동 이름만으로 사용할 수 있습니다. 직접 찍은 사진은 내 루틴
          관리 → 수정 → 내 사진 선택에서 추가하세요. 사진은 기기에만 저장됩니다.
        </p>
      </section>
    </>
  );
}
