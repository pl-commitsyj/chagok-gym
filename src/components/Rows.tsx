import type { Exercise, Session, SetRow } from '../model';
export function Rows({
  exercise: e,
  session,
  disabled = false,
  onChange,
}: {
  exercise: Exercise;
  session: Session;
  disabled?: boolean;
  onChange: (id: string, i: number, p: Partial<SetRow>) => void;
}) {
  return (
    <div className="sets">
      <div className="setHeader">
        <span>세트</span>
        <span>{e.walk ? '—' : '중량 kg'}</span>
        <span>{e.walk ? '시간 분' : '횟수'}</span>
        <span>완료</span>
      </div>
      {session.exercises[e.id].map((r, i) => (
        <div className={`setRow ${r.done ? 'done' : ''}`} key={i}>
          <span>{i + 1}</span>
          {e.walk ? (
            <span>걷기</span>
          ) : (
            <input
              aria-label={`${e.name} ${i + 1}세트 중량`}
              type="number"
              inputMode="decimal"
              onFocus={(ev) => ev.currentTarget.select()}
              min="0"
              max="1000"
              step="0.5"
              value={r.kg}
              disabled={disabled}
              onChange={(ev) =>
                onChange(e.id, i, {
                  kg: Math.min(1000, Math.max(0, Number(ev.target.value))),
                })
              }
            />
          )}
          <input
            aria-label={`${e.name} ${i + 1}세트 ${e.walk ? '시간' : '횟수'}`}
            type="number"
            inputMode="numeric"
            onFocus={(ev) => ev.currentTarget.select()}
            min="1"
            max="300"
            value={r.reps}
            disabled={disabled}
            onChange={(ev) =>
              onChange(e.id, i, {
                reps: Math.min(
                  300,
                  Math.max(1, Math.round(Number(ev.target.value))),
                ),
              })
            }
          />
          <input
            aria-label={`${e.name} ${i + 1}세트 완료`}
            type="checkbox"
            checked={r.done}
            disabled={disabled}
            onChange={(ev) => onChange(e.id, i, { done: ev.target.checked })}
          />
        </div>
      ))}
    </div>
  );
}
