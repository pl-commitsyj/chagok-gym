import { duration, makeSession, type Data } from '../model';
import type { ChangeData, UpdateRow } from '../types';
import { time, date } from '../utils/format';
import { Rows } from '../components/Rows';
import { EquipmentPhoto } from '../components/EquipmentPhoto';
import type { Exercise } from '../model';
export function TodayPage({
  data,
  now,
  change,
  updateRow,
  pause,
  finish,
  onCancel,
  onSettings,
  onPhoto,
}: {
  data: Data;
  now: number;
  change: ChangeData;
  updateRow: UpdateRow;
  pause: () => void;
  finish: () => void;
  onCancel: () => void;
  onSettings: () => void;
  onPhoto: (e: Exercise) => void;
}) {
  const active = data.active;
  const displayRoutine = active?.routine ?? data.routine;
  const count = active ? Object.values(active.exercises).flat() : [];
  const completed = count.filter((s) => s.done).length;
  const photoFor = (id: string) => data.routine.find((e) => e.id === id)?.photo;
  return (
    <>
      <div className="eyebrow">
        MY DAILY ROUTINE <span>{date(now)}</span>
      </div>
      <h1>오늘도, 내 속도로.</h1>
      <p className="subtitle">무리하지 않고 꾸준하게 쌓는 작은 변화</p>
      <section className="hero">
        <div>
          <span className="pill">
            {active ? '운동 진행 중' : '나를 위한 건강한 루틴'}
          </span>
          <h2>
            {active
              ? `${completed} / ${count.length}세트 완료`
              : '가볍게 시작해 볼까요?'}
          </h2>
          <p>
            {active
              ? `운동 시간 ${time(duration(active, now))}`
              : `나만의 루틴 · ${displayRoutine.length}가지 운동`}
          </p>
        </div>
        <div className="heroIcon">↗</div>
        {active ? (
          <>
            <progress value={completed} max={count.length} />
            <div className="actions">
              <button onClick={pause}>
                {active.runningSince === null ? '▶ 다시 시작' : 'Ⅱ 일시정지'}
              </button>
              <button className="primary" onClick={finish}>
                운동 종료
              </button>
              <button className="cancelWorkout" onClick={onCancel}>
                운동 취소
              </button>
            </div>
          </>
        ) : (
          <button
            className="primary"
            disabled={!data.routine.length}
            onClick={() => {
              change((d) => {
                d.active = makeSession(d);
              });
              void navigator.storage?.persist?.();
            }}
          >
            운동 시작하기 <span>→</span>
          </button>
        )}
      </section>

      <div className="sectionTitle">
        <h2>오늘의 루틴</h2>
        <span>천천히, 정확하게</span>
      </div>
      {!displayRoutine.length && (
        <section className="empty">
          <p>설정에서 운동 이름을 추가해 주세요.</p>
          <button onClick={onSettings}>내 루틴 만들기</button>
        </section>
      )}
      {displayRoutine.map((e, i) => (
        <section className="exercise" key={e.id}>
          <div className="exerciseTop">
            <div className="number">{String(i + 1).padStart(2, '0')}</div>
            <div>
              <span className="part">{e.part || '내 운동'}</span>
              <h3>{e.name}</h3>
              {e.en && <p className="english">{e.en}</p>}
            </div>
            <span className="tag">
              {active
                ? `${active.exercises[e.id].length}세트`
                : e.walk
                  ? `${data.settings.defaults[e.id].reps}분`
                  : `${data.settings.defaults[e.id].reps}회 × ${data.settings.defaults[e.id].sets}세트`}
            </span>
          </div>
          <EquipmentPhoto
            exercise={e}
            image={photoFor(e.id)}
            onOpen={() => onPhoto({ ...e, photo: photoFor(e.id) })}
          />
          {(e.how || e.caution) && (
            <details className="guide">
              <summary>
                메모와 주의사항 <span>＋</span>
              </summary>
              {e.how && <p>{e.how}</p>}
              {e.caution && <p className="muted">주의 · {e.caution}</p>}
            </details>
          )}
          {active && (
            <>
              <p className="previous">
                {(() => {
                  const previous = [...data.history]
                    .sort((a, b) => b.started - a.started)
                    .find(
                      (h) =>
                        h.routine.find((p) => p.id === e.id)?.walk === e.walk &&
                        h.exercises[e.id]?.some((r) => r.done),
                    );
                  return previous
                    ? `이전 완료 기록 · ${previous.exercises[e.id]
                        .filter((r) => r.done)
                        .map((r) =>
                          e.walk ? `${r.reps}분` : `${r.kg}kg × ${r.reps}회`,
                        )
                        .join(' / ')}`
                    : '이전 완료 기록이 없어요. 가볍게 시작하세요.';
                })()}
              </p>
              <Rows
                exercise={e}
                session={active}
                disabled={active.runningSince === null}
                onChange={updateRow}
              />
              <div className="setControls">
                <button
                  disabled={active.exercises[e.id].length >= 10}
                  onClick={() =>
                    change((d) => {
                      if (!d.active) return;
                      const rows = d.active.exercises[e.id];
                      const last = rows[rows.length - 1];
                      rows.push({ ...last, done: false });
                    })
                  }
                >
                  ＋ 세트 추가
                </button>
                <button
                  disabled={
                    active.exercises[e.id].length <= 1 ||
                    active.exercises[e.id].at(-1)!.done
                  }
                  onClick={() =>
                    change((d) => {
                      d.active?.exercises[e.id].pop();
                    })
                  }
                >
                  − 마지막 미완료 세트
                </button>
              </div>
            </>
          )}
        </section>
      ))}
      <p className="footnote">
        기록은 이 브라우저에만 저장됩니다. 주기적으로 JSON 백업을 해주세요.
      </p>
    </>
  );
}
