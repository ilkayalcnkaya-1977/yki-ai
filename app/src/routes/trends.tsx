import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowUpRight, Flame, Play, Search, Sparkles, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/trends")({ component: Trends });

const trends = [
  { id: "01", title: "AI Transformation", tag: "VISUAL HOOK", description: "A clear before/after transformation with an immediate visual payoff.", prompt: "Create a cinematic before-and-after transformation. Open with an ordinary scene, then reveal an astonishing AI-generated world in the first two seconds. Vertical 9:16, polished motion, dramatic lighting." },
  { id: "02", title: "Cinematic POV", tag: "STORY FORMAT", description: "First-person stories with a visual twist in the opening seconds.", prompt: "Create a cinematic first-person POV story with a surprising visual twist in the opening two seconds. Strong atmosphere, clear action, vertical 9:16." },
  { id: "03", title: "What If Worlds", tag: "WORLD BUILDING", description: "Turn a familiar place into an impossible alternate world.", prompt: "Imagine Istanbul transformed into an impossible futuristic world at blue hour. Start with a recognizable street, reveal the transformation, cinematic camera movement, realistic details, vertical 9:16." },
  { id: "04", title: "Product Cinematic", tag: "BRAND CONTENT", description: "Short premium product reveals for fashion, launches and small businesses.", prompt: "Create a premium cinematic product reveal for a modern fashion brand. Macro details, controlled studio lighting, elegant camera movement, clean background, vertical 9:16." },
  { id: "05", title: "Car Transformation", tag: "MOTION", description: "A street car evolves into a futuristic or fantasy machine.", prompt: "A black performance car drives through Istanbul at night and transforms into a futuristic concept vehicle. Wet streets, reflections, dynamic tracking shot, realistic cinematic look, vertical 9:16." },
  { id: "06", title: "Process / BTS", tag: "CREATOR STORY", description: "Show the making process, then reveal the finished visual.", prompt: "Create a short behind-the-scenes-to-final-reveal story. Begin with a creator preparing a scene, then transition into a polished cinematic result. Snappy pacing, vertical 9:16." },
  { id: "07", title: "Micro Cinema", tag: "SHORT STORY", description: "A compact narrative with a clear beginning, twist and ending.", prompt: "Create an 8-second micro-cinema scene with a clear visual hook, one emotional turning point and a memorable final frame. Film-grade lighting, natural motion, vertical 9:16." },
  { id: "08", title: "Reality vs AI", tag: "COMPARISON", description: "Contrast an everyday scene with an imaginative AI-generated version.", prompt: "Create a cinematic reality-versus-imagination concept: an everyday Istanbul scene seamlessly transforms into a surreal alternate reality. Strong contrast, smooth transition, vertical 9:16." },
];

function Trends() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => trends.filter((trend) =>
    `${trend.title} ${trend.tag} ${trend.description}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [query]);

  return <main className="radar-page">
    <header className="radar-nav"><a href="/" className="ykiai-logo">YKI AI<span>®</span></a><div className="radar-nav-title"><Flame size={13}/> TREND RADAR</div><a href="/studio" className="radar-create">Create video <ArrowUpRight size={14}/></a></header>
    <section className="radar-hero">
      <p className="ykiai-eyebrow"><TrendingUp size={13}/> CREATOR INSPIRATION · CURATED FORMATS</p>
      <h1>Find a format.<br/><span>Make it yours.</span></h1>
      <p>Browse creative formats and ready-to-edit prompts. These are curated ideas, not live popularity statistics; use them as starting points for your own original videos.</p>
      <label className="radar-search"><Search size={16}/><input aria-label="Search trends" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search formats, niches or ideas"/></label>
    </section>
    <section className="radar-list">
      <div className="radar-list-head"><span>{query ? "SEARCH RESULTS" : "IDEAS TO TRY"}</span><span>{filtered.length} FORMATS · CURATED INSPIRATION</span></div>
      {filtered.map((trend) => <article className="radar-row" key={trend.id}>
        <div className="rank">{trend.id}</div><div className="radar-main"><div><span className="trend-tag"><Flame size={11}/> {trend.tag}</span><h2>{trend.title}</h2><p>{trend.description}</p></div><div className="growth"><b>Prompt</b><small>ready to adapt</small></div></div>
        <a className="radar-use" href={`/studio?prompt=${encodeURIComponent(trend.prompt)}`}><Play size={13} fill="currentColor"/> Use this idea</a>
      </article>)}
      {filtered.length === 0 && <p className="radar-empty">No matches. Try a broader search such as “cinematic”, “car” or “product”.</p>}
    </section>
    <section className="radar-bottom"><div><Sparkles size={18}/><h3>Idea → your own video</h3><p>Choose a format to bring its editable prompt into Studio. You can rewrite it before starting any generation.</p></div><a href="/studio">Open Studio <ArrowUpRight size={15}/></a></section>
  </main>;
}
