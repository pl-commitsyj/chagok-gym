import type { Data } from '../model';
import type { ChangeData } from '../types';
export function RestTimer({
  data,
  now,
  visible,
  change,
}: {
  data: Data;
  now: number;
  visible: boolean;
  change: ChangeData;
}) {
  const active = data.active;
  const rest = active?.restEnd
    ? Math.max(
        0,
        Math.ceil((active.restEnd - Math.max(now, Date.now())) / 1000),
      )
    : 0;
  return (
    <>
      {active?.restEnd !== null && active?.restEnd !== undefined && visible && (
        <aside className="rest" role="timer" aria-label="휴식 타이머">
          <div>
            <span>세트 사이, 잠깐의 휴식</span>
            <strong>
              {rest > 0
                ? `${Math.floor(rest / 60)}:${String(rest % 60).padStart(2, '0')}`
                : '휴식 완료'}
            </strong>
          </div>
          <div className="restActions">
            <select
              aria-label="휴식 시간"
              value={data.settings.rest}
              onChange={(e) =>
                change((d) => {
                  d.settings.rest = Number(e.target.value);
                  if (d.active)
                    d.active.restEnd = Date.now() + d.settings.rest * 1000;
                })
              }
            >
              {[60, 90, 120].map((s) => (
                <option key={s} value={s}>
                  {s}초
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                change((d) => {
                  if (d.active)
                    d.active.restEnd = Date.now() + d.settings.rest * 1000;
                })
              }
            >
              다시
            </button>
            <button
              onClick={() =>
                change((d) => {
                  if (d.active) d.active.restEnd = null;
                })
              }
            >
              건너뛰기
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
