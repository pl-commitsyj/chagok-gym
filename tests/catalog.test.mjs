import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import ts from 'typescript';
const source = await fs.readFile(
  new URL('../src/exerciseCatalog.ts', import.meta.url),
  'utf8',
);
const js = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { findExercise, suggestExercises, exerciseCatalog } = await import(
  `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
);
test('한글·영어·띄어쓰기·브랜드·모델 별칭 일치', () => {
  for (const name of [
    '하이로우',
    '해머스트렝스 하이 로우',
    'Hammer Strength Iso-Lateral High Row',
    'IL-HR',
  ])
    assert.equal(findExercise(name)?.name, '하이 로우');
  assert.match(findExercise('숄더프레스').part, /어깨/);
  assert.equal(findExercise('HIP ABDUCTION').name, '힙 어브덕션');
  assert.equal(findExercise('와이드 그립 랫 풀다운').name, '랫 풀다운');
});
test('다른 운동과 모호한 이름을 임의로 확정하지 않음', () => {
  for (const name of [
    '',
    '해머스트렝스',
    '등 운동',
    '로우',
    '하이 로우 변형',
    '없는 기구',
  ])
    assert.equal(findExercise(name), undefined);
  const choices = suggestExercises('로우');
  assert.ok(choices.some((e) => e.name === '하이 로우'));
  assert.ok(choices.some((e) => e.name === '로우 로우'));
  assert.ok(choices.length <= 5);
  assert.notEqual(findExercise('어브덕터').part, findExercise('어덕터').part);
});
test('목록의 표준 이름과 영어 이름 모두 정확하게 찾음', () => {
  for (const e of exerciseCatalog) {
    assert.equal(findExercise(e.name)?.name, e.name);
    assert.equal(findExercise(e.en)?.name, e.name);
    assert.ok(e.part.length <= 100);
  }
});
