import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Play, Sparkles, Wand2, Flame, Layers3 } from "lucide-react";
import { ScrollScrub } from "@/components/scroll-scrub/scroll-scrub";
import { scrollScrubScenes, scrollScrubTheme } from "@/scroll-scrub-scenes";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  return (
    <main className="ykiai-page">
      <nav className="ykiai-nav">
        <a className="ykiai-logo" href="#top">YKI AI<span>®</span></a>
        <div className="ykiai-nav-links"><a href="/studio">Studio</a><a href="/trends">Trends</a><a href="/projects">Projects</a></div>
        <div className="ykiai-nav-actions"><a className="ykiai-ghost" href="/login">Log in</a><a className="ykiai-pill" href="/studio">Start creating <ArrowUpRight size={15}/></a></div>
      </nav>
      <section id="top" className="ykiai-hero">
        <div className="ykiai-hero-copy">
          <p className="ykiai-eyebrow"><Sparkles size={14}/> THE NEW CREATIVE INTERNET</p>
          <h1>Make the <em>impossible</em> watchable.</h1>
          <p className="ykiai-lede">Turn a thought, a trend or a single sentence into cinematic short-form content made to stop the scroll.</p>
          <div className="ykiai-hero-actions"><a className="ykiai-primary" href="/studio"><Play size={17} fill="currentColor"/> Create your first video</a><a href="#studio" className="ykiai-text-link">See the studio <ArrowUpRight size={16}/></a></div>
        </div>
        <div className="ykiai-hero-orbit">
          <div className="ykiai-orbit-card"><span>01</span><strong>IDEA</strong><small>What if Tokyo froze in time?</small></div>
          <div className="ykiai-orbit-card second"><span>02</span><strong>WORLD</strong><small>Story · shots · motion · sound</small></div>
          <div className="ykiai-orbit-card third"><span>03</span><strong>DROP</strong><small>9:16 · ready to publish</small></div>
        </div>
      </section>
      <section className="ykiai-film"><ScrollScrub scenes={scrollScrubScenes} theme={scrollScrubTheme}/><div className="ykiai-film-overlay"><span>SCROLL TO DIRECT</span><span>01 — 01</span></div></section>
      <section id="studio" className="ykiai-section">
        <div className="ykiai-section-head"><p className="ykiai-eyebrow">01 / STUDIO</p><h2>Your idea is the <span>director.</span></h2><p>Write naturally. YKI AI turns your idea into a hook, script, shot list and production prompt.</p></div>
        <div className="ykiai-studio-card"><div className="studio-top"><span>NEW PROJECT</span><span>9:16 · 1080P · AUDIO ON</span></div><div className="studio-prompt">A street racer drives through a neon Istanbul at midnight while the city suddenly transforms into a futuristic metropolis<span className="cursor"/></div><div className="studio-bottom"><div className="studio-chips"><span><Wand2 size={14}/> Cinematic</span><span>8 sec</span><span>Fast</span></div><button className="ykiai-primary small">Generate <ArrowUpRight size={15}/></button></div></div>
      </section>
      <section id="trends" className="ykiai-section">
        <div className="ykiai-section-head row"><div><p className="ykiai-eyebrow"><Flame size={14}/> 02 / TREND RADAR</p><h2>Catch the wave <span>before it peaks.</span></h2></div><a className="ykiai-text-link" href="/trends">Open radar <ArrowUpRight size={16}/></a></div>
        <div className="trend-grid"><article><span>#01 · RISING</span><h3>Impossible POV</h3><p>POV stories with a twist in the first 2 seconds.</p><b>+184%</b></article><article><span>#02 · HOT</span><h3>What If Worlds</h3><p>Reality-bending transformations are accelerating.</p><b>+126%</b></article><article><span>#03 · MOVING</span><h3>Micro Cinema</h3><p>Short narrative scenes with film-grade motion.</p><b>+91%</b></article></div>
      </section>
      <section id="works" className="ykiai-section"><div className="ykiai-section-head"><p className="ykiai-eyebrow"><Layers3 size={14}/> 03 / THE PLATFORM</p><h2>One place for your <span>creative universe.</span></h2></div><div className="feature-grid"><div><strong>Generate</strong><p>Turn prompts into production-ready short videos.</p></div><div><strong>Remix</strong><p>Iterate on the strongest idea without starting over.</p></div><div><strong>Publish</strong><p>Titles, captions and formats built around each platform.</p></div></div></section>
      <section className="ykiai-final"><p className="ykiai-eyebrow">THE FUTURE IS SHORT-FORM</p><h2>Do not just follow the feed.<br/><span>Shape it.</span></h2><button className="ykiai-primary">Enter the studio <ArrowUpRight size={17}/></button></section>
      <footer><span>YKI AI® — PROJECT 01</span><span>Built for the next generation of creators.</span></footer>
    </main>
  );
}

