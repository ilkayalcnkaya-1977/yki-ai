import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Flame, ImagePlus, Layers3, Play, Sparkles, Wand2, Zap } from "lucide-react";

export const Route = createFileRoute("/studio")({ component: Studio });

function Studio() {
  return <main className="studio-page">
    <header className="studio-nav"><a href="/" className="ykiai-logo">YKI AI<span>®</span></a><div className="studio-nav-center">CREATE / STUDIO</div><div className="credit-pill"><Zap size={13}/> 240 credits</div></header>
    <div className="studio-shell">
      <aside className="studio-side">
        <a href="/" className="back-link"><ArrowLeft size={15}/> Back</a>
        <div className="side-title">NEW PROJECT</div>
        <button className="side-item active"><Sparkles size={16}/> Text to Video</button><button className="side-item"><ImagePlus size={16}/> Image to Video</button><button className="side-item"><Layers3 size={16}/> Remix</button>
        <div className="side-trend"><span><Flame size={13}/> TREND RADAR</span><strong>Turn today's trend into a video.</strong><small>Browse rising formats and create from one click.</small><a href="/#trends">Explore trends <ArrowUpRight size={13}/></a></div>
      </aside>
      <section className="studio-main">
        <div className="studio-heading"><div><p className="ykiai-eyebrow"><Sparkles size={13}/> CREATE VIDEO</p><h1>What do you want<br/><span>people to watch?</span></h1></div><div className="studio-status">SYSTEM READY <i/></div></div>
        <div className="creator-grid">
          <div className="creator-panel">
            <label>YOUR IDEA</label><textarea defaultValue="A street racer drives through a neon Istanbul at midnight. The city suddenly transforms into a futuristic metropolis while the camera races alongside the car." />
            <div className="prompt-tools"><button><Wand2 size={14}/> Enhance prompt</button><span>AI will build the shot list automatically</span></div>
            <div className="settings-row"><div><label>FORMAT</label><div className="seg"><button className="selected">9:16</button><button>16:9</button><button>1:1</button></div></div><div><label>DURATION</label><div className="seg"><button className="selected">8s</button><button>10s</button><button>15s</button></div></div></div>
            <div className="settings-row"><div><label>STYLE</label><select defaultValue="cinematic"><option value="cinematic">Cinematic</option><option>Realistic</option><option>Anime</option><option>3D</option></select></div><div><label>MODEL</label><select defaultValue="fast"><option value="fast">Fast Render</option><option>Quality Render</option></select></div></div>
            <div className="cost-line"><span>Estimated cost</span><strong>32 credits</strong></div><button className="create-btn"><Play size={17} fill="currentColor"/> Create video <ArrowUpRight size={16}/></button>
          </div>
          <div className="preview-panel"><div className="preview-top"><span>PREVIEW</span><span>9:16</span></div><div className="preview-empty"><div className="preview-orb"><Sparkles size={24}/></div><strong>Your video will appear here</strong><span>Write an idea and start creating.</span></div><div className="preview-bottom"><span>YKI AI ENGINE</span><span>1080P · AUDIO</span></div></div>
        </div>
      </section>
    </div>
  </main>
}
