import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from "react-native";

const features = [
  { icon: "✦", title: "Metinden videoya", description: "Fikrini yaz, video üretim akışını başlat." },
  { icon: "▧", title: "Projelerim", description: "Ürettiğin videoları ve çalışmalarını takip et." },
  { icon: "◈", title: "Kredi bakiyesi", description: "Hesabındaki kullanılabilir kredileri görüntüle." },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}><Text style={styles.logoText}>Y</Text></View>
          <View style={styles.brand}>
            <Text style={styles.wordmark}>YKIA AI</Text>
            <Text style={styles.tagline}>YARATICILIĞINI HAREKETE GEÇİR</Text>
          </View>
          <View style={styles.avatar}><Text style={styles.avatarText}>☺</Text></View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>YENİ NESİL YARATICI STÜDYO</Text>
          <Text style={styles.headline}>Hayal et.{ "\n" }Videoya dönüştür.</Text>
          <Text style={styles.subtitle}>Fikrini yaz ve yapay zekâ destekli video üretim yolculuğuna başla.</Text>
          <Pressable style={styles.primaryButton} accessibilityRole="button" onPress={() => {}}>
            <Text style={styles.primaryButtonText}>Video oluşturmaya başla  →</Text>
          </Pressable>
          <Text style={styles.note}>Önizleme • Üretim servisi bağlantısı henüz etkin değil</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Stüdyon</Text>
          <Text style={styles.sectionHint}>HER ŞEY TEK YERDE</Text>
        </View>
        {features.map((feature) => (
          <Pressable key={feature.title} style={styles.feature} accessibilityRole="button">
            <View style={styles.featureIcon}><Text style={styles.featureIconText}>{feature.icon}</Text></View>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
        <Text style={styles.footer}>YKIA AI  •  Yaratıcılığın sınırlarını genişlet.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#090a0d" },
  content: { padding: 22, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 28 },
  logo: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#d7ff64", alignItems: "center", justifyContent: "center" },
  logoText: { color: "#10120a", fontSize: 25, fontWeight: "900" },
  brand: { marginLeft: 11, flex: 1 },
  wordmark: { color: "#f5f5f5", fontSize: 18, fontWeight: "800", letterSpacing: 1.4 },
  tagline: { color: "#8d909a", fontSize: 8, letterSpacing: 1.2, marginTop: 3 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#1c1e25", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#f6f6f6", fontSize: 19 },
  hero: { backgroundColor: "#15171d", borderColor: "#292c35", borderWidth: 1, borderRadius: 26, padding: 22, marginBottom: 30 },
  eyebrow: { color: "#d7ff64", fontSize: 10, fontWeight: "800", letterSpacing: 1.6, marginBottom: 17 },
  headline: { color: "#ffffff", fontSize: 36, fontWeight: "800", lineHeight: 42, letterSpacing: -1 },
  subtitle: { color: "#a9abb4", fontSize: 14, lineHeight: 22, marginTop: 14 },
  primaryButton: { backgroundColor: "#d7ff64", borderRadius: 14, paddingVertical: 16, paddingHorizontal: 15, alignItems: "center", marginTop: 22 },
  primaryButtonText: { color: "#11130b", fontWeight: "800", fontSize: 14 },
  note: { color: "#797d88", fontSize: 10, lineHeight: 15, marginTop: 12, textAlign: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 13 },
  sectionTitle: { color: "#f5f5f5", fontSize: 20, fontWeight: "800" },
  sectionHint: { color: "#747985", fontSize: 9, letterSpacing: 1.1 },
  feature: { flexDirection: "row", alignItems: "center", backgroundColor: "#12141a", borderColor: "#252832", borderWidth: 1, borderRadius: 17, padding: 15, marginBottom: 10 },
  featureIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: "#22261b", alignItems: "center", justifyContent: "center" },
  featureIconText: { color: "#d7ff64", fontSize: 21, fontWeight: "700" },
  featureCopy: { flex: 1, marginLeft: 13 },
  featureTitle: { color: "#f5f5f5", fontSize: 14, fontWeight: "700" },
  featureDescription: { color: "#8d909a", fontSize: 11, lineHeight: 16, marginTop: 4 },
  chevron: { color: "#777c86", fontSize: 25, paddingLeft: 8 },
  footer: { color: "#666a74", fontSize: 10, textAlign: "center", marginTop: 22 },
});
