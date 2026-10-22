import type { Data, Session } from '../model';
import type { ChangeData, UpdateRow } from '../types';
import { time, date } from '../utils/format';
import { Rows } from '../components/Rows';
export function HistoryPage({
  data,
  edit,
  setEdit,
  change,
  updateRow,
  onToday,
}: {
  data: Data;
  edit: string | null;
  setEdit: (id: string | null) => void;
  change: ChangeData;
  updateRow: UpdateRow;
  onToday: () => void;
}) {
  const target = edit ? data.history.find((h) => h.id === edit) : undefined;
  return (
    <>
      <div className="eyebrow">YOUR PROGRESS</div>
      <h1>차곡차곡 쌓인 기록</h1>
      <p className="subtitle">
        총 {data.history.length}번, 나를 위해 움직였어요.
      </p>
      {edit && target ? (
        <section className="exercise">
          <div className="sectionTitle">
            <h2>{date(target.started)} 기록 수정</h2>
            <button onClick={() => setEdit(null)}>수정 마치기</button>
          </div>
          <p className="muted">변경 내용은 자동 저장됩니다.</p>
          <label>
            운동 날짜{' '}
            <input
              type="date"
              value={`${new Date(target.started).getFullYear()}-${String(new Date(target.started).getMonth() + 1).padStart(2, '0')}-${String(new Date(target.started).getDate()).padStart(2, '0')}`}
              onChange={(e) => {
                if (e.target.value)
                  change((d) => {
                    const s = d.history.find((h) => h.id === edit)!;
                    s.started = new Date(
                      `${e.target.value}T12:00:00`,
                    ).getTime();
                    s.ended = s.started + s.elapsed;
                  });
              }}
            />
          </label>
          <label>
            총 운동 시간 (분)
            <input
              type="number"
              min="0"
              max="1440"
              value={Math.round(target.elapsed / 60000)}
              onChange={(e) =>
                change((d) => {
                  const s = d.history.find((h) => h.id === edit)!;
                  s.elapsed =
                    Math.min(1440, Math.max(0, Number(e.target.value))) * 60000;
                  s.ended = s.started + s.elapsed;
                })
              }
            />
          </label>
          {target.routine.map((e) => (
            <div key={e.id}>
              <h3>{e.name}</h3>
              <Rows exercise={e} session={target} onChange={updateRow} />
            </div>
          ))}
        </section>
      ) : data.history.length ? (
        [...data.history]
          .sort((a, b) => b.started - a.started)
          .map((h, idx, all) => {
            const prev = all[idx + 1];
            const volume = (s: Session) =>
              Object.entries(s.exercises).reduce(
                (sum, [id, rows]) =>
                  sum +
                  (s.routine.find((e) => e.id === id)?.walk
                    ? 0
                    : rows.reduce(
                        (n, r) => n + (r.done ? r.kg * r.reps : 0),
                        0,
                      )),
                0,
              );
            return (
              <section className="exercise" key={h.id}>
                <div className="sectionTitle">
                  <h2>{date(h.started)}</h2>
                  <span>{time(h.elapsed)}</span>
                </div>
                <p className="comparison">
                  {prev
                    ? `이전 대비 완료 세트 중량 합계 ${volume(h) - volume(prev) >= 0 ? '+' : ''}${(volume(h) - volume(prev)).toFixed(1)} kg·회`
                    : '첫 번째 운동 기록이에요.'}
                </p>
                {h.routine.map((e) => (
                  <div className="historyRow" key={e.id}>
                    <strong>{e.name}</strong>
                    <span>
                      {h.exercises[e.id]
                        .map(
                          (r, i) =>
                            `${i + 1}: ${e.walk ? `${r.reps}분` : `${r.kg}kg × ${r.reps}회`}${r.done ? ' ✓' : ' (미완료)'}`,
                        )
                        .join(' / ')}
                    </span>
                    {prev?.exercises[e.id] &&
                      prev.routine.find((p) => p.id === e.id)?.walk ===
                        e.walk && (
                        <small>
                          이전:{' '}
                          {prev.exercises[e.id]
                            .map((r) =>
                              e.walk
                                ? `${r.reps}분`
                                : `${r.kg}kg × ${r.reps}회`,
                            )
                            .join(' / ')}
                        </small>
                      )}
                  </div>
                ))}
                <div className="actions">
                  <button onClick={() => setEdit(h.id)}>기록 수정</button>
                  <button
                    className="danger"
                    onClick={() => {
                      if (confirm('이 운동 기록을 삭제할까요?'))
                        change((d) => {
                          d.history = d.history.filter((s) => s.id !== h.id);
                        });
                    }}
                  >
                    삭제
                  </button>
                </div>
              </section>
            );
          })
      ) : (
        <section className="empty">
          <span>◷</span>
          <h2>첫 기록을 기다리고 있어요</h2>
          <p>오늘의 운동을 시작하고 종료하면 여기에 쌓여요.</p>
          <button onClick={onToday}>오늘의 운동으로</button>
        </section>
      )}
    </>
  );
}
