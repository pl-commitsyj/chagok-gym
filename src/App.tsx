import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import {
  duration,
  initial,
  parseBackup,
  type Data,
  type SetRow,
  type Exercise,
} from './model';
import { load, save } from './storage';
import type { InstallPromptEvent } from './types';
import { TodayPage } from './pages/TodayPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { RestTimer } from './components/RestTimer';
export function App() {
  const [data, setData] = useState<Data>(structuredClone(initial)),
    [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [tab, setTab] = useState('today'),
    [now, setNow] = useState(Date.now()),
    [edit, setEdit] = useState<string | null>(null),
    [pending, setPending] = useState<Data | null>(null),
    [notice, setNotice] = useState(''),
    [online, setOnline] = useState(navigator.onLine),
    [install, setInstall] = useState<InstallPromptEvent | null>(null),
    [photo, setPhoto] = useState<Exercise | null>(null),
    [cancelOpen, setCancelOpen] = useState(false);
  const latest = useRef(data),
    queue = useRef(Promise.resolve());
  latest.current = data;
  const {
    needRefresh: [refresh],
    offlineReady: [offline],
    updateServiceWorker,
  } = useRegisterSW();
  useEffect(() => {
    let cancelled = false;
    load()
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setReady(true);
      })
      .catch((e) => {
        if (!cancelled)
          setError(`불러오기 실패: ${e.message}. 새로고침 후 다시 시도하세요.`);
      });
    const t = setInterval(() => setNow(Date.now()), 500);
    const status = () => setOnline(navigator.onLine);
    const prompt = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallPromptEvent);
    };
    addEventListener('online', status);
    addEventListener('offline', status);
    addEventListener('beforeinstallprompt', prompt);
    return () => {
      cancelled = true;
      clearInterval(t);
      removeEventListener('online', status);
      removeEventListener('offline', status);
      removeEventListener('beforeinstallprompt', prompt);
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = data.settings.theme;
  }, [data.settings.theme]);
  useEffect(() => {
    if (!photo) return;
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPhoto(null);
    };
    addEventListener('keydown', escape);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      removeEventListener('keydown', escape);
      document.body.style.overflow = old;
    };
  }, [photo]);
  function change(fn: (d: Data) => void) {
    setNow(Date.now());
    const d = structuredClone(latest.current);
    fn(d);
    latest.current = d;
    setData(d);
    queue.current = queue.current
      .then(() => save(d))
      .then(() => {
        setError('');
      })
      .catch((e) => {
        setError(
          `기기 저장 실패: ${e.message}. 앱을 닫기 전 JSON으로 백업하세요.`,
        );
      });
  }
  const active = data.active;
  function updateRow(id: string, index: number, patch: Partial<SetRow>) {
    change((d) => {
      const s = edit ? d.history.find((h) => h.id === edit) : d.active;
      if (!s) return;
      const was = s.exercises[id][index].done;
      s.exercises[id][index] = { ...s.exercises[id][index], ...patch };
      if (
        !edit &&
        patch.done &&
        !was &&
        s.runningSince !== null &&
        !s.routine.find((e) => e.id === id)?.walk
      )
        s.restEnd = Date.now() + d.settings.rest * 1000;
    });
  }
  function pause() {
    change((d) => {
      if (!d.active) return;
      if (d.active.runningSince !== null) {
        d.active.elapsed = duration(d.active);
        d.active.runningSince = null;
        d.active.restEnd = null;
      } else d.active.runningSince = Date.now();
    });
  }
  function finish() {
    if (
      !confirm(
        '운동을 종료하고 기록에 저장할까요? 완료하지 않은 세트도 함께 보관됩니다.',
      )
    )
      return;
    change((d) => {
      if (!d.active) return;
      d.active.elapsed = duration(d.active);
      d.active.runningSince = null;
      d.active.ended = Date.now();
      d.active.restEnd = null;
      d.history.unshift(d.active);
      d.active = null;
    });
    setTab('history');
  }
  function exportData() {
    const blob = new Blob([JSON.stringify(latest.current, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `차곡-백업-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function restore(file?: File) {
    if (!file) return;
    try {
      if (file.size > 50 * 1024 * 1024)
        throw new Error('50MB 이하 파일을 선택하세요.');
      const v: unknown = JSON.parse(await file.text());
      setPending(parseBackup(v));
    } catch (e) {
      setNotice((e as Error).message);
    }
  }
  if (!ready)
    return (
      <main>
        <h1>차곡</h1>
        <p>{error || '기기에 저장한 운동을 불러오는 중…'}</p>
      </main>
    );
  return (
    <>
      <main>
        <header>
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setTab('today');
              setEdit(null);
            }}
          >
            <span className="logo">↗</span> 차곡
            <span className="brandSub">나의 운동 기록</span>
          </a>
          <span className="status">
            <i /> {online ? '기기 저장' : '오프라인'}
          </span>
        </header>
        {error && (
          <aside role="alert" className="warning">
            {error}
            <button onClick={exportData}>지금 백업</button>
          </aside>
        )}
        {refresh && (
          <aside className="warning">
            새 버전이 준비됐어요.{' '}
            {active ? (
              '운동 종료 후 업데이트해 주세요.'
            ) : (
              <button
                onClick={() => {
                  void queue.current.then(() => updateServiceWorker(true));
                }}
              >
                업데이트
              </button>
            )}
          </aside>
        )}
        <nav className="tabs" aria-label="주 메뉴">
          {[
            ['today', '오늘의 운동'],
            ['history', '운동 기록'],
            ['settings', '설정'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={tab === id ? 'selected' : ''}
              onClick={() => {
                setTab(id);
                setEdit(null);
              }}
            >
              {label}
            </button>
          ))}
        </nav>
        {tab === 'today' && (
          <TodayPage
            data={data}
            now={now}
            change={change}
            updateRow={updateRow}
            pause={pause}
            finish={finish}
            onCancel={() => setCancelOpen(true)}
            onSettings={() => setTab('settings')}
            onPhoto={setPhoto}
          />
        )}
        {tab === 'history' && (
          <HistoryPage
            data={data}
            edit={edit}
            setEdit={setEdit}
            change={change}
            updateRow={updateRow}
            onToday={() => setTab('today')}
          />
        )}
        {tab === 'settings' && (
          <SettingsPage
            data={data}
            change={change}
            offline={offline}
            install={install}
            onInstalled={() => setInstall(null)}
            exportData={exportData}
            restore={restore}
            notice={notice}
          />
        )}
        <footer>
          차곡 v1.3 <span>조금씩, 꾸준히. 나의 건강한 일상.</span>
        </footer>
      </main>
      <RestTimer
        data={data}
        now={now}
        visible={tab === 'today'}
        change={change}
      />
      {photo && (
        <div className="overlay" onClick={() => setPhoto(null)}>
          <section
            className="dialog photoDialog"
            role="dialog"
            aria-modal="true"
            aria-label="기구 사진 확대"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="closePhoto"
              autoFocus
              onClick={() => setPhoto(null)}
            >
              사진 닫기 ✕
            </button>
            <img src={photo.photo} alt={`${photo.name} 내 사진`} />
            <p>{photo.name} · 내 기구 사진</p>
          </section>
        </div>
      )}
      {cancelOpen && (
        <div className="overlay">
          <section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancelTitle"
          >
            <h2 id="cancelTitle">지금 운동을 취소할까요?</h2>
            <p>
              진행 중인 운동의 입력과 타이머를 지우고 시작 전 화면으로
              돌아갑니다. 이전에 저장한 운동 기록은 유지됩니다.
            </p>
            <div className="actions">
              <button autoFocus onClick={() => setCancelOpen(false)}>
                계속 운동하기
              </button>
              <button
                className="danger"
                onClick={() => {
                  change((d) => {
                    d.active = null;
                  });
                  setCancelOpen(false);
                }}
              >
                운동 취소 확인
              </button>
            </div>
          </section>
        </div>
      )}
      {pending && (
        <div className="overlay">
          <section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="restoreTitle"
          >
            <h2 id="restoreTitle">백업을 복원할까요?</h2>
            <p>
              기록 {pending.history.length}개와 설정을 가져옵니다. 현재 기록과
              진행 중인 운동을 모두 덮어씁니다. 먼저 현재 데이터를 백업하는 것을
              권장합니다.
            </p>
            <div className="actions">
              <button onClick={exportData}>현재 데이터 백업</button>
              <button onClick={() => setPending(null)}>취소</button>
              <button
                className="primary"
                onClick={() => {
                  const next = structuredClone(pending);
                  if (next.active?.runningSince !== null && next.active) {
                    next.active.elapsed = duration(next.active);
                    next.active.runningSince = null;
                    next.active.restEnd = null;
                  }
                  change((d) => Object.assign(d, next));
                  setPending(null);
                  setNotice(
                    '복원했습니다. 진행 중 운동은 일시정지 상태입니다.',
                  );
                  setEdit(null);
                }}
              >
                덮어쓰고 복원
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
