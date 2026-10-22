import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const source = await fs.readFile(
  new URL('../src/model.ts', import.meta.url),
  'utf8',
);
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { initial, makeSession, validate, duration, parseBackup } = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
);
test('기본 백업과 진행 중 운동 JSON 왕복 검증', () => {
  const d = structuredClone(initial);
  d.active = makeSession(d);
  d.active.exercises.chest[0] = { kg: 12.5, reps: 12, done: true };
  const restored = JSON.parse(JSON.stringify(d));
  assert.ok(validate(restored));
  assert.equal(restored.active.exercises.chest[0].kg, 12.5);
});
test('이전 중량 자동 입력과 새 완료 상태 초기화', () => {
  const d = structuredClone(initial);
  const s = makeSession(d);
  s.exercises.chest[0] = { kg: 20, reps: 12, done: true };
  s.ended = Date.now();
  s.runningSince = null;
  d.history = [s];
  const next = makeSession(d);
  assert.equal(next.exercises.chest[0].kg, 20);
  assert.equal(next.exercises.chest[0].done, false);
  assert.ok(validate(d));
});
test('잘못된 버전·범위·누락·중복 기록 거부', () => {
  for (const mutate of [
    (d) => (d.version = 3),
    (d) => (d.settings.rest = 10),
    (d) => (d.settings.defaults.chest.sets = 0),
    (d) => delete d.settings.defaults.lat,
    (d) => {
      const s = makeSession(d);
      s.ended = Date.now();
      s.runningSince = null;
      d.history = [s, s];
    },
    (d) => {
      d.active = makeSession(d);
      d.active.exercises.chest[0].kg = -1;
    },
  ]) {
    const d = structuredClone(initial);
    mutate(d);
    assert.equal(validate(d), false);
  }
});
test('일시정지와 백그라운드 경과 시간', () => {
  const s = makeSession(initial);
  s.elapsed = 5000;
  s.runningSince = 10000;
  assert.equal(duration(s, 40000), 35000);
  s.runningSince = null;
  assert.equal(duration(s, 100000), 5000);
});
test('최근 건너뛴 기구는 이전 완료 중량을 사용', () => {
  const d = structuredClone(initial);
  const older = makeSession(d);
  older.started = 1000;
  older.exercises.chest[0] = { kg: 17.5, reps: 12, done: true };
  older.ended = 2000;
  older.runningSince = null;
  const recent = makeSession(d);
  recent.started = 3000;
  recent.ended = 4000;
  recent.runningSince = null;
  d.history = [recent, older];
  assert.equal(makeSession(d).exercises.chest[0].kg, 17.5);
  assert.ok(validate(d));
});
test('기존 버전 1 백업과 진행 중 운동을 손실 없이 변환', () => {
  const old = JSON.parse(JSON.stringify(initial));
  old.version = 1;
  delete old.routine;
  const active = makeSession(initial);
  active.exercises.chest[0] = { kg: 25, reps: 10, done: true };
  delete active.routine;
  old.active = active;
  const session = makeSession(initial);
  delete session.routine;
  session.ended = Date.now();
  session.runningSince = null;
  old.history = [session];
  const next = parseBackup(old);
  assert.equal(next.version, 2);
  assert.equal(next.active.exercises.chest[0].kg, 25);
  assert.equal(next.history.length, 1);
  assert.equal(next.active.routine[1].name, '체스트 프레스');
  assert.ok(validate(next));
  assert.equal(old.version, 1);
});
test('새 기구 추가·순서 변경·삭제 후에도 예전 이름과 기록 유지', () => {
  const d = structuredClone(initial);
  const added = {
    id: 'custom_row',
    name: '시티드 로우',
    en: '',
    part: '등',
    sets: 2,
    reps: 12,
    walk: false,
    how: '',
    caution: '',
  };
  d.routine.push(added);
  d.settings.defaults.custom_row = { sets: 2, reps: 12 };
  const s = makeSession(d);
  s.exercises.custom_row[0] = { kg: 30, reps: 10, done: true };
  s.ended = Date.now();
  s.runningSince = null;
  d.history = [s];
  d.routine.at(-1).name = '새 이름';
  d.routine.reverse();
  assert.equal(s.routine.at(-1).name, '시티드 로우');
  d.routine = d.routine.filter((e) => e.id !== 'custom_row');
  delete d.settings.defaults.custom_row;
  assert.ok(validate(d));
  assert.equal(d.history[0].exercises.custom_row[0].kg, 30);
  assert.equal(makeSession(d).exercises.custom_row, undefined);
});
test('루틴을 모두 지워도 과거 기록을 복원할 수 있음', () => {
  const d = structuredClone(initial);
  const s = makeSession(d);
  s.runningSince = null;
  s.ended = Date.now();
  d.history = [s];
  d.routine = [];
  d.settings.defaults = {};
  assert.ok(validate(parseBackup(d)));
  assert.equal(d.history[0].routine.length, 7);
});
test('중복 운동 ID·잘못된 사진 URL·다른 운동 세트 삽입 거부', () => {
  for (const mutate of [
    (d) => d.routine.push(d.routine[0]),
    (d) => (d.routine[0].photo = 'https://example.com/photo.jpg'),
    (d) => {
      d.active = makeSession(d);
      d.active.exercises.unknown = [{ kg: 0, reps: 12, done: false }];
    },
  ]) {
    const d = structuredClone(initial);
    mutate(d);
    assert.equal(validate(d), false);
  }
});
