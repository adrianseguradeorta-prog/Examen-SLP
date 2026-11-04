import { describe,it,expect } from "vitest";
import { defaultProfile,emptyCoach,profileSchema,localDate,coachSchema } from "../src/lib/coach-model";
import { readCoach,saveCoach } from "../src/lib/coach-store";
import { baseBudget,proposeWeek,decideWeek,activeWeek,revertWeek,adaptivePractice } from "../src/lib/adaptive";
import type { TrainingData } from "../src/components/use-training";
import { addReview,srsState } from "../src/lib/srs";
import type { Vocabulary, Review } from "../src/lib/coach-model";
const uuid=()=>crypto.randomUUID();
const data=():TrainingData=>({plans:[],activities:[],submissions:[]});
const now="2026-10-29T10:00:00Z",today="2026-10-29";
const item=():Vocabulary=>({id:uuid(),expression:"take into account",note:"tener en cuenta",example:"We must take costs into account.",topic:"argumentation",createdOn:today,patternId:null,validatedByUser:false,reviews:[]});
const review=(date=today):Review=>({id:uuid(),date,mode:"recognition",correct:true,assisted:false,example:"",context:""});
describe("local profile",()=>{
 it("validates levels independently, availability and time zones",()=>{expect(profileSchema.parse(defaultProfile).declared.speaking).toBe("2");for(const patch of [{weeklyMinutes:0},{timeZone:"wrong/zone"},{days:[]},{days:[1,1]},{estimatedLevel:3}])expect(profileSchema.safeParse({...defaultProfile,...patch}).success).toBe(false);});
 it("uses the selected timezone across date boundaries",()=>expect(localDate(new Date("2026-10-29T23:30:00Z"),"Europe/Madrid")).toBe("2026-10-30"));
 it("persists versions with identity isolation and rejects stale writes",()=>{const map=new Map<string,string>();const store={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);}};const c=emptyCoach("alice");c.profiles.push({id:uuid(),createdAt:now,value:defaultProfile});saveCoach(store,"alice",null,c);expect(readCoach(store,"alice").data.profiles).toEqual(c.profiles);expect(readCoach(store,"bob").data.profiles).toEqual([]);expect(()=>saveCoach(store,"alice",null,c)).toThrow(/otra pestaña/);});
});
describe("transparent weekly planning",()=>{
 it.each([30,120,359,360,390,420,1260])("never invents time at %i minutes",total=>{const b=baseBudget({...defaultProfile,weeklyMinutes:total});expect(Object.values(b).reduce((a,b)=>a+b,0)).toBe(total);expect(Object.values(b).every(x=>x>=0&&Number.isInteger(x))).toBe(true);if(total>=360){expect(b.listening).toBeGreaterThanOrEqual(40);expect(b.speaking).toBeGreaterThanOrEqual(150);}});
 it("abstains without independent evidence and never estimates a level",()=>{const p=proposeWeek(emptyCoach("guest"),data(),today);expect(p.budget).toEqual(baseBudget(defaultProfile));expect(p.reasons.join()).toContain("evidencia insuficiente");expect(JSON.stringify(p)).not.toContain("estimatedLevel");});
 it("accepts/rejects/reverts versions without changing activities",()=>{const d=data(),c=emptyCoach("guest"),p=proposeWeek(c,d,today);let state=decideWeek(c,p,"accepted",uuid(),now);expect(activeWeek(state,d,today)?.budget).toEqual(p.budget);state=decideWeek(state,p,"rejected",uuid(),now);expect(activeWeek(state,d,today)?.status).toBe("accepted");state=revertWeek(state,d,today,uuid(),now);expect(state.weeks).toHaveLength(3);expect(c.weeks).toHaveLength(0);expect(d.activities).toEqual([]);expect(coachSchema.safeParse(state).success).toBe(true);});
 it("expires accepted allocation after profile changes",()=>{const c=emptyCoach("guest"),d=data();const accepted=decideWeek(c,proposeWeek(c,d,today),"accepted",uuid(),now);accepted.profiles.push({id:uuid(),createdAt:now,value:{...defaultProfile,weeklyMinutes:120}});expect(activeWeek(accepted,d,today)).toBeUndefined();});
 it("keeps completed time and never compresses old missed weeks",()=>{const d=data();d.activities=[{id:uuid(),skill:"reading",minutes:150,studied_on:today,note:""},{id:uuid(),skill:"writing",minutes:100,studied_on:"2026-09-01",note:""}];const p=proposeWeek(emptyCoach("guest"),d,today);expect(p.budget.reading).toBeGreaterThanOrEqual(150);expect(Object.values(p.budget).reduce((a,b)=>a+b,0)).toBe(390);expect(d.activities).toHaveLength(2);});
 it("stops adding work after weekly availability is recorded",()=>{const d=data();d.activities=Array.from({length:3},()=>({id:uuid(),skill:"reading" as const,minutes:150,studied_on:today,note:""}));expect(adaptivePractice(d,null,emptyCoach("guest"),today).minutes).toBe(0);});
});
describe("SRS separation and history",()=>{
 it("recognition never becomes production or mastery",()=>{const i=addReview(item(),review(),today);expect(srsState(i)).toMatchObject({due:"2026-10-30",independentUses:0,mastered:false});expect(i.reviews).toHaveLength(1);});
 it("advances 1/3/7 days only when due; errors reset without erasing history",()=>{let i=addReview(item(),review(),today);i=addReview(i,review(),today);expect(srsState(i).due).toBe("2026-10-30");i=addReview(i,review("2026-10-30"),"2026-10-30");expect(srsState(i).due).toBe("2026-11-02");i=addReview(i,review("2026-11-02"),"2026-11-02");expect(srsState(i).due).toBe("2026-11-09");i=addReview(i,{...review("2026-11-03"),correct:false},"2026-11-03");expect(srsState(i).due).toBe("2026-11-04");expect(i.reviews).toHaveLength(5);});
 it("requires a concrete example/context and excludes assistance from independent use",()=>{const r={...review(),mode:"production" as const};expect(()=>addReview(item(),r,today)).toThrow();let i=addReview(item(),{...r,assisted:true},today);expect(srsState(i).independentUses).toBe(0);i=addReview(i,{...r,id:uuid(),example:"We must take travel costs into account.",context:"my travel recommendation"},today);expect(srsState(i).independentUses).toBe(1);expect(srsState(i).mastered).toBe(false);});
 it("requires explicit validation to link an Error Bank pattern",()=>{const c=emptyCoach("guest");c.vocabulary=[{...item(),patternId:uuid()}];expect(coachSchema.safeParse(c).success).toBe(false);c.vocabulary[0].validatedByUser=true;expect(coachSchema.safeParse(c).success).toBe(true);});
});
