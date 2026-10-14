import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

const tools = [
  { icon: "▧", title: "Fotoğraftan Video", subtitle: "Fotoğrafını hareketlendir.", colors: ["#34204b", "#171923"] },
  { icon: "T▶", title: "Metinden Video", subtitle: "Hayalindeki sahneyi yaz.", colors: ["#24203f", "#141721"] },
  { icon: "✦", title: "AI Fotoğraf", subtitle: "Eşsiz görseller oluştur.", colors: ["#3c2348", "#171923"] },
  { icon: "▶", title: "Video Efektleri", subtitle: "Tarzını bir üst seviyeye taşı.", colors: ["#1e2944", "#151720"] },
];

const popular = [
  { emoji: "🌉", title: "İstanbul'da sinema", subtitle: "Sinematik sahne" },
  { emoji: "🌑", title: "Gizemli karakter", subtitle: "Portre ve atmosfer" },
  { emoji: "🏎️", title: "Gece sürüşü", subtitle: "Otomotiv klibi" },
];

const tabs = [
  { icon: "⌂", label: "Keşfet" },
  { icon: "＋", label: "Oluştur" },
  { icon: "▣", label: "Projelerim" },
  { icon: "○", label: "Profil" },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("Keşfet");
  const [notice, setNotice] = useState("");

  const selectTool = (title: string) => {
    setActiveTab("Oluştur");
    setNotice(title + " seçildi. Üretim servisi bağlantısı tamamlandığında burada kullanıma açılacak.");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandMark}><Text style={styles.markText}>✦</Text></View>
          <View style={styles.brand}>
            <Text style={styles.wordmark}>YKIA <Text style={styles.ai}>AI</Text></Text>
            <Text style={styles.tagline}>HAYAL ET. ÜRET.</Text>
          </View>
          <Pressable style={styles.credits} onPress={() => setNotice("Kredi bakiyesi ve paketler backend bağlantısından sonra gösterilecek.")}>
            <Text style={styles.bolt}>ϟ</Text><Text style={styles.creditText}>Krediler</Text><Text style={styles.plus}>＋</Text>
          </Pressable>
        </View>

        <Text style={styles.headline}>Hayal et. <Text style={styles.gradientText}>Üret.</Text></Text>
        <Text style={styles.subtitle}>Fotoğraf ve videolarını yapay zekâyla oluştur.</Text>

        <Pressable style={styles.hero} onPress={() => selectTool("Sinematik Sahne")}>
          <View style={styles.heroGlow} />
          <View style={styles.heroTop}><Text style={styles.heroTag}>✦ ÖNE ÇIKAN EFEKT</Text><Text style={styles.popularBadge}>🔥 Popüler</Text></View>
          <Text style={styles.heroEmoji}>🌃 🚘</Text>
          <Text style={styles.heroTitle}>Sinematik Sahne</Text>
          <Text style={styles.heroDescription}>Fotoğraflarını etkileyici videolara dönüştür.</Text>
          <View style={styles.heroButton}><Text style={styles.heroButtonText}>Hemen dene  →</Text></View>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Yaratıcı araçlar</Text>
          <Text style={styles.sectionHint}>HER ŞEY TEK YERDE</Text>
        </View>
        <View style={styles.toolGrid}>
          {tools.map((tool) => (
            <Pressable key={tool.title} style={styles.toolCard} onPress={() => selectTool(tool.title)}>
              <View style={styles.toolArt}><Text style={styles.toolEmoji}>{tool.icon}</Text><Text style={styles.artSpark}>✦</Text></View>
              <Text style={styles.toolTitle}>{tool.title}</Text>
              <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
              <Text style={styles.toolArrow}>›</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popüler fikirler</Text>
          <Pressable onPress={() => setNotice("Popüler şablonların tamamı yakında burada.")}><Text style={styles.seeAll}>Tümünü gör  →</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
          {popular.map((item) => (
            <Pressable key={item.title} style={styles.popularCard} onPress={() => selectTool(item.title)}>
              <View style={styles.popularArt}><Text style={styles.popularEmoji}>{item.emoji}</Text></View>
              <Text style={styles.popularTitle}>{item.title}</Text>
              <Text style={styles.popularSubtitle}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {notice ? (
          <Pressable style={styles.notice} onPress={() => setNotice("")}>
            <Text style={styles.noticeText}>{notice}</Text><Text style={styles.dismiss}>Kapat ×</Text>
          </Pressable>
        ) : null}
        <Text style={styles.footer}>YKIA AI • Yaratıcılığın sınırlarını genişlet.</Text>
      </ScrollView>
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <Pressable key={tab.label} style={styles.tab} onPress={() => { setActiveTab(tab.label); if (tab.label !== "Keşfet") setNotice(tab.label + " bölümü için ekranı sıradaki adımda geliştireceğiz."); }}>
            <Text style={[styles.tabIcon, activeTab === tab.label && styles.tabActive]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.label && styles.tabActive]}>{tab.label}</Text>
            {activeTab === tab.label ? <View style={styles.activeDot} /> : null}
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#08090e" },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 24 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 27 },
  brandMark: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#22182e" },
  markText: { color: "#c17aff", fontSize: 28 },
  brand: { marginLeft: 9, flex: 1 },
  wordmark: { color: "#f8f7fb", fontSize: 22, fontWeight: "900", letterSpacing: 0.5 },
  ai: { color: "#f29a55" },
  tagline: { color: "#92919f", fontSize: 8, letterSpacing: 2, marginTop: 2 },
  credits: { flexDirection: "row", alignItems: "center", borderColor: "#9a6a40", borderWidth: 1, borderRadius: 22, paddingVertical: 8, paddingHorizontal: 10, gap: 6 },
  bolt: { color: "#ffb14e", fontSize: 19, fontWeight: "900" },
  creditText: { color: "#f5f3f7", fontSize: 11, fontWeight: "700" },
  plus: { color: "#d9a4ff", fontSize: 16 },
  headline: { color: "#faf9fc", fontSize: 38, fontWeight: "900", letterSpacing: -1.3 },
  gradientText: { color: "#cf83ef" },
  subtitle: { color: "#b0afbb", fontSize: 14, lineHeight: 21, marginTop: 5, marginBottom: 20 },
  hero: { minHeight: 255, backgroundColor: "#19141f", borderColor: "#56384f", borderWidth: 1, borderRadius: 22, padding: 17, marginBottom: 26, overflow: "hidden" },
  heroGlow: { position: "absolute", right: -40, top: 20, width: 220, height: 220, borderRadius: 110, backgroundColor: "#3b2048", opacity: 0.65 },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroTag: { color: "#f2c58b", fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  popularBadge: { color: "#fff0e7", fontSize: 10, borderRadius: 14, overflow: "hidden", backgroundColor: "#512b3a", paddingHorizontal: 9, paddingVertical: 6 },
  heroEmoji: { fontSize: 54, marginTop: 19, marginBottom: 8 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "900" },
  heroDescription: { color: "#c4bdca", fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: "78%" },
  heroButton: { alignSelf: "flex-end", backgroundColor: "#a65fe5", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, marginTop: -5 },
  heroButtonText: { color: "#fff", fontWeight: "800", fontSize: 11 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  sectionTitle: { color: "#f7f5fa", fontSize: 19, fontWeight: "800" },
  sectionHint: { color: "#777687", fontSize: 8, letterSpacing: 1 },
  toolGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 25 },
  toolCard: { width: "48.4%", minHeight: 175, borderRadius: 18, padding: 13, marginBottom: 11, borderWidth: 1, borderColor: "#343044", backgroundColor: "#14131d", overflow: "hidden" },
  toolArt: { height: 78, borderRadius: 12, backgroundColor: "#211b31", justifyContent: "center", paddingLeft: 13, marginBottom: 11, flexDirection: "row", alignItems: "center" },
  toolEmoji: { color: "#d79aff", fontSize: 36, fontWeight: "800" },
  artSpark: { color: "#f6b26b", fontSize: 20, marginLeft: 13, marginTop: -24 },
  toolTitle: { color: "#faf8fc", fontSize: 13, fontWeight: "800" },
  toolSubtitle: { color: "#9f9cae", fontSize: 10, lineHeight: 15, marginTop: 5, paddingRight: 8 },
  toolArrow: { color: "#d8b6fa", position: "absolute", right: 12, bottom: 12, fontSize: 21 },
  seeAll: { color: "#c7a1f4", fontSize: 11, fontWeight: "700" },
  popularRow: { paddingBottom: 8, gap: 11 },
  popularCard: { width: 155, borderRadius: 16, borderWidth: 1, borderColor: "#302b3d", backgroundColor: "#14131b", padding: 10 },
  popularArt: { height: 82, borderRadius: 10, backgroundColor: "#252033", alignItems: "center", justifyContent: "center", marginBottom: 9 },
  popularEmoji: { fontSize: 39 },
  popularTitle: { color: "#f7f5fa", fontSize: 12, fontWeight: "800" },
  popularSubtitle: { color: "#9b98a8", fontSize: 10, marginTop: 4 },
  notice: { borderColor: "#7651a0", borderWidth: 1, borderRadius: 14, backgroundColor: "#21172d", padding: 13, marginTop: 14 },
  noticeText: { color: "#eee4fa", fontSize: 12, lineHeight: 18 },
  dismiss: { color: "#d2a5f7", fontSize: 11, fontWeight: "700", marginTop: 7 },
  footer: { color: "#666474", fontSize: 10, textAlign: "center", marginTop: 20, marginBottom: 12 },
  tabBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingTop: 10, paddingBottom: 7, backgroundColor: "#0d0e14", borderTopColor: "#272431", borderTopWidth: 1 },
  tab: { minWidth: 68, alignItems: "center", justifyContent: "center" },
  tabIcon: { color: "#c7c3d0", fontSize: 24, fontWeight: "700" },
  tabLabel: { color: "#aaa6b5", fontSize: 10, marginTop: 2 },
  tabActive: { color: "#c27bff" },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#c27bff", marginTop: 4 },
});