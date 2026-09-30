import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Check, LockKeyhole, Mail, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser, signIn, signUp } from "@/lib/supabase-client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) navigate({ to: "/studio" });
    });
  }, [navigate]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setBusy(true);
    try {
      if (mode === "signup") {
        if (password.length < 8) throw new Error("Şifre en az 8 karakter olmalı.");
        const result = await signUp(email.trim(), password, name.trim());
        if (!result.access_token) {
          setMessage("Hesabın oluşturuldu. E-postanı doğruladıktan sonra giriş yapabilirsin.");
          setMode("login");
        } else {
          navigate({ to: "/studio" });
        }
      } else {
        await signIn(email.trim(), password);
        navigate({ to: "/studio" });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Bir hata oluştu. Tekrar dene.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glow" />
      <nav className="auth-nav">
        <Link to="/" className="ykiai-logo">YKI AI<span>®</span></Link>
        <Link to="/" className="auth-back"><ArrowLeft size={14} /> Ana sayfa</Link>
      </nav>
      <section className="auth-card">
        <div className="auth-kicker"><Sparkles size={13} /> YKI AI CREATOR ACCOUNT</div>
        <h1>{mode === "signup" ? <>Create your <em>world.</em></> : <>Welcome <em>back.</em></>}</h1>
        <p className="auth-lede">Hesabını oluştur, projelerini ve kredilerini tek yerde yönet.</p>
        <div className="auth-tabs">
          <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>Create account</button>
          <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setMessage(""); }}>Log in</button>
        </div>
        <form onSubmit={submit} className="auth-form">
          {mode === "signup" && <label><span>NAME</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" required /></label>}
          <label><span>EMAIL</span><div className="auth-input"><Mail size={15} /><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" autoComplete="email" required /></div></label>
          <label><span>PASSWORD</span><div className="auth-input"><LockKeyhole size={15} /><input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="At least 8 characters" autoComplete={mode === "signup" ? "new-password" : "current-password"} required /></div></label>
          {message && <div className="auth-message">{message}</div>}
          <button className="auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "signup" ? <>Create my account <ArrowUpRight size={15} /></> : <>Enter YKI AI <ArrowUpRight size={15} /></>}</button>
        </form>
        <div className="auth-points"><span><Check size={13} /> Secure account</span><span><Check size={13} /> Projects saved</span><span><Check size={13} /> Credits tracked</span></div>
      </section>
      <footer className="auth-footer">YKI AI · CREATE WHAT PEOPLE CANNOT STOP WATCHING.</footer>
    </main>
  );
}
