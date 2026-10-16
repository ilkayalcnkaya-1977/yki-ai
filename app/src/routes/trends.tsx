import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Flame, Image as ImageIcon, Video, Sparkles, Search, RefreshCw } from "lucide-react";
import "@/yki-pro.css";

export const Route = createFileRoute("/trends")({ component: Trends });

const trendIdeas = [
  { id: "01", title: "Sinematik portre", category: "Fotoğraf", label: "Portre", desc: "Tek bir fotoğrafı dramatik ışık, sinema renkleri ve güçlü atmosferle yeniden yorumla.", prompt: "cinematic portrait, dramatic lighting, film color grade" },
  { id: "02", title: "Dünyayı dönüştür", category: "Video", label: "Dönüşüm", desc: "Gerçek bir mekânı fütüristik, fantastik veya hayalî bir dünyaya dönüştür.", prompt: "cinematic world transformation, vertical short video" },
  { id: "03", title: "Moda geçişi", category: "Reels", label: "Moda", desc: "Kıyafet, stil ve sahne geçişleri için dikey video fikri oluştur.", prompt: "fashion transition, vertical social video" },
  { id: "04", title: "Ürün reklam filmi", category: "Video", label: "Marka", desc: "Bir ürün için kısa, premium görünümlü reklam konsepti tasarla.", prompt: "premium product commercial, cinematic close-up" },
  { id: "05", title: "POV: beklenmedik son", category: "Reels", label: "Hikâye", desc: "İlk saniyelerde merak uyandıran, kısa ve sürprizli bir hikâye kurgula.", prompt: "first person POV short story with a visual twist" },
  { id: "06", title: "Araba dönüşümü", category: "Fotoğraf", label: "Otomobil", desc: "Otomobil görseli için gelecekçi, sinematik bir tasarım konsepti hazırla.", prompt: "futuristic cinematic car transformation" },
  { id: "07", title: "Mini sinema", category: "Video", label: "Hikâye", desc: "Dikey formatta kısa bir sahne, duygu ve kamera hareketi fikri geliştir.", prompt: "vertical micro cinema, cinematic camera movement" },
  { id: "08", title: "Gerçek ve yapay zekâ", category: "Fotoğraf", label: "Yaratıcı", desc: "Gerçek görüntü ile hayalî bir dünya arasında özgün bir görsel karşıtlık kur.", prompt: "real versus AI surreal visual concept" },
];

function Trends() {
  const [filter, setFilter] = useState("Tümü");
  const [search, setSearch] = useState("");
  const categories = ["Tümü", "Video", "Fotoğraf", "Reels"];
  const filtered = useMemo(() => trendIdeas.filter((idea) => (filter === "Tümü" || idea.category === filter) && (idea.title + " " + idea.desc + " " + idea.label).toLocaleLowerCase("tr-TR").includes(search.toLocaleLowerCase("tr-TR"))), [filter, search]);
  return (
    <main className="yki-pro-page">
      <nav className="yki-pro-nav"><a className="yki-pro-brand" href="/">YKI AI<span>®</span></a><div className="yki-pro-links"><a href="/">Keşfet</a><a href="/trends" aria-current="page">Trend Radar</a><a href="/studio">Stüdyo</a><a href="/credits">Krediler</a></div><div className="yki-pro-actions"><a className="yki-pro-btn primary" href="/studio">Üretmeye başla <ArrowUpRight size={15}/></a></div></nav>
      <section className="yki-pro-hero">
        <span className="yki-pro-kicker"><Flame size={14}/> YKI AI · Trend Radar</span>
        <h1>Fikri keşfet.<br/><em>Kendi akımını yarat.</em></h1>
        <p>Fotoğraf, dikey video ve sosyal içerik fikirlerini keşfet. Bir şablon seçerek üretim stüdyosuna geçebilir, komutu kendi fikrine göre düzenleyebilirsin.</p>
        <div className="yki-pro-hero-ctas"><a className="yki-pro-btn primary" href="/studio"><Sparkles size={15}/> Stüdyoyu aç</a><a className="yki-pro-btn" href="/"><ArrowLeft size={15}/> Ana sayfaya dön</a></div>
        <div className="yki-pro-notice"><RefreshCw size={16}/><div><strong>Canlı trend verisi henüz bağlı değil</strong><br/>Aşağıdaki içerikler üretime başlangıç için hazırlanmış fikir şablonlarıdır; güncel platform sıralaması, görüntülenme sayısı veya yükseliş yüzdesi değildir. Gerçek trend kaynağı bağlandığında kaynak adı ve son güncelleme zamanı burada gösterilecek.</div></div>
      </section>
      <section className="yki-pro-section">
        <div className="yki-pro-sectionhead"><div><span className="yki-pro-kicker"><Search size={14}/> Fikir kütüphanesi</span><h2>Ne üretmek istiyorsun?</h2><p className="yki-pro-muted">Kategori seç veya anahtar kelime ara.</p></div><span className="yki-pro-muted">{filtered.length} fikir</span></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>{categories.map((c) => <button key={c} type="button" className={`yki-pro-btn ${filter === c ? "primary" : ""}`} onClick={() => setFilter(c)}>{c}</button>)}</div>
        <label style={{display:"flex",alignItems:"center",gap:10,border:"1px solid #ffffff22",borderRadius:14,padding:"13px 15px",marginBottom:18,background:"#ffffff05"}}><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Portre, moda, araba, reklam..." aria-label="Fikirlerde ara" style={{background:"transparent",border:0,outline:0,color:"white",width:"100%",fontSize:14}}/></label>
        <div className="yki-pro-trendgrid">{filtered.map((idea) => <article className="yki-pro-trendcard" key={idea.id}><div className="yki-pro-trendtop"><span className="yki-pro-tag">{idea.category}</span><span className="yki-pro-trendnum">FİKİR {idea.id}</span></div><div><h3>{idea.title}</h3><p>{idea.desc}</p></div><div className="yki-pro-trendfoot"><small>{idea.label}</small><a className="yki-pro-arrow" href={`/studio?trend=${encodeURIComponent(idea.prompt)}`}>Bu fikri kullan ↗</a></div></article>)}</div>
        {filtered.length === 0 && <p className="yki-pro-muted">Bu aramayla eşleşen fikir bulunamadı. Başka bir kelime dene.</p>}
      </section>
      <section className="yki-pro-section"><div className="yki-pro-featuregrid"><article className="yki-pro-feature"><ImageIcon size={21}/><strong>Fotoğraf</strong><p>Görsel konseptini seç ve desteklenen fotoğraf araçlarıyla dene.</p></article><article className="yki-pro-feature"><Video size={21}/><strong>Video</strong><p>Komutunu stüdyoda düzenle. Üretim desteği seçtiğin modele bağlıdır.</p></article><article className="yki-pro-feature"><Sparkles size={21}/><strong>Kendi yorumun</strong><p>Trend fikrini kopyalamak yerine kendine özgü bir konsepte dönüştür.</p></article></div></section>
      <footer className="yki-pro-footer"><div><a className="yki-pro-brand" href="/">YKI AI<span>®</span></a><p>Yapay zekâ destekli yaratıcı stüdyo.</p></div><div className="yki-pro-footerlinks"><a href="/about">Hakkımızda</a><a href="/contact">İletişim</a><a href="/privacy">Gizlilik ve KVKK</a><a href="/terms">Kullanım koşulları</a><a href="/credits">Kredi paketleri</a></div></footer>
    </main>
  );
}
