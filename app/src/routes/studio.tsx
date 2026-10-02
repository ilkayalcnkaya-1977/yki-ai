import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowUpRight,
  Flame,
  ImagePlus,
  Layers3,
  Play,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createVideoGeneration, enhancePrompt, getGeneration, getStudioState } from "../lib/video-generation.server";
import { getAccessToken } from "../lib/supabase-client";

export const Route = createFileRoute("/studio")({
  component: Studio,
});

function Studio() {
  const [format, setFormat] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const duration = "8s" as const;
  const [prompt, setPrompt] = useState(
    "A street racer drives through a neon Istanbul at midnight. The city suddenly transforms into a futuristic metropolis while the camera races alongside the car."
  );

  const [creating, setCreating] = useState(false);
  const [style, setStyle] = useState<"cinematic" | "realistic" | "anime" | "3d">("cinematic");
  const [model] = useState("veo-fast");
  const [generateAudio, setGenerateAudio] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generation, setGeneration] = useState<{ status: string; output_url: string | null; error_code: string | null; project_id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    getStudioState({ data: { accessToken: token } })
      .then((state) => setCredits(state.credits))
      .catch(() => setCredits(null));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preset = params.get("prompt");
    if (preset?.trim()) setPrompt(preset.trim().slice(0, 4000));
  }, []);
  useEffect(() => { if (!generationId) return; const token = getAccessToken(); if (!token) return; const poll = async () => { try { const next = await getGeneration({ data: { accessToken: token, generationId } }); setGeneration(next); if (["queued", "starting", "submitted", "processing"].includes(next.status)) window.setTimeout(poll, 5000); } catch { /* status will be retried next visit */ } }; void poll(); }, [generationId]);
  const estimatedCost = 32;

  const handleCreate = async () => {
    setError(null);

    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setError("Please write an idea first.");
      return;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      setError("Please sign in before creating a video.");
      return;
    }

    setCreating(true);

    try {
      const result = await createVideoGeneration({
        data: {
          accessToken,
          prompt: cleanPrompt,
          format,
          duration,
          style,
          generateAudio,
          idempotencyKey: crypto.randomUUID(),
        },
      });

      setGenerationId(result.generationId);
      setGeneration({ status: result.status, output_url: null, error_code: null, project_id: "" });
      if (!result.duplicate) setCredits((current) => current === null ? current : current - result.credits);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Video generation could not be started."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <main className="studio-page">
      <header className="studio-nav">
        <a href="/" className="ykiai-logo">
          YKI AI<span>®</span>
        </a>

        <div className="studio-nav-center">CREATE / STUDIO</div>

        <div className="credit-pill">
          <Zap size={13} />
          {credits === null ? "…" : `${credits} credits`}
        </div>
      </header>

      <div className="studio-shell">
        <aside className="studio-side">
          <a href="/" className="back-link">
            <ArrowLeft size={15} />
            Back
          </a>

          <div className="side-title">NEW PROJECT</div>

          <button className="side-item active" type="button">
            <Sparkles size={16} />
            Text to Video
          </button>

          <button className="side-item" type="button" disabled title="Image-to-video is not supported by the selected provider yet.">
            <ImagePlus size={16} />
            Image to Video
          </button>

          <button className="side-item" type="button" disabled title="Remix is coming soon.">
            <Layers3 size={16} />
            Remix
          </button>

          <div className="side-trend">
            <span>
              <Flame size={13} /> TREND RADAR
            </span>

            <strong>Turn today's trend into a video.</strong>

            <small>
              Browse rising formats and create from one click.
            </small>

            <a href="/trends">
              Explore trends <ArrowUpRight size={13} />
            </a>
          </div>
        </aside>

        <section className="studio-main">
          <div className="studio-heading">
            <div>
              <p className="ykiai-eyebrow">
                <Sparkles size={13} /> CREATE VIDEO
              </p>

              <h1>
                What do you want
                <br />
                <span>people to watch?</span>
              </h1>
            </div>

            <div className="studio-status">
              {creating ? "CREATING" : "SYSTEM READY"} <i />
            </div>
          </div>

          <div className="creator-grid">
            <div className="creator-panel">
              <label>YOUR IDEA</label>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the video you want to create..."
                disabled={creating}
              />

              <div className="prompt-tools">
                <button type="button" disabled={creating} onClick={async () => { const token = getAccessToken(); if (!token) { setError("Please sign in before enhancing a prompt."); return; } setCreating(true); try { const result = await enhancePrompt({ data: { accessToken: token, prompt } }); setPrompt(result.prompt); if (!result.available && "message" in result) setError(result.message); } catch { setError("Prompt enhancement is temporarily unavailable."); } finally { setCreating(false); } }}>
                  <Wand2 size={14} /> Enhance prompt
                </button>

                <span>AI will build the shot list automatically</span>
              </div>

              <div className="settings-row">
                <div>
                  <label>FORMAT</label>

                  <div className="seg">
                    {["9:16", "16:9", "1:1"].map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={format === item ? "selected" : ""}
                        onClick={() => setFormat(item)}
                        disabled={creating}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label>DURATION</label>

                  <div className="seg">
                    <button
                      type="button"
                      className="selected"
                      disabled={creating}
                    >
                      8s
                    </button>

                    <button type="button" disabled title="Coming soon">
                      10s
                    </button>

                    <button type="button" disabled title="Coming soon">
                      15s
                    </button>
                  </div>
                </div>
              </div>

              <div className="settings-row">
                <div>
                  <label>STYLE</label>

                  <select value={style} onChange={(e) => setStyle(e.target.value as typeof style)} disabled={creating}>
                    <option value="cinematic">Cinematic</option>
                    <option value="realistic">Realistic</option>
                    <option value="anime">Anime</option>
                    <option value="3d">3D</option>
                  </select>
                </div>

                <div>
                  <label>MODEL</label>

                  <select value={model} disabled={creating}>
                    <option value="veo-fast">Fast Render</option>
                    <option value="quality" disabled>Quality Render (coming soon)</option>
                  </select>
                </div>
              </div>

              <label className="cost-line"><span>Generate audio</span><input type="checkbox" checked={generateAudio} onChange={(e) => setGenerateAudio(e.target.checked)} disabled={creating} /></label>

              <div className="cost-line">
                <span>Estimated cost</span>
                <strong>{credits === null ? "Loading…" : `${estimatedCost} credits · ${credits} available`}</strong>
              </div>

              {error && <div className="studio-error">{error}</div>}

              <button
                className="create-btn"
                type="button"
                onClick={handleCreate}
                disabled={creating || !prompt.trim() || credits === null || credits < estimatedCost}
              >
                <Play size={17} fill="currentColor" />

                {creating ? "Creating..." : "Create video"}

                <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="preview-panel">
              <div className="preview-top">
                <span>PREVIEW</span>
                <span>{format}</span>
              </div>

              <div className="preview-empty">
                <div className="preview-orb">
                  <Sparkles size={24} />
                </div>

                {generation?.status === "completed" && generation.output_url ? <><video controls src={generation.output_url} style={{ maxWidth: "100%", maxHeight: 340 }} /><a className="create-btn" href={generation.output_url} download>Download video</a><a href="/projects">View project</a></> : <><strong>{creating ? "Starting your video..." : generation ? ["failed", "refunded", "canceled"].includes(generation.status) ? "Generation failed — credits refunded" : "Your video is being generated" : "Your video will appear here"}</strong><span>{creating ? "YKI AI is sending your idea to the video engine." : generation?.error_code ? "The provider could not complete this video. Update the idea and try again." : generation ? "We will update this preview when the provider finishes." : "Write an idea and start creating."}</span></>}
              </div>

              <div className="preview-bottom">
                <span>YKI AI ENGINE</span>
                <span>1080P · AUDIO</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
