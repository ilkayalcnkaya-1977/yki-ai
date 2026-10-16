import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Sparkles, Flame, Layers3, WandSparkles, Video, Image as ImageIcon, Compass, FolderOpen, Coins, UserRound } from "lucide-react";
import "@/yki-pro.css";

export const Route = createFileRoute("/")({ component: Index });

const trendCards = [
  { n: "01", tag: "Fotoğraf", title: "Sinematik portre", desc: "Tek fotoğrafı güçlü ışık, atmosfer ve film karesi hissiyle yeniden yorumla.", prompt: "cinematic portrait" },
  { n: "02", tag: "Video", title: "Bir dünyayı dönüştür", desc: "Şehrini, odanı veya bir fikri başka bir evrene dönüştüren kısa video konsepti.", prompt: "world transformation" },
  { n: "03", tag: "Reels", title: "Moda ve stil geçişi", desc: "Kombin, ürün veya karakter dönüşümü için dikey içerik fikri.", prompt: "fashion transition" },
];

function Index() {
  return (
    <main className="yki-pro-page">
      <nav className="yki-pro-nav">
        <a className="yki-pro-brand" href="#top">YKI AI<span>®</span></a>
        <div className="yki-pro-links"><a href="#trends">Trendler</a><a href="/studio">Stüdyo</a><a href="/projects">Projeler</a><a href="/credits">Krediler</a></div>
        <div className="yki-pro-actions"><a className="yki-pro-btn yki-pro-ghost" href="/login">Giriş yap</a><a className="yki-pro-btn primary" href="/studio">Üretmeye başla <ArrowUpRight size={15}/></a></div>
      </nav>
      <section id="top" className="yki-pro-hero">
        <span className="yki-pro-kicker"><Sparkles size={14}/> Yaratıcılığın yeni alanı</span>
        <h1>Trendleri yakala.<br/><em>Kendi tarzını üret.</em></h1>
        <p>Fotoğraf fikirlerini, kısa video konseptlerini ve yaratıcı şablonları tek bir yerde keşfet. Fikrini seç, üretim stüdyosuna geç ve kendi içeriğini oluştur.</p>
        <div className="yki-pro-hero-ctas"><a className="yki-pro-btn primary" href="/studio"><Video size={16}/> Stüdyoda oluştur <ArrowUpRight size={15}/></a><a className="yki-pro-btn" href="/trends"><Flame size={15}/> Trend Radar'ı keşfet</a></div>
        <div className="yki-pro-statline"><span>✦ Fotoğraf fikirleri</span><span>▶ Kısa video konseptleri</span><span>↗ Dikey içerik odaklı</span></div>
      </section>
      <section id="trends" className="yki-pro-section">
        <div className="yki-pro-sectionhead"><div><span className="yki-pro-kicker"><Flame size={14}/> Trend Radar</span><h2>Üretime hazır yaratıcı fikirler</h2><p className="yki-pro-muted">Keşfet, ilham al ve desteklenen üretim araçlarıyla kendi yorumunu oluştur.</p></div><a className="yki-pro-btn" href="/trends">Tüm fikirler <ArrowUpRight size={15}/></a></div>
        <div className="yki-pro-trendgrid">{trendCards.map((t) => <article className="yki-pro-trendcard" key={t.n}><div className="yki-pro-trendtop"><span className="yki-pro-tag">{t.tag}</span><span className="yki-pro-trendnum">FİKİR {t.n}</span></div><div><h3>{t.title}</h3><p>{t.desc}</p></div><div className="yki-pro-trendfoot"><small>Yaratıcı şablon</small><a className="yki-pro-arrow" href={`/studio?trend=${encodeURIComponent(t.prompt)}`}>Bu fikri kullan ↗</a></div></article>)}</div>
        <div className="yki-pro-notice"><Flame size={16}/><div><strong>Trend verisi hakkında</strong><br/>Bu kartlar başlangıç için seçilmiş yaratıcı fikirlerdir; canlı platform ölçümü veya gerçek zamanlı popülerlik sıralaması değildir. Güncel trend bağlantıları etkinleştirildiğinde kaynak ve son güncelleme bilgisi ayrıca gösterilecektir.</div></div>
      </section>
      <section className="yki-pro-section">
        <div className="yki-pro-sectionhead"><div><span className="yki-pro-kicker"><Layers3 size={14}/> Tek platform</span><h2>Fikirden içeriğe, tek akışta</h2></div></div>
        <div className="yki-pro-featuregrid">
          <article className="yki-pro-feature"><ImageIcon size={21}/><strong>Fotoğraf fikirleri</strong><p>Görsel konseptlerini seç, açıklamanı hazırla ve desteklenen araçlarda dene.</p></article>
          <article className="yki-pro-feature"><Video size={21}/><strong>Kısa video stüdyosu</strong><p>Komutunu ve formatını belirle. Gerçek üretim desteği olan modellerle devam et.</p></article>
          <article className="yki-pro-feature"><WandSparkles size={21}/><strong>Trendden taslağa</strong><p>Bir fikri kendi markana ve anlatımına göre yeniden düzenle.</p></article>
        </div>
      </section>
      <section className="yki-pro-section"><div className="yki-pro-sectionhead"><div><span className="yki-pro-kicker">Başlamak kolay</span><h2>Fikrini hayata geçir.</h2><p className="yki-pro-muted">Üretim ve kredi kullanımı, seçilen modelin gerçekten desteklenmesine bağlıdır.</p></div><a className="yki-pro-btn primary" href="/studio">Stüdyoyu aç <ArrowUpRight size={15}/></a></div></section>
      <footer className="yki-pro-footer"><div><a className="yki-pro-brand" href="/">YKI AI<span>®</span></a><p>Yapay zekâ destekli yaratıcı stüdyo.</p></div><div className="yki-pro-footerlinks"><a href="/about">Hakkımızda</a><a href="/contact">İletişim</a><a href="/privacy">Gizlilik ve KVKK</a><a href="/terms">Kullanım koşulları</a><a href="/pre-information">Ön bilgilendirme</a><a href="/distance-sales">Mesafeli satış</a><a href="/refund-policy">İade koşulları</a><a href="/credits">Kredi paketleri</a></div></footer>
      <nav className="yki-pro-mobilebar" aria-label="Mobil menü"><a href="/" className="active"><Compass/><span>Keşfet</span></a><a href="/studio"><Sparkles/><span>Oluştur</span></a><a href="/projects"><FolderOpen/><span>Projeler</span></a><a href="/credits"><Coins/><span>Krediler</span></a><a href="/login"><UserRound/><span>Profil</span></a></nav>
    </main>
  );
}
