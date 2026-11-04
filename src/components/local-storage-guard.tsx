"use client";
import { useEffect,useState } from "react";
import { MAINTENANCE_KEY,recoverInterruptedReplace } from "@/lib/backup";
export function LocalStorageGuard({children}:{children:React.ReactNode}) {
  const [state,setState]=useState("checking");
  useEffect(()=>{
    queueMicrotask(()=>{try{recoverInterruptedReplace(localStorage,"guest");setState("ready");}catch{setState("failed");}});
    const changed=(e:StorageEvent)=>{if(e.key===MAINTENANCE_KEY)setState("changed");};window.addEventListener("storage",changed);return()=>window.removeEventListener("storage",changed);
  },[]);
  if(state==="ready")return children;
  return <section className="card"><p>{state==="checking"?"Comprobando el espacio local…":state==="changed"?"Otra pestaña está reemplazando datos. Espera a que termine y recarga antes de continuar.":"No se pudo recuperar una operación local. Conserva tus copias y no edites hasta resolver el almacenamiento."}</p>{state!=="checking"&&<button onClick={()=>window.location.reload()}>Recargar espacio local</button>}</section>;
}
