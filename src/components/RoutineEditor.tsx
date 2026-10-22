import { useEffect, useState } from 'react';
import { type Data, type Exercise } from '../model';
import {
  findExercise,
  suggestExercises,
  type CatalogExercise,
} from '../exerciseCatalog';
export function RoutineEditor({
  data,
  change,
}: {
  data: Data;
  change: (fn: (d: Data) => void) => void;
}) {
  const [editing, setEditing] = useState<string | null>(null),
    [draft, setDraft] = useState<Exercise | null>(null),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [removing, setRemoving] = useState<string | null>(null);
  const [autoPart, setAutoPart] = useState<string | null>(null);
  const matched = draft ? findExercise(draft.name) : undefined;
  const suggestions = draft && !matched ? suggestExercises(draft.name) : [];
  function nameChanged(name: string) {
    if (!draft) return;
    const found = findExercise(name);
    setDraft({
      ...draft,
      name,
      part: found ? found.part : autoPart === draft.part ? '' : draft.part,
    });
    setAutoPart(found?.part ?? null);
  }
  function chooseExercise(e: CatalogExercise) {
    if (!draft) return;
    setDraft({ ...draft, name: e.name, en: e.en, part: e.part });
    setAutoPart(e.part);
  }
  const modalOpen = !!draft || !!removing;
  useEffect(() => {
    if (!modalOpen) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = old;
    };
  }, [modalOpen]);
  function edit(e?: Exercise) {
    setAutoPart(null);
    setDraft(
      e
        ? structuredClone(e)
        : {
            id: `custom_${crypto.randomUUID()}`,
            name: '',
            en: '',
            part: '',
            walk: false,
            sets: 2,
            reps: 12,
            how: '',
            caution: '',
          },
    );
    setEditing(e?.id ?? 'new');
    setMessage('');
  }
  function commit() {
    if (!draft || !draft.name.trim()) {
      setMessage('운동 이름을 입력하세요.');
      return;
    }
    const next = { ...draft, name: draft.name.trim() };
    change((d) => {
      if (editing === 'new') d.routine.push(next);
      else d.routine = d.routine.map((e) => (e.id === editing ? next : e));
      d.settings.defaults[next.id] = { sets: next.sets, reps: next.reps };
    });
    setDraft(null);
    setEditing(null);
    setMessage('저장했습니다. 다음에 시작하는 운동부터 적용됩니다.');
  }
  async function photo(file?: File) {
    if (!file || !draft) return;
    setBusy(true);
    setMessage('');
    let url = '';
    try {
      if (!file.type.startsWith('image/') || file.size > 20 * 1024 * 1024)
        throw new Error('20MB 이하의 사진 파일을 선택하세요.');
      url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      await img.decode();
      const scale = Math.min(1, 1000 / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const context = canvas.getContext('2d');
      if (!context) throw new Error('사진을 처리할 수 없습니다.');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(img, 0, 0, canvas.width, canvas.height);
      let value = canvas.toDataURL('image/jpeg', 0.78);
      if (value.length > 700000) value = canvas.toDataURL('image/jpeg', 0.5);
      if (value.length > 700000)
        throw new Error('사진이 너무 큽니다. 작은 사진을 선택하세요.');
      setDraft((d) => (d ? { ...d, photo: value } : d));
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      if (url) URL.revokeObjectURL(url);
      setBusy(false);
    }
  }
  return (
    <section className="exercise routineEditor">
      <div className="sectionTitle">
        <h2>내 루틴 관리</h2>
        <button disabled={data.routine.length >= 50} onClick={() => edit()}>
          ＋ 운동 추가
        </button>
      </div>
      <p className="muted">
        어떤 기구든 이름을 직접 적어 추가하세요. 변경 내용은 다음 운동부터
        적용되며 이전 기록은 그대로 남습니다. 사진은 선택 사항입니다. 이름을
        입력하면 등록된 운동의 부위를 자동으로 채웁니다.
      </p>
      {data.active && (
        <p className="previous">
          진행 중인 운동은 시작할 때의 목록으로 유지됩니다. 새 목록으로 하려면
          운동 취소 후 다시 시작하세요.
        </p>
      )}
      {!data.routine.length && (
        <p>등록된 운동이 없습니다. 운동 추가를 눌러 시작하세요.</p>
      )}
      {data.routine.map((e, i) => (
        <div className="routineItem" key={e.id}>
          <div>
            <strong>
              {i + 1}. {e.name}
            </strong>
            <small>
              {e.walk ? '시간 기록' : '중량·반복 기록'} ·{' '}
              {data.settings.defaults[e.id].sets}세트 ·{' '}
              {data.settings.defaults[e.id].reps}
              {e.walk ? '분' : '회'}
              {e.photo ? ' · 내 사진 있음' : ''}
            </small>
          </div>
          <div className="routineButtons">
            <button
              aria-label={`${e.name} 위로`}
              disabled={i === 0}
              onClick={() =>
                change((d) => {
                  [d.routine[i - 1], d.routine[i]] = [
                    d.routine[i],
                    d.routine[i - 1],
                  ];
                })
              }
            >
              ↑
            </button>
            <button
              aria-label={`${e.name} 아래로`}
              disabled={i === data.routine.length - 1}
              onClick={() =>
                change((d) => {
                  [d.routine[i + 1], d.routine[i]] = [
                    d.routine[i],
                    d.routine[i + 1],
                  ];
                })
              }
            >
              ↓
            </button>
            <button
              onClick={() => {
                const def = data.settings.defaults[e.id];
                edit({ ...e, sets: def.sets, reps: def.reps });
              }}
            >
              수정
            </button>
            <button
              className="danger"
              aria-label={`${e.name} 루틴에서 삭제`}
              onClick={() => setRemoving(e.id)}
            >
              삭제
            </button>
          </div>
        </div>
      ))}
      {message && !draft && <p role="status">{message}</p>}
      {draft && (
        <div className="overlay">
          <section
            className="dialog routineDialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="routineTitle"
          >
            <h2 id="routineTitle">
              {editing === 'new' ? '새 운동 추가' : '운동 수정'}
            </h2>
            <label>
              운동 이름 (필수)
              <input
                autoFocus
                maxLength={80}
                value={draft.name}
                onChange={(e) => nameChanged(e.target.value)}
                placeholder="예: 시티드 로우, 숄더 프레스"
              />
            </label>
            <div className="catalogHelp" aria-live="polite">
              {matched ? (
                <>
                  <p>
                    {autoPart === draft.part
                      ? '운동 부위를 자동으로 채웠어요. 직접 수정할 수 있습니다.'
                      : '등록된 운동 이름이에요. 운동 부위를 직접 수정하거나 자동으로 채울 수 있습니다.'}
                  </p>
                  {autoPart !== draft.part && (
                    <button
                      onClick={() => {
                        setDraft({ ...draft, part: matched.part });
                        setAutoPart(matched.part);
                      }}
                    >
                      운동 부위 자동 채우기
                    </button>
                  )}
                  <p>
                    일반적인 주요 운동 부위이며 자세와 손잡이에 따라 달라질 수
                    있어요.
                  </p>
                </>
              ) : suggestions.length ? (
                <>
                  <p>입력한 이름과 비슷한 운동</p>
                  <div className="catalogOptions">
                    {suggestions.map((e) => (
                      <button key={e.name} onClick={() => chooseExercise(e)}>
                        {e.name}
                        <small>{e.part}</small>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p>
                  {draft.name.trim()
                    ? '일치하는 운동을 찾지 못했어요. 이름을 더 입력하거나 운동 부위를 직접 적어 주세요.'
                    : '운동 이름을 입력하면 운동 부위를 자동으로 채워요. 한글·영어 이름으로 찾을 수 있습니다.'}
                </p>
              )}
            </div>
            <label>
              영어 이름 (선택)
              <input
                maxLength={100}
                value={draft.en}
                onChange={(e) => setDraft({ ...draft, en: e.target.value })}
              />
            </label>
            <label>
              운동 부위 (선택)
              <input
                maxLength={100}
                value={draft.part}
                onChange={(e) => {
                  setDraft({ ...draft, part: e.target.value });
                  setAutoPart(null);
                }}
              />
            </label>
            <label>
              기록 방식
              <select
                value={draft.walk ? 'time' : 'weight'}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    walk: e.target.value === 'time',
                    reps: e.target.value === 'time' ? 5 : 12,
                  })
                }
              >
                <option value="weight">중량(kg)과 반복 횟수</option>
                <option value="time">시간(분)</option>
              </select>
            </label>
            <div className="formPair">
              <label>
                기본 세트
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={draft.sets}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      sets: Math.min(
                        10,
                        Math.max(1, Math.round(Number(e.target.value))),
                      ),
                    })
                  }
                />
              </label>
              <label>
                기본 {draft.walk ? '시간(분)' : '반복(회)'}
                <input
                  type="number"
                  min={1}
                  max={300}
                  value={draft.reps}
                  onFocus={(e) => e.currentTarget.select()}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      reps: Math.min(
                        300,
                        Math.max(1, Math.round(Number(e.target.value))),
                      ),
                    })
                  }
                />
              </label>
            </div>
            <label>
              메모 (선택)
              <textarea
                maxLength={2000}
                value={draft.how}
                onChange={(e) => setDraft({ ...draft, how: e.target.value })}
                placeholder="좌석 높이나 기구 사용 팁"
              />
            </label>
            <label>
              주의사항 (선택)
              <textarea
                maxLength={2000}
                value={draft.caution}
                onChange={(e) =>
                  setDraft({ ...draft, caution: e.target.value })
                }
              />
            </label>
            <label className="fileButton">
              {busy ? '사진 처리 중…' : '내 사진 선택 (선택 사항)'}
              <input
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(e) => {
                  void photo(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </label>
            {draft.photo && (
              <>
                <img
                  className="ownPhotoPreview"
                  src={draft.photo}
                  alt="선택한 내 기구 사진"
                />
                <button
                  onClick={() => setDraft({ ...draft, photo: undefined })}
                >
                  사진 제거
                </button>
              </>
            )}
            {message && <p role="alert">{message}</p>}
            <div className="actions">
              <button
                disabled={busy}
                onClick={() => {
                  setDraft(null);
                  setEditing(null);
                  setMessage('');
                }}
              >
                취소
              </button>
              <button className="primary" disabled={busy} onClick={commit}>
                저장
              </button>
            </div>
          </section>
        </div>
      )}
      {removing && (
        <div className="overlay">
          <section
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-label="루틴에서 운동 삭제"
          >
            <h2>루틴에서 삭제할까요?</h2>
            <p>이전에 저장한 운동 기록과 진행 중인 운동은 유지됩니다.</p>
            <div className="actions">
              <button autoFocus onClick={() => setRemoving(null)}>
                돌아가기
              </button>
              <button
                className="danger"
                onClick={() => {
                  change((d) => {
                    d.routine = d.routine.filter((e) => e.id !== removing);
                    delete d.settings.defaults[removing];
                  });
                  setRemoving(null);
                }}
              >
                루틴에서 삭제
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
