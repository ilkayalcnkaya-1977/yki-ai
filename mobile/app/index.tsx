import { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";

type Tab = "Keşfet" | "Oluştur" | "Projelerim" | "Profil";
type Mode = "Fotoğraftan Video" | "Metinden Video" | "AI Fotoğraf" | "Video Efektleri";

const modes: { icon: string; title: Mode; subtitle: string }[] = [
  { icon: "▧", title: "Fotoğraftan Video", subtitle: "Bir fotoğrafı hareketlendir" },
  { icon: "T▶", title: "Metinden Video", subtitle: "Fikrini sahneye dönüştür" },
  { icon: "✦", title: "AI Fotoğraf", subtitle: "Yeni bir görsel üret" },
  { icon: "▶", title: "Video Efektleri", subtitle: "Klibine yeni bir tarz ver" },
];

const ideas = [
  { emoji: "🌉", title: "İstanbul gecesi", subtitle: "Şehir • Sinematik" },
  { emoji: "🌑", title: "Gizemli karakter", subtitle: "Portre • Atmosfer" },
  { emoji: "🚘", title: "Gece sürüşü", subtitle: "Otomotiv • Aksiyon" },
];

const tabs: { icon: string; label: Tab }[] = [
  { icon: "⌂", label: "Keşfet" },
  { icon: "＋", label: "Oluştur" },
  { icon: "▣", label: "Projelerim" },
  { icon: "○", label: "Profil" },
];

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("Keşfet");
  const [selectedMode, setSelectedMode] = useState<Mode>("Metinden Video");
  const [prompt, setPrompt] = useState("");

  const openCreate = (mode: Mode) => {
    setSelectedMode(mode);
    setActiveTab("Oluştur");
  };

  const startGeneration = () => {
    if (!prompt.trim() && selectedMode === "Metinden Video") {
      Alert.alert("Bir fikir yaz", "Önce oluşturmak istediğin sahneyi kısaca anlat.");
      return;
    }
    Alert.alert(
      "Üretim bağlantısı bekleniyor",
      "Bu ekranda henüz gerçek üretim başlatılmıyor. Önce mevcut YKIA AI backend bağlantısını ve kredi doğrulamasını güvenli şekilde tamamlayacağız."
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.brandMark}><Text style={styles.markText}>✦</Text></View>
          <View style={styles.brand}>
            <Text style={styles.wordmark}>YKIA <Text style={styles.ai}>AI</Text></Text>
            <Text style={styles.tagline}>HAYAL ET. ÜRET.</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kredi bilgisi"
            style={styles.credits}
            onPress={() => Alert.alert("Kredi bakiyesi", "Gerçek bakiye, oturum açma ve sunucu bağlantısı tamamlandıktan sonra gösterilecek. Bu ekranda sahte bakiye göstermiyoruz.")}
          >
            <Text style={styles.bolt}>ϟ</Text><Text style={styles.creditText}>Krediler</Text>
          </Pressable>
        </View>

        <ScrollView key={activeTab} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {activeTab === "Keşfet" && (
            <>
              <Text style={styles.headline}>Hayal et. <Text style={styles.gradientText}>Üret.</Text></Text>
              <Text style={styles.subtitle}>Fotoğraf ve videolarını yapay zekâyla oluştur.</Text>

              <Pressable accessibilityRole="button" style={styles.hero} onPress={() => openCreate("Video Efektleri")}>
                <View style={styles.heroTop}><Text style={styles.heroTag}>✦ ÖNE ÇIKAN FİKİR</Text><Text style={styles.popularBadge}>POPÜLER TARZ</Text></View>
                <View style={styles.heroArtwork}><Text style={styles.heroEmoji}>🌃</Text><Text style={styles.heroCar}>🚘</Text><Text style={styles.heroSpark}>✦</Text></View>
                <Text style={styles.heroTitle}>Sinematik Sahne</Text>
                <Text style={styles.heroDescription}>Gece atmosferi, dramatik ışıklar ve film hissi.</Text>
                <View style={styles.heroButton}><Text style={styles.heroButtonText}>Bu tarzı keşfet  →</Text></View>
              </Pressable>

              <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Yaratıcı araçlar</Text><Text style={styles.sectionHint}>TEK PLATFORM</Text></View>
              <View style={styles.toolGrid}>
                {modes.map((mode) => (
                  <Pressable key={mode.title} accessibilityRole="button" style={styles.toolCard} onPress={() => openCreate(mode.title)}>
                    <View style={styles.toolArt}><Text style={styles.toolEmoji}>{mode.icon}</Text><Text style={styles.artSpark}>✦</Text></View>
                    <Text style={styles.toolTitle}>{mode.title}</Text>
                    <Text style={styles.toolSubtitle}>{mode.subtitle}</Text>
                    <Text style={styles.toolArrow}>›</Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Popüler fikirler</Text><Text style={styles.sectionHint}>İLHAM AL</Text></View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.popularRow}>
                {ideas.map((idea) => (
                  <Pressable key={idea.title} accessibilityRole="button" style={styles.popularCard} onPress={() => { setPrompt(idea.title + ", sinematik ışıklar, gerçekçi detaylar"); openCreate("Metinden Video"); }}>
                    <View style={styles.popularArt}><Text style={styles.popularEmoji}>{idea.emoji}</Text></View>
                    <Text style={styles.popularTitle}>{idea.title}</Text>
                    <Text style={styles.popularSubtitle}>{idea.subtitle}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          )}

          {activeTab === "Oluştur" && (
            <View>
              <Text style={styles.pageEyebrow}>YARATICI STÜDYO</Text>
              <Text style={styles.pageTitle}>Fikrini oluştur.</Text>
              <Text style={styles.pageSubtitle}>Bir araç seç, fikrini anlat. Üretim düğmesi backend bağlantısı tamamlanınca etkinleştirilecek.</Text>
              <Text style={styles.fieldLabel}>NE OLUŞTURMAK İSTİYORSUN?</Text>
              {modes.map((mode) => (
                <Pressable key={mode.title} accessibilityRole="button" onPress={() => setSelectedMode(mode.title)} style={[styles.modeRow, selectedMode === mode.title && styles.modeSelected]}>
                  <View style={styles.modeIcon}><Text style={styles.modeIconText}>{mode.icon}</Text></View>
                  <View style={styles.modeCopy}><Text style={styles.modeTitle}>{mode.title}</Text><Text style={styles.modeSubtitle}>{mode.subtitle}</Text></View>
                  <Text style={styles.radio}>{selectedMode === mode.title ? "●" : "○"}</Text>
                </Pressable>
              ))}
              <Text style={[styles.fieldLabel, { marginTop: 22 }]}>FİKRİNİ ANLAT</Text>
              <TextInput
                accessibilityLabel="Üretim fikri"
                value={prompt}
                onChangeText={setPrompt}
                placeholder={selectedMode === "Fotoğraftan Video" ? "Önce fotoğraf yükleme alanını backend bağlantısında açacağız..." : "Örn. İstanbul Boğazı'nda yağmurlu bir gece, sinematik kamera hareketi..."}
                placeholderTextColor="#777483"
                multiline
                textAlignVertical="top"
                style={styles.promptInput}
              />
              <Pressable accessibilityRole="button" style={styles.generateButton} onPress={startGeneration}>
                <Text style={styles.generateButtonText}>Üretim bağlantısını kontrol et  →</Text>
              </Pressable>
              <Text style={styles.helper}>Güvenlik: üretim ve kredi düşümü sunucuda doğrulanmalı. Bu prototip henüz üretim isteği göndermiyor.</Text>
            </View>
          )}

          {activeTab === "Projelerim" && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}><Text style={styles.emptyIconText}>▣</Text></View>
              <Text style={styles.pageTitle}>Projelerin burada.</Text>
              <Text style={styles.pageSubtitle}>Üretilen görseller, videolar ve üretim durumları, hesabın ve geçmiş API'si bağlandığında bu alanda listelenecek.</Text>
              <Pressable style={styles.secondaryButton} onPress={() => setActiveTab("Oluştur")}><Text style={styles.secondaryButtonText}>Yeni proje hazırla  →</Text></Pressable>
            </View>
          )}

          {activeTab === "Profil" && (
            <View>
              <Text style={styles.pageEyebrow}>HESABIN</Text>
              <Text style={styles.pageTitle}>YKIA AI profilin</Text>
              <Text style={styles.pageSubtitle}>Hesap, güvenlik, abonelik ve kredi ayrıntıları için mevcut YKIA AI oturum sistemi henüz mobil uygulamaya bağlanmadı.</Text>
              <View style={styles.profileCard}><Text style={styles.profileTitle}>Güvenli hesap bağlantısı</Text><Text style={styles.profileText}>Mobil uygulamada ayrı ve güvenli oturum saklama, çıkış yapma ve sunucudan doğrulanmış hesap bilgileri kurulacak.</Text></View>
              <View style={styles.profileCard}><Text style={styles.profileTitle}>Krediler ve paketler</Text><Text style={styles.profileText}>Bakiye cihazdan değiştirilemez. iOS içi dijital satın alımlar için Apple kuralları ve sunucu taraflı işlem doğrulaması gerekir.</Text></View>
            </View>
          )}
          <Text style={styles.footer}>YKIA AI • Yaratıcılığın sınırlarını genişlet.</Text>
        </ScrollView>

        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <Pressable key={tab.label} accessibilityRole="button" accessibilityState={{ selected: activeTab === tab.label }} style={styles.tab} onPress={() => setActiveTab(tab.label)}>
              <Text style={[styles.tabIcon, activeTab === tab.label && styles.tabActive]}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.label && styles.tabActive]}>{tab.label}</Text>
              {activeTab === tab.label ? <View style={styles.activeDot} /> : null}
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#08090e" },
  screen: { flex: 1, backgroundColor: "#08090e" },
  content: { paddingHorizontal: 18, paddingTop: 7, paddingBottom: 25, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingTop: 7, paddingBottom: 17, borderBottomWidth: 1, borderBottomColor: "#1c1a25" },
  brandMark: { width: 39, height: 39, borderRadius: 13, alignItems: "center", justifyContent: "center", backgroundColor: "#22182e" },
  markText: { color: "#c17aff", fontSize: 28 },
  brand: { marginLeft: 9, flex: 1 },
  wordmark: { color: "#f8f7fb", fontSize: 22, fontWeight: "900", letterSpacing: 0.5 },
  ai: { color: "#f29a55" },
  tagline: { color: "#92919f", fontSize: 8, letterSpacing: 2, marginTop: 2 },
  credits: { flexDirection: "row", alignItems: "center", borderColor: "#6b4a37", borderWidth: 1, borderRadius: 22, paddingVertical: 8, paddingHorizontal: 11, gap: 6 },
  bolt: { color: "#ffb14e", fontSize: 19, fontWeight: "900" },
  creditText: { color: "#f5f3f7", fontSize: 11, fontWeight: "700" },
  headline: { color: "#faf9fc", fontSize: 37, fontWeight: "900", letterSpacing: -1.3, marginTop: 8 },
  gradientText: { color: "#cf83ef" },
  subtitle: { color: "#b0afbb", fontSize: 14, lineHeight: 21, marginTop: 5, marginBottom: 20 },
  hero: { minHeight: 270, backgroundColor: "#19141f", borderColor: "#56384f", borderWidth: 1, borderRadius: 22, padding: 16, marginBottom: 25, overflow: "hidden" },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  heroTag: { color: "#f2c58b", fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
  popularBadge: { color: "#fff0e7", fontSize: 8, fontWeight: "800", borderRadius: 14, overflow: "hidden", backgroundColor: "#512b3a", paddingHorizontal: 9, paddingVertical: 6 },
  heroArtwork: { height: 105, marginTop: 12, borderRadius: 13, backgroundColor: "#211b2c", alignItems: "center", justifyContent: "center", flexDirection: "row" },
  heroEmoji: { fontSize: 62 },
  heroCar: { fontSize: 42, marginLeft: 3, marginTop: 28 },
  heroSpark: { color: "#e9a6ff", fontSize: 20, alignSelf: "flex-start", marginTop: 12 },
  heroTitle: { color: "#fff", fontSize: 21, fontWeight: "900", marginTop: 12 },
  heroDescription: { color: "#c4bdca", fontSize: 12, lineHeight: 18, marginTop: 5 },
  heroButton: { alignSelf: "flex-start", backgroundColor: "#7c45a8", borderRadius: 22, paddingHorizontal: 14, paddingVertical: 10, marginTop: 12 },
  heroButtonText: { color: "#fff", fontWeight: "800", fontSize: 11 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  sectionTitle: { color: "#f7f5fa", fontSize: 19, fontWeight: "800" },
  sectionHint: { color: "#777687", fontSize: 8, letterSpacing: 1 },
  toolGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 18 },
  toolCard: { width: "48.4%", minHeight: 172, borderRadius: 18, padding: 12, marginBottom: 11, borderWidth: 1, borderColor: "#343044", backgroundColor: "#14131d", overflow: "hidden" },
  toolArt: { height: 73, borderRadius: 12, backgroundColor: "#211b31", justifyContent: "center", paddingLeft: 13, marginBottom: 10, flexDirection: "row", alignItems: "center" },
  toolEmoji: { color: "#d79aff", fontSize: 34, fontWeight: "800" },
  artSpark: { color: "#f6b26b", fontSize: 20, marginLeft: 13, marginTop: -24 },
  toolTitle: { color: "#faf8fc", fontSize: 12, fontWeight: "800" },
  toolSubtitle: { color: "#9f9cae", fontSize: 10, lineHeight: 15, marginTop: 5, paddingRight: 4 },
  toolArrow: { color: "#d8b6fa", position: "absolute", right: 10, bottom: 8, fontSize: 21 },
  popularRow: { paddingBottom: 8, gap: 11 },
  popularCard: { width: 151, borderRadius: 16, borderWidth: 1, borderColor: "#302b3d", backgroundColor: "#14131b", padding: 10 },
  popularArt: { height: 80, borderRadius: 10, backgroundColor: "#252033", alignItems: "center", justifyContent: "center", marginBottom: 9 },
  popularEmoji: { fontSize: 39 },
  popularTitle: { color: "#f7f5fa", fontSize: 12, fontWeight: "800" },
  popularSubtitle: { color: "#9b98a8", fontSize: 10, marginTop: 4 },
  pageEyebrow: { color: "#c995f2", fontSize: 10, fontWeight: "800", letterSpacing: 1.7, marginTop: 14, marginBottom: 10 },
  pageTitle: { color: "#faf9fc", fontSize: 29, fontWeight: "900", letterSpacing: -0.6 },
  pageSubtitle: { color: "#aaa7b6", fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 22 },
  fieldLabel: { color: "#b5a9c8", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 10 },
  modeRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#12121a", borderWidth: 1, borderColor: "#2c2937", borderRadius: 14, padding: 11, marginBottom: 8 },
  modeSelected: { borderColor: "#b16be6", backgroundColor: "#21182c" },
  modeIcon: { width: 38, height: 38, borderRadius: 11, backgroundColor: "#2a2038", alignItems: "center", justifyContent: "center" },
  modeIconText: { color: "#d9a5ff", fontSize: 20, fontWeight: "800" },
  modeCopy: { flex: 1, marginLeft: 11 },
  modeTitle: { color: "#f6f3fa", fontSize: 12, fontWeight: "800" },
  modeSubtitle: { color: "#9b97a8", fontSize: 10, marginTop: 4 },
  radio: { color: "#c98cf4", fontSize: 18, paddingHorizontal: 6 },
  promptInput: { minHeight: 135, borderRadius: 15, borderWidth: 1, borderColor: "#393143", backgroundColor: "#121119", color: "#f7f4fb", padding: 14, fontSize: 13, lineHeight: 20 },
  generateButton: { backgroundColor: "#69418b", borderRadius: 14, padding: 15, alignItems: "center", marginTop: 14 },
  generateButtonText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  helper: { color: "#878293", fontSize: 10, lineHeight: 16, marginTop: 10 },
  emptyState: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: 55 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, backgroundColor: "#21182e", alignItems: "center", justifyContent: "center", marginBottom: 22 },
  emptyIconText: { color: "#cf92ff", fontSize: 36 },
  secondaryButton: { borderWidth: 1, borderColor: "#9b67c1", borderRadius: 13, paddingHorizontal: 18, paddingVertical: 13, marginTop: 5 },
  secondaryButtonText: { color: "#e1b8ff", fontSize: 12, fontWeight: "800" },
  profileCard: { borderWidth: 1, borderColor: "#302b3b", backgroundColor: "#14131c", borderRadius: 15, padding: 15, marginBottom: 11 },
  profileTitle: { color: "#f6f2fa", fontSize: 13, fontWeight: "800", marginBottom: 7 },
  profileText: { color: "#a5a0b1", fontSize: 11, lineHeight: 17 },
  footer: { color: "#666474", fontSize: 10, textAlign: "center", marginTop: 24, marginBottom: 12 },
  tabBar: { flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingTop: 9, paddingBottom: 7, backgroundColor: "#0d0e14", borderTopColor: "#272431", borderTopWidth: 1 },
  tab: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 49 },
  tabIcon: { color: "#c7c3d0", fontSize: 23, fontWeight: "700" },
  tabLabel: { color: "#aaa6b5", fontSize: 10, marginTop: 2 },
  tabActive: { color: "#c27bff" },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#c27bff", marginTop: 3 },
});