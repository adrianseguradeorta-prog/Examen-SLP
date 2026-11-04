import { z } from "zod";
import { storedSchema, practicePrefix } from "./local-practice";
import { coachKey, type LocalStore } from "./coach-store";
import { coachSchema, emptyCoach } from "./coach-model";
import { writingDraftStorageKey } from "./writing-draft";
import { diagnosticDraftKey, parseDiagnosticDraft } from "./diagnostic-draft";
import { parseTaskDraft } from "./task-draft";
import { writingTasks } from "./task-catalog";
export const MAX_BACKUP_BYTES=5*1024*1024;
export const MAINTENANCE_KEY="slp:maintenance:v1";
const entrySchema=z.object({key:z.string().max(400),value:z.unknown()}).strict();
const backupSchema=z.object({format:z.literal("slp-local-backup"),version:z.literal(1),owner:z.string().min(1).max(200),exportedAt:z.iso.datetime(),entries:z.array(entrySchema).max(10000)}).strict();
export type Backup=z.infer<typeof backupSchema>;
const writingSchema=z.object({userKey:z.string().max(200),id:z.string().max(100),revision:z.number().int().nonnegative(),text:z.string().max(30000),task:z.string().max(300),dirty:z.boolean(),lastSyncedText:z.string().max(30000),updatedAt:z.iso.datetime()}).strict();
const diagnosticSchema=writingSchema.extend({submissionId:z.uuid(),closed:z.boolean()});
export function ownedKey(key:string,owner:string) {
  return key.startsWith(practicePrefix(owner))||key===coachKey(owner)||key===writingDraftStorageKey(owner)||writingTasks.some(t=>key===diagnosticDraftKey(owner,t.version))||key.startsWith(`slp:task-draft:v1:${encodeURIComponent(owner)}:`);
}
function safeObject(value:unknown,depth=0) {
  if(depth>40) throw Error("Estructura demasiado profunda.");
  if(value&&typeof value==="object") for(const [key,child] of Object.entries(value)) {if(["__proto__","prototype","constructor"].includes(key)) throw Error("Campo no permitido.");safeObject(child,depth+1);}
}
// Existing parsers can strip unknown fields; a backup must reject them, never silently import them.
function sameShape(source:unknown,parsed:unknown) {
  if(source&&typeof source==="object") {
    if(!parsed||typeof parsed!=="object"||Object.keys(source).some(k=>!Object.hasOwn(parsed,k))) throw Error("Campos inesperados en la copia.");
    for(const [k,v] of Object.entries(source)) sameShape(v,(parsed as Record<string,unknown>)[k]);
  }
}
function validateEntry(key:string,value:unknown,owner:string) {
  if(!ownedKey(key,owner)) throw Error("La copia contiene claves ajenas o de otra identidad.");
  let parsed:unknown;
  if(key.startsWith(practicePrefix(owner))) {
    const row=storedSchema.parse(value);
    if(key!==`${practicePrefix(owner)}${row.record.kind}:${row.record.data.id}`) throw Error("Identificador de registro incorrecto.");
    parsed=row;
  } else if(key===coachKey(owner)) {
    const row=coachSchema.parse(value);if(row.owner!==owner) throw Error("Identidad incorrecta.");parsed=row;
  } else if(key===writingDraftStorageKey(owner)) {
    const row=writingSchema.parse(value);if(row.userKey!==owner)throw Error("Identidad incorrecta.");parsed=row;
  } else if(writingTasks.some(t=>key===diagnosticDraftKey(owner,t.version))) {
    parsed=diagnosticSchema.parse(value);const task=writingTasks.find(t=>key===diagnosticDraftKey(owner,t.version))!;
    if(!parseDiagnosticDraft(JSON.stringify(value),owner,task.version))throw Error("Borrador Writing inválido.");
  } else {
    const raw=value as {kind?:unknown;version?:unknown};
    if(!raw||!["reading","listening","speaking"].includes(String(raw.kind))||typeof raw.version!=="string"||key!==`slp:task-draft:v1:${encodeURIComponent(owner)}:${raw.kind}:${encodeURIComponent(raw.version)}`)throw Error("Borrador inválido.");
    parsed=parseTaskDraft(JSON.stringify(value),owner,raw.kind as "reading"|"listening"|"speaking",raw.version);
    if(!parsed)throw Error("Borrador inválido.");
  }
  sameShape(value,parsed);
}
export function parseBackup(raw:string,owner:string):Backup {
  if(new TextEncoder().encode(raw).length>MAX_BACKUP_BYTES)throw Error("Copia demasiado grande: máximo 5 MiB.");
  const value:unknown=JSON.parse(raw);safeObject(value);
  const b=backupSchema.parse(value);
  if(b.owner!==owner)throw Error("Esta copia pertenece a otra identidad. No se importa en este espacio.");
  if(new Set(b.entries.map(e=>e.key)).size!==b.entries.length)throw Error("Claves duplicadas.");
  for(const e of b.entries)validateEntry(e.key,e.value,owner);
  return b;
}
function snapshot(store:LocalStore,owner:string) {
  const entries:{key:string;value:string}[]=[];
  for(let i=0;i<store.length;i++){const key=store.key(i);if(key&&ownedKey(key,owner))entries.push({key,value:store.getItem(key)!});}
  return entries.sort((a,b)=>a.key.localeCompare(b.key));
}
export function exportBackup(store:LocalStore,owner:string,now:string):Backup {
  if(store.getItem(MAINTENANCE_KEY))throw Error("Hay una operación incompleta; recupérala antes de exportar.");
  const b={format:"slp-local-backup",version:1,owner,exportedAt:now,entries:snapshot(store,owner).map(e=>({key:e.key,value:JSON.parse(e.value)}))};
  return parseBackup(JSON.stringify(b),owner);
}
const journalSchema=z.object({version:z.literal(1),owner:z.string().min(1).max(200),previous:z.array(z.object({key:z.string().max(400),value:z.string().max(MAX_BACKUP_BYTES)}).strict()).max(10000)}).strict();
function replaceRaw(store:LocalStore,owner:string,entries:{key:string;value:string}[]) {
  const target=new Set(entries.map(e=>e.key));
  for(const e of snapshot(store,owner))if(!target.has(e.key))store.removeItem(e.key);
  for(const e of entries)store.setItem(e.key,e.value);
}
export function recoverInterruptedReplace(store:LocalStore,owner:string) {
  const raw=store.getItem(MAINTENANCE_KEY);if(!raw)return false;
  if(new TextEncoder().encode(raw).length>MAX_BACKUP_BYTES*3)throw Error("Diario local demasiado grande.");
  const value:unknown=JSON.parse(raw);safeObject(value);const j=journalSchema.parse(value);
  if(j.owner!==owner||j.previous.some(e=>!ownedKey(e.key,owner))||new Set(j.previous.map(e=>e.key)).size!==j.previous.length)throw Error("No se puede recuperar otra identidad.");
  replaceRaw(store,owner,j.previous);store.removeItem(MAINTENANCE_KEY);return true;
}
function replaceTransaction(store:LocalStore,owner:string,target:{key:string;value:string}[]) {
  if(store.getItem(MAINTENANCE_KEY))throw Error("Recupera primero la operación interrumpida.");
  // Journal must fit before touching any old data. A reload rolls back an uncommitted replacement.
  const journal=JSON.stringify({version:1,owner,previous:snapshot(store,owner)});
  if(new TextEncoder().encode(journal).length>MAX_BACKUP_BYTES*3)throw Error("Historial demasiado grande para reemplazar con seguridad.");
  store.setItem(MAINTENANCE_KEY,journal);
  try {replaceRaw(store,owner,target);store.removeItem(MAINTENANCE_KEY);} catch {
    try {recoverInterruptedReplace(store,owner);}catch{throw Error("Operación interrumpida. No edites: cierra las pestañas y recarga para recuperar la copia previa.");}
    throw Error("No se completó el reemplazo; se recuperaron los datos anteriores. Revisa el espacio disponible.");
  }
}
export function restoreBackup(store:LocalStore,owner:string,raw:string,confirmed:boolean) {
  const b=parseBackup(raw,owner);if(!confirmed)throw Error("Confirma explícitamente el reemplazo.");
  replaceTransaction(store,owner,b.entries.map(e=>({key:e.key,value:JSON.stringify(e.value)})));
}
export type DeleteScope="progress"|"drafts"|"errors"|"srs"|"profile"|"all";
export function deleteLocal(store:LocalStore,owner:string,scope:DeleteScope,confirmed:boolean) {
  if(!confirmed)throw Error("Confirma el borrado.");
  if(!["progress","drafts","errors","srs","profile","all"].includes(scope))throw Error("Selección inválida.");
  const rows=snapshot(store,owner),target:{key:string;value:string}[]=[];
  for(const row of rows) {
    if(scope==="all")continue;
    const practice=row.key.startsWith(practicePrefix(owner));
    if(scope==="errors"&&row.key.startsWith(`${practicePrefix(owner)}observation:`))continue;
    // Keep exposures on progress deletion: known solutions cannot become independent again.
    if(scope==="progress"&&practice&&!row.key.startsWith(`${practicePrefix(owner)}observation:`)&&!row.key.startsWith(`${practicePrefix(owner)}exposure:`))continue;
    if(scope==="drafts"&&!practice&&row.key!==coachKey(owner))continue;
    if(row.key===coachKey(owner)) {
      const c=coachSchema.parse(JSON.parse(row.value));if(c.owner!==owner)throw Error("Identidad incorrecta.");
      const next={...c,revision:c.revision+1};
      if(scope==="srs")next.vocabulary=[];
      if(scope==="profile"){next.profiles=[];next.weeks=[];}
      if(scope==="progress")next.weeks=[];
      if(scope==="errors")next.vocabulary=next.vocabulary.map(v=>({...v,patternId:null}));
      target.push({key:row.key,value:JSON.stringify(next)});
    } else target.push(row);
  }
  replaceTransaction(store,owner,target);
}
export function backupSummary(b:Backup) {
  const c=b.entries.find(e=>e.key===coachKey(b.owner));
  const coach=c?coachSchema.parse(c.value):emptyCoach(b.owner);
  return { records:b.entries.filter(e=>e.key.startsWith(practicePrefix(b.owner))).length, drafts:b.entries.filter(e=>!e.key.startsWith(practicePrefix(b.owner))&&e.key!==coachKey(b.owner)).length, profiles:coach.profiles.length, weeks:coach.weeks.length, vocabulary:coach.vocabulary.length };
}
