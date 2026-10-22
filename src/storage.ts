import { openDB } from 'idb';
import { initial, parseBackup, type Data } from './model';
const db = openDB('chagok-gym', 1, {
  upgrade(d) {
    d.createObjectStore('state');
  },
});
export async function load(): Promise<Data> {
  const v = await (await db).get('state', 'main');
  if (v === undefined) return structuredClone(initial);
  const next = parseBackup(v);
  if (v.version === 1) await (await db).put('state', next, 'main');
  return next;
}
export async function save(data: Data) {
  await (await db).put('state', data, 'main');
}
