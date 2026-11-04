import { coachSchema, emptyCoach, type Coach } from "./coach-model";
export const COACH_CHANGE = "slp-coach-change";
export const coachKey = (owner: string) => `slp:coach:v1:${encodeURIComponent(owner)}`;
export type LocalStore = Pick<Storage,"getItem"|"setItem"|"removeItem"|"key"|"length">;
export function readCoach(store: Pick<Storage,"getItem">, owner: string) {
  const raw = store.getItem(coachKey(owner));
  const data = raw === null ? emptyCoach(owner) : coachSchema.parse(JSON.parse(raw));
  if(data.owner !== owner) throw Error("La copia pertenece a otra identidad.");
  return { raw, data };
}
// Synchronous compare-and-write: UI also serializes new coach mutations with Web Locks where available.
export function saveCoach(store: Pick<Storage,"getItem"|"setItem">, owner: string, expected: string | null, value: Coach) {
  if(store.getItem(coachKey(owner)) !== expected) throw Error("El progreso cambió en otra pestaña. Recarga antes de guardar.");
  const data = coachSchema.parse({...value, revision: value.revision + 1});
  if(data.owner !== owner) throw Error("Identidad incorrecta.");
  const raw = JSON.stringify(data);
  store.setItem(coachKey(owner), raw);
  return { data, raw };
}
