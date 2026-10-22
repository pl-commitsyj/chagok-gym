import {openDB} from 'idb';
import {initial,validate,type Data} from './model';
const db=openDB('chagok-gym',1,{upgrade(d){d.createObjectStore('state');}});
export async function load():Promise<Data>{const v=await(await db).get('state','main');if(v===undefined)return structuredClone(initial);if(!validate(v))throw new Error('저장 데이터 형식이 올바르지 않습니다.');return v;}
export async function save(data:Data){await(await db).put('state',data,'main');}
