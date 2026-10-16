import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPlatformHealth } from "@/lib/api/platform-health.functions";
import { ArrowUpRight, Check, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { getAccessToken, getCreditBalance } from "../lib/supabase-client";

export const Route = createFileRoute("/credits")({ component: Credits });

const plans: Array<{id:"starter"|"creator"|"pro";name:string;credits:string;price:string;desc:string;features:string[]}> = [
  {id:"starter",name:"Starter",credits:"250",price:"199 TL",desc:"For trying the studio",features:["~7 fast videos","No expiry","1080p export"]},
  {id:"creator",name:"Creator",credits:"750",price:"499 TL",desc:"For regular creators",features:["~23 fast videos","Trend Radar","Priority queue"]},
  {id:"pro",name:"Pro",credits:"2,000",price:"999 TL",desc:"For high-volume creators",features:["~62 fast videos","Priority queue","Advanced models"]},
];

function Credits() {
  const health = useQuery({queryKey:["platform-health"],queryFn:()=>getPlatformHealth()});
  const [balance,setBalance] = useState<number|null>(null);
  const [busyPlan,setBusyPlan] = useState<string|null>(null);
  const [message,setMessage] = useState("");

  useEffect(()=>{
    let cancelled=false;
    void getCreditBalance().then(value=>{ if(!cancelled) setBalance(value); });
    return ()=>{cancelled=true};
  },[]);

  async function startPayment(plan:"starter"|"creator"|"pro") {
    setMessage("");
    const token=getAccessToken();
    if(!token) { window.location.href="/login"; return; }
    setBusyPlan(plan);
    try {
      const response=await fetch("https://dtdygokcjjoprqfjmmcz.supabase.co/functions/v1/paytr-payments",{
        method:"POST",
        headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},
        body:JSON.stringify({plan}),
      });
      const data=await response.json().catch(()=>null);
      if(!response.ok || !data?.paymentUrl) throw new Error(data?.error || "Ödeme şu anda başlatılamıyor. PayTR mağaza onayını kontrol edin.");
      window.location.href=data.paymentUrl;
    } catch(error) {
      setMessage(error instanceof Error ? error.message : "Ödeme başlatılamadı.");
      setBusyPlan(null);
    }
  }

  return <main className="credits-page">
    <header className="studio-nav">
      <a href="/" className="ykiai-logo">YKI AI<span>®</span></a>
      <div className="studio-nav-center">CREDITS</div>
      <div className="credit-pill"><Zap size={13}/>{balance===null?"—":`${balance} credits`}</div>
    </header>
    <section className="credits-main">
      <p className="ykiai-eyebrow"><Zap size={13}/> SIMPLE CREATOR PRICING</p>
      <h1>More ideas.<br/><span>More videos.</span></h1>
      <p className="credits-lede">Buy credits when you need them. Your balance stays ready for the next idea.</p>
      {message && <p role="alert" className="credits-note">{message}</p>}
      <div className="plan-grid">{plans.map(({id,name,credits,price,desc,features})=><article className={name==="Creator"?"plan featured":"plan"} key={id}>{name==="Creator"&&<b className="popular">MOST POPULAR</b>}<h2>{name}</h2><p>{desc}</p><div className="plan-price"><strong>{price}</strong><small>/ package</small></div><div className="plan-credits"><Zap size={14}/>{credits} credits</div><ul>{features.map(f=><li key={f}><Check size={14}/>{f}</li>)}</ul><button onClick={()=>void startPayment(id)} disabled={busyPlan!==null}>{busyPlan===id?"Connecting to PayTR…":busyPlan?"Please wait…":`Get ${name}`} <ArrowUpRight size={14}/></button></article>)}</div>
      <div className="credits-note"><span className="health-dot" data-ok={health.data?.ok ? "true" : "false"}/><span>{health.data?.ok ? "Platform database ready" : "Platform services initializing"}</span><Sparkles size={15}/> Final pricing will be calibrated against real generation costs before launch.</div>
    </section>
  </main>
}
