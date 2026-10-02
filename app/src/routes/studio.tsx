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
import { useState } from "react";
import { createVideoGeneration } from "../lib/video-generation.functions";
import { getAccessToken, refreshSession } from "../lib/supabase-client";

export const Route = createFileRoute("/studio")({
  component: Studio,
});

function Studio() {
  const [format, setFormat] = useState("9:16");
  const [duration, setDuration] = useState("8s");
  const [prompt, setPrompt] = useState(
    "A street racer drives through a neon Istanbul at midnight. The city suddenly transforms into a futuristic metropolis while the camera races alongside the car."
  );

  const [creating, setCreating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const credits = 32;

  const handleCreate = async () => {
    setError(null);

    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      setError("Please write an idea first.");
      return;
    }

    let accessToken = getAccessToken();

    if (!accessToken) {
      setError("Please sign in before creating a video.");
      return;
    }

    setCreating(true);

    // Refresh the session before generation so Supabase never receives
    // a stale JWT that can trigger PGRST303 ("JWT issued at future").
    const refreshedSession = await refreshSession();
    if (refreshedSession?.access_token) {
      accessToken = refreshedSession.access_token;
    }

    try {
      const result = await createVideoGeneration({
        data: {
          accessToken,
          prompt: cleanPrompt,
          format,
          duration,
          style: "cinematic",
          generateAudio: true,
        },
      });

      setGenerationId(result.generationId);
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
          240 credits
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

          <button className="side-item" type="button">
            <ImagePlus size={16} />
            Image to Video
          </button>

          <button className="side-item" type="button">
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

            <a href="/#trends">
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
                <button type="button" disabled={creating}>
                  <Wand2 size={14} />
                  Enhance prompt
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
                      onClick={() => setDuration("8s")}
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

                  <select defaultValue="cinematic" disabled={creating}>
                    <option value="cinematic">Cinematic</option>
                    <option value="realistic">Realistic</option>
                    <option value="anime">Anime</option>
                    <option value="3d">3D</option>
                  </select>
                </div>

                <div>
                  <label>MODEL</label>

                  <select defaultValue="fast" disabled={creating}>
                    <option value="fast">Fast Render</option>
                    <option value="quality">Quality Render</option>
                  </select>
                </div>
              </div>

              <div className="cost-line">
                <span>Estimated cost</span>
                <strong>{credits} credits</strong>
              </div>

              {error && (
                <div className="studio-error">{error}</div>
              )}

              <button
                className="create-btn"
                type="button"
                onClick={handleCreate}
                disabled={creating || !prompt.trim()}
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

                <strong>
                  {creating
                    ? "Starting your video..."
                    : generationId
                      ? "Video generation started"
                      : "Your video will appear here"}
                </strong>

                <span>
                  {creating
                    ? "YKI AI is sending your idea to the video engine."
                    : generationId
                      ? `Generation ID: ${generationId}`
                      : "Write an idea and start creating."}
                </span>
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
