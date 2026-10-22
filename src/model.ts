export const routine = [
 {id:'warmup',name:'러닝머신 걷기',en:'Treadmill Walk',part:'워밍업 · 전신',reps:5,sets:1,walk:true,how:'편안한 속도로 5~10분 걷습니다. 손잡이는 균형을 잡을 때만 가볍게 잡으세요.',caution:'갑자기 속도를 올리지 말고, 어지러우면 안전하게 멈추세요.'},
 {id:'chest',name:'체스트 프레스',en:'Chest Press',part:'가슴 · 팔 뒤쪽',reps:12,sets:3,walk:false,how:'손잡이가 가슴 높이에 오도록 좌석을 조절하고 등을 기대어 천천히 밀고 돌아옵니다.',caution:'허리를 젖히거나 어깨를 올리지 말고 팔꿈치를 끝까지 잠그지 마세요.'},
 {id:'lat',name:'와이드 그립 랫 풀다운',en:'Wide Grip Lat Pulldown',part:'등 · 팔 앞쪽',reps:12,sets:3,walk:false,how:'허벅지를 패드에 고정하고 바를 어깨보다 넓게 잡아 가슴 위쪽으로 당깁니다.',caution:'목 뒤로 당기거나 상체를 크게 젖히지 마세요.'},
 {id:'extension',name:'레그 익스텐션',en:'Leg Extension',part:'허벅지 앞쪽',reps:12,sets:3,walk:false,how:'무릎과 기구 회전축을 맞추고 발목 위에 패드를 두어 천천히 다리를 폅니다.',caution:'반동을 쓰거나 무릎을 강하게 잠그지 마세요.'},
 {id:'curl',name:'시티드 레그 컬',en:'Seated Leg Curl',part:'허벅지 뒤쪽',reps:12,sets:3,walk:false,how:'등을 기대고 허벅지를 고정한 뒤 무릎을 굽혀 패드를 아래로 당깁니다.',caution:'골반이 들리거나 허리가 말리지 않게 하세요.'},
 {id:'hip',name:'힙 어브덕션',en:'Hip Abduction',part:'엉덩이 바깥쪽',reps:15,sets:3,walk:false,how:'등과 골반을 지지한 상태로 무릎을 천천히 벌리고 제자리로 돌아옵니다.',caution:'상체를 숙여 반동을 주지 말고 통증 없는 범위에서 움직이세요.'},
 {id:'cooldown',name:'마무리 걷기',en:'Cool-down Walk',part:'쿨다운 · 전신',reps:5,sets:1,walk:true,how:'속도를 낮춰 5분 정도 편하게 걷고 호흡을 가다듬습니다.',caution:'어지럼증이 생기면 걷기를 계속하지 말고 안전하게 멈추세요.'}
];
export type SetRow={kg:number;reps:number;done:boolean};
export type Session={id:string;started:number;ended:number|null;elapsed:number;runningSince:number|null;restEnd:number|null;exercises:Record<string,SetRow[]>};
export type Settings={rest:number;theme:'light'|'dark';defaults:Record<string,{sets:number;reps:number}>};
export type Data={version:1;settings:Settings;active:Session|null;history:Session[]};
export const initial:Data={version:1,settings:{rest:90,theme:'light',defaults:Object.fromEntries(routine.map(e=>[e.id,{sets:e.walk?1:2,reps:e.reps}]))},active:null,history:[]};
export const duration=(s:Session,now=Date.now())=>s.elapsed+(s.runningSince===null?0:Math.max(0,now-s.runningSince));
export function makeSession(data:Data):Session {const last=[...data.history].sort((a,b)=>b.started-a.started)[0];return {id:crypto.randomUUID(),started:Date.now(),ended:null,elapsed:0,runningSince:Date.now(),restEnd:null,exercises:Object.fromEntries(routine.map(e=>[e.id,Array.from({length:data.settings.defaults[e.id].sets},(_,i)=>({kg:last?.exercises[e.id]?.[i]?.kg??last?.exercises[e.id]?.[0]?.kg??0,reps:data.settings.defaults[e.id].reps,done:false}))]))};}
const obj=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const num=(v:unknown,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
function validSession(v:unknown,active:boolean):v is Session {if(!obj(v)||typeof v.id!=='string'||!num(v.started,0,1e14)||!num(v.elapsed,0,1e14)||!(active?v.ended===null:num(v.ended,0,1e14))||!(v.runningSince===null||active&&num(v.runningSince,0,1e14))||!(v.restEnd===null||num(v.restEnd,0,1e14))||!obj(v.exercises))return false;return routine.every(e=>{const rows=(v.exercises as Record<string,unknown>)[e.id];return Array.isArray(rows)&&rows.length>=1&&rows.length<=10&&rows.every(r=>obj(r)&&num(r.kg,0,1000)&&num(r.reps,1,300)&&Number.isInteger(r.reps)&&typeof r.done==='boolean');});}
export function validate(v:unknown):v is Data {if(!obj(v)||v.version!==1||!obj(v.settings)||![60,90,120].includes(v.settings.rest as number)||!['light','dark'].includes(v.settings.theme as string)||!obj(v.settings.defaults)||!Array.isArray(v.history)||v.history.length>10000)return false;const defs=v.settings.defaults;return routine.every(e=>{const d=defs[e.id];return obj(d)&&num(d.sets,1,10)&&Number.isInteger(d.sets)&&num(d.reps,1,300)&&Number.isInteger(d.reps);})&&(v.active===null||validSession(v.active,true))&&v.history.every(s=>validSession(s,false))&&new Set(v.history.map(s=>s.id)).size===v.history.length;}

