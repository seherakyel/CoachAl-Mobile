import { View, Text, StyleSheet, Platform } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { AR, cardSurface, fontTight } from "./analysisResultTokens";

type Props = {
  companyName: string;
  positionTitle: string;
  cultureBody: string;
  /** Web `company-industry`; boşsa "Technology". */
  industry?: string | null;
  /** Pozisyon satırı: web'de "Hedef rol · …", raporda düz metin. */
  positionLabelMode?: "hedefRol" | "plain";
  /** Alt bölüm başlığı (varsayılan: kültür özeti). AI raporu gibi ekranlarda “Skor ve risk” vb. */
  secondarySectionTitle?: string;
};

function isTrendyol(name: string) {
  return name.trim().toLowerCase() === "trendyol";
}

function TrendyolLogoSlot() {
  return (
    <View style={styles.trendyolOuter} accessibilityLabel="Trendyol logosu">
      <View style={styles.trendyolOrange} />
      <View style={styles.trendyolBlack}>
        <Text style={styles.trendyolWordmark}>trendyol</Text>
      </View>
    </View>
  );
}

function FallbackLogoLetter({ letter }: { letter: string }) {
  return (
    <View style={styles.logoBox}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={AR.indigo500} />
            <Stop offset="1" stopColor={AR.indigo600} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" rx={16} fill="url(#logoGrad)" />
      </Svg>
      <Text style={styles.logoLetter}>{letter}</Text>
    </View>
  );
}

export function AnalysisCompanySummaryCard({
  companyName,
  positionTitle,
  cultureBody,
  industry,
  positionLabelMode = "hedefRol",
  secondarySectionTitle = "Kültür özeti",
}: Props) {
  const letter = (companyName.trim()[0] ?? "?").toUpperCase();
  const showTrendyol = isTrendyol(companyName);
  const industryLine = (industry && industry.trim()) || "Technology";
  const pos = positionTitle.trim();
  const positionLine =
    positionLabelMode === "plain"
      ? pos || "Pozisyon bilgisi"
      : pos
        ? `Hedef rol · ${pos}`
        : "Pozisyon bilgisi";

  return (
    <View style={cardSurface.wrap}>
      <Text style={styles.kicker}>Şirket özeti</Text>
      <View style={styles.companyRow}>
        {showTrendyol ? <TrendyolLogoSlot /> : <FallbackLogoLetter letter={letter} />}
        <View
          style={styles.companyTextCol}
          accessibilityLabel={`${companyName || "Şirket"}, ${positionTitle || "pozisyon"}`}
        >
          <Text style={[styles.h3, fontTight]}>{companyName || "—"}</Text>
          <Text style={styles.industryLine}>{industryLine}</Text>
          <Text style={styles.sectorLine}>{positionLine}</Text>
        </View>
      </View>
      <Text style={[styles.kicker, styles.kickerSpaced]}>{secondarySectionTitle}</Text>
      <Text style={styles.bodyText}>{cultureBody}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: AR.slate400,
  },
  kickerSpaced: {
    marginTop: 22,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    gap: 14,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: AR.indigo600,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
    }),
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: "700",
    color: AR.white,
    letterSpacing: -0.5,
  },
  trendyolOuter: {
    width: 72,
    height: 72,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: AR.slate200,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  trendyolOrange: {
    flex: 0.38,
    backgroundColor: AR.trendyolOrange,
  },
  trendyolBlack: {
    flex: 1,
    backgroundColor: AR.trendyolBlack,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  trendyolWordmark: {
    color: AR.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: -0.3,
    textTransform: "lowercase",
  },
  companyTextCol: {
    flex: 1,
    minWidth: 0,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600",
    color: AR.slate900,
  },
  industryLine: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    color: AR.slate500,
  },
  sectorLine: {
    marginTop: 8,
    fontSize: 14,
    color: AR.slate500,
    letterSpacing: -0.15,
  },
  bodyText: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 24,
    color: AR.slate700,
    letterSpacing: -0.2,
  },
});
