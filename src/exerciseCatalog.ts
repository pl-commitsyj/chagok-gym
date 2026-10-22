export type CatalogExercise = {
  name: string;
  en: string;
  part: string;
  aliases: string[];
};
// General muscle groups, not a claim about isolated activation or individual suitability.
// References: official Hammer Strength product descriptions and ACE exercise library.
const entries: [string, string, string, string[]][] = [
  [
    '체스트 프레스',
    'Chest Press',
    '가슴(대흉근) · 어깨 앞쪽 · 팔 뒤쪽(삼두근)',
    ['가슴 프레스', '벤치 프레스', 'bench press'],
  ],
  [
    '인클라인 프레스',
    'Incline Press',
    '가슴(상부 중심) · 어깨 앞쪽 · 삼두근',
    ['인클라인 체스트 프레스', 'incline chest press'],
  ],
  ['디클라인 프레스', 'Decline Press', '가슴 · 어깨 앞쪽 · 삼두근', []],
  [
    '숄더 프레스',
    'Shoulder Press',
    '어깨(삼각근) · 팔 뒤쪽(삼두근)',
    ['쇼울더 프레스', '어깨 프레스'],
  ],
  [
    '레터럴 레이즈',
    'Lateral Raise',
    '어깨 옆쪽(삼각근)',
    ['사이드 레터럴 레이즈', '사이드 레이즈'],
  ],
  [
    '리버스 펙 덱',
    'Reverse Pec Deck',
    '어깨 뒤쪽 · 등(견갑골 주변)',
    ['리버스 펙덱', '리어 델트', 'rear delt', 'rear deltoid'],
  ],
  [
    '펙 덱 플라이',
    'Pec Deck Fly',
    '가슴(대흉근)',
    ['펙덱', '펙덱 플라이', '체스트 플라이', 'chest fly', 'pec fly'],
  ],
  [
    '랫 풀다운',
    'Lat Pulldown',
    '등(광배근 중심) · 팔 앞쪽(이두근)',
    [
      '렛풀다운',
      '랫풀다운',
      '와이드 그립 랫 풀다운',
      'wide grip lat pulldown',
      'lat pull down',
    ],
  ],
  [
    '시티드 로우',
    'Seated Row',
    '등(광배근·견갑골 주변) · 팔 앞쪽(이두근)',
    ['시티드 케이블 로우', '케이블 로우', 'seated cable row', 'cable row'],
  ],
  [
    '하이 로우',
    'High Row',
    '등(광배근·등 위쪽) · 팔 앞쪽(이두근)',
    ['하이로우', 'IL-HR', 'MTSHR'],
  ],
  [
    '로우 로우',
    'Low Row',
    '등(광배근·견갑골 주변) · 팔 앞쪽(이두근)',
    ['로우로우', '로우 로', 'IL-LR'],
  ],
  [
    '아이소 래터럴 로우',
    'Iso-Lateral Row',
    '등(광배근·견갑골 주변) · 팔 앞쪽(이두근)',
    ['아이소 레터럴 로우', 'iso lateral rowing', 'IL-ROW'],
  ],
  [
    '프론트 풀다운',
    'Front Pulldown',
    '등(광배근 중심) · 팔 앞쪽(이두근)',
    ['프론트 랫 풀다운', 'front lat pulldown', 'IL-PD'],
  ],
  [
    '풀업',
    'Pull Up',
    '등(광배근 중심) · 팔 앞쪽(이두근)',
    ['턱걸이', '어시스트 풀업', 'assisted pull up'],
  ],
  ['레그 프레스', 'Leg Press', '허벅지 앞쪽(대퇴사두근) · 엉덩이(둔근)', []],
  ['핵 스쿼트', 'Hack Squat', '허벅지 앞쪽 · 엉덩이', ['핵스쿼트']],
  [
    '레그 익스텐션',
    'Leg Extension',
    '허벅지 앞쪽(대퇴사두근)',
    ['레그익스텐션'],
  ],
  [
    '시티드 레그 컬',
    'Seated Leg Curl',
    '허벅지 뒤쪽(햄스트링)',
    ['시티드 레그컬'],
  ],
  [
    '라잉 레그 컬',
    'Lying Leg Curl',
    '허벅지 뒤쪽(햄스트링)',
    ['라잉 레그컬', '프론 레그 컬', 'prone leg curl'],
  ],
  ['레그 컬', 'Leg Curl', '허벅지 뒤쪽(햄스트링)', ['레그컬']],
  [
    '힙 어브덕션',
    'Hip Abduction',
    '엉덩이 바깥쪽(중둔근 등)',
    ['어브덕터', '힙 어브덕터', '아웃타이', 'abductor'],
  ],
  [
    '힙 어덕션',
    'Hip Adduction',
    '허벅지 안쪽(내전근)',
    ['어덕터', '힙 어덕터', '이너타이', 'adductor'],
  ],
  [
    '힙 쓰러스트',
    'Hip Thrust',
    '엉덩이(대둔근 중심)',
    ['힙 스러스트', '글루트 드라이브', 'glute drive'],
  ],
  [
    '카프 레이즈',
    'Calf Raise',
    '종아리(비복근·가자미근)',
    ['시티드 카프 레이즈', 'standing calf raise', 'seated calf raise'],
  ],
  [
    '바이셉스 컬',
    'Biceps Curl',
    '팔 앞쪽(이두근)',
    ['바이셉 컬', '암 컬', '이두 컬', 'arm curl', '프리처 컬', 'preacher curl'],
  ],
  [
    '트라이셉스 익스텐션',
    'Triceps Extension',
    '팔 뒤쪽(삼두근)',
    [
      '트라이셉 익스텐션',
      '트라이셉스 프레스다운',
      '푸시다운',
      'triceps pushdown',
    ],
  ],
  [
    '앱도미널 크런치',
    'Abdominal Crunch',
    '복부(복직근 중심)',
    ['복근 머신', '크런치', 'ab crunch'],
  ],
  [
    '러닝머신 걷기',
    'Treadmill Walk',
    '전신 · 하체(걷기)',
    ['트레드밀', '러닝머신', '마무리 걷기', 'treadmill'],
  ],
  [
    '실내 자전거',
    'Stationary Bike',
    '하체 중심 · 유산소',
    ['사이클', '싸이클', '바이크', 'exercise bike'],
  ],
];
export const exerciseCatalog: CatalogExercise[] = entries.map(
  ([name, en, part, aliases]) => ({ name, en, part, aliases }),
);
export function normalizeName(value: string) {
  return value
    .toLowerCase()
    .replace(
      /hammer\s*strength|해머\s*스트[렝랭]스|라이프\s*피트니스|life\s*fitness/g,
      '',
    )
    .replace(
      /아이소\s*[래레]터럴|iso[\s-]*lateral|plate[\s-]*loaded|플레이트\s*로[디드]+|mts/gi,
      '',
    )
    .replace(/[^a-z0-9가-힣]/g, '');
}
const names = (e: CatalogExercise) =>
  [e.name, e.en, ...e.aliases].map(normalizeName);
export function findExercise(value: string) {
  const q = normalizeName(value);
  const bare = value
    .toLowerCase()
    .replace(/hammer\s*strength|해머\s*스트[렝랭]스/g, '')
    .replace(/[^a-z가-힣]/g, '');
  if (!q || ['로우', 'row'].includes(bare)) return undefined;
  return exerciseCatalog.find((e) => names(e).includes(q));
}
export function suggestExercises(value: string) {
  const q = normalizeName(value);
  if (q.length < 2) return [];
  return exerciseCatalog
    .filter((e) => names(e).some((n) => n.includes(q)))
    .slice(0, 5);
}
