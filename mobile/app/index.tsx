import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.eyebrow}>YKI ENGINE</Text>
        <Text style={styles.title}>YKIA AI</Text>
        <Text style={styles.subtitle}>Yaratıcılığını videoya dönüştür.</Text>
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Mobil uygulama temeli hazır</Text>
          <Text style={styles.panelText}>Bu ilk sürüm arayüz testidir. Hesap, kredi ve video üretimi henüz bağlanmadı.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#080A12" },
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 26 },
  eyebrow: { color: "#9D8CFF", fontSize: 12, fontWeight: "800", letterSpacing: 3, marginBottom: 12 },
  title: { color: "#FFFFFF", fontSize: 42, fontWeight: "900", letterSpacing: -1 },
  subtitle: { color: "#B7BDCE", fontSize: 17, marginTop: 10, marginBottom: 30 },
  panel: { borderWidth: 1, borderColor: "#292D40", backgroundColor: "#111522", borderRadius: 18, padding: 20 },
  panelTitle: { color: "#FFFFFF", fontSize: 17, fontWeight: "700", marginBottom: 8 },
  panelText: { color: "#AAB1C4", fontSize: 14, lineHeight: 21 }
});
