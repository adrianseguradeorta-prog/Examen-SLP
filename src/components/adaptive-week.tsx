"use client";
import { useState } from "react";
import Link from "next/link";
import { useCoach } from "./use-coach";
import { useTraining } from "./use-training";
import { currentProfile, localDate, skills } from "@/lib/coach-model";
import { proposeWeek, decideWeek, revertWeek, budgetKeys, weeklyTotals, activeWeek } from "@/lib/adaptive";
import { dueVocabulary } from "@/lib/srs";
import { independentSamples } from "@/lib/task-rotation";
export function AdaptiveWeek() {
  const {coach,ready,error,update}=useCoach();
  const {data,error:trainingError}=useTraining(true);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  if(!data || !ready) return <section className="card" id="adaptive"><h2>Mi semana adaptada</h2><p>{error||trainingError||"Leyendo tu semana…"}</p></section>;
  const today=localDate(new Date(),currentProfile(coach).timeZone), proposal=proposeWeek(coach,data,today), totals=weeklyTotals(data,today), active=activeWeek(coach,data,today);
  async function decide(action:"accepted"|"rejected"|"revert") {setBusy(true);try{await update(c=>action==="revert"?revertWeek(c,data!,today,crypto.randomUUID(),new Date().toISOString()):decideWeek(c,proposal,action,crypto.randomUUID(),new Date().toISOString()));setMessage(action==="accepted"?"Semana aceptada. Hoy usará este reparto.":action==="rejected"?"Propuesta rechazada. Se conserva el reparto anterior.":"Reparto anterior recuperado; historial intacto.");}catch(e){setMessage(e instanceof Error?e.message:"No se guardó.");}finally{setBusy(false);}}
  return <section className="card" id="adaptive"><h2>Mi semana adaptada</h2><p>Semana desde {proposal.week}. Disponibilidad: {proposal.available} min. {active?"Usando una versión aceptada.":"Plan provisional, sin adaptación aceptada."} <Link href="/settings#profile">Editar disponibilidad y prioridad →</Link></p><p>El calendario base de 36 semanas se conserva. Esta propuesta solo cambia el reparto de la semana mostrada; no suma deuda ni horas.</p>
    <div className="table-scroll"><table><thead><tr><th>Destreza</th><th>Reparto actual</th><th>Propuesta</th><th>Ya registrado</th></tr></thead><tbody>{budgetKeys.map(s=><tr key={s}><td>{s}</td><td>{proposal.before[s]} min</td><td>{proposal.budget[s]} min</td><td>{s==="review"?"Incluido en la destreza practicada":`${totals[s]} min`}</td></tr>)}</tbody></table></div>
    {proposal.reasons.map(r=><p key={r}>{r}</p>)}
    <button className="button" disabled={busy} onClick={()=>decide("accepted")}>Aceptar semana</button>{" "}<button className="text-button" disabled={busy} onClick={()=>decide("rejected")}>Rechazar propuesta</button>{" "}{active&&<button className="text-button" disabled={busy} onClick={()=>decide("revert")}>Volver al reparto anterior</button>}
    <p role="status">{message}</p><details><summary>Historial de decisiones ({coach.weeks.length})</summary>{[...coach.weeks].reverse().map(w=><article key={w.id}><h3>{w.week} · {w.status}</h3><p>{budgetKeys.map(s=>`${s}: ${w.budget[s]}`).join(" · ")}</p>{w.reasons.map(r=><p key={r}>{r}</p>)}</article>)}</details>
    <h3>Resumen local de esta semana</h3><p>{data.activities.filter(a=>a.studied_on>=proposal.week&&a.studied_on<=today).length} actividades registradas · {skills.reduce((n,s)=>n+totals[s],0)} minutos declarados · {skills.filter(s=>totals[s]>0).length} de 4 destrezas practicadas.</p><p>Reading: {independentSamples(data,"reading").length} muestras independientes; Listening: {independentSamples(data,"listening").length}. Evidencia insuficiente para estimar SLP.</p><p>{dueVocabulary(coach.vocabulary,today).length} revisiones SRS vencidas. <Link href="/vocabulary">Revisar vocabulario →</Link></p><p>Los minutos de SRS/repaso se registran una vez en la destreza trabajada (por ejemplo Speaking al producir una frase), no como tiempo adicional.</p><Link href="/">Ver mi siguiente actividad →</Link></section>;
}
