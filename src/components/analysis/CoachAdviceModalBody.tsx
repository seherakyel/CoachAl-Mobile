import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Platform } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { computePotentialMatchScore } from "../../analysis/growthPotential";
import type { SkillUiItem } from "../../services/api";
import { AR, fontTight } from "./analysisResultTokens";

type Props = {
  visible: boolean;
  /** Ham skor; başlık ve çubuk için yuvarlanır (web ile uyumlu). */
  scorePercent: number;
  advice: string | null | undefined;
  missingSkillsUi?: SkillUiItem[];
  S?: unknown;
  E?: unknown;
  D?: unknown;
};

function formatPercentInt(n: number): string {
  if (!Number.isFinite(n)) return "0";
  return String(Math.round(Math.min(100, Math.max(0, n))));
}

function breakdownPct(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (n >= 0 && n <= 1) return Math.round(n * 100);
  if (n >= 0 && n <= 100) return Math.round(n);
  return null;
}

export function CoachAdviceModalBody({
  visible,
  scorePercent,
  advice,
  missingSkillsUi,
  S,
  E,
  D,
}: Props) {
  const raw = Number(scorePercent);
  const rounded = Math.round(Math.min(100, Math.max(0, Number.isFinite(raw) ? raw : 0)));
  const { potential } = computePotentialMatchScore(rounded, missingSkillsUi ?? []);
  const showTarget = potential > rounded;
  const anim = useRef(new Animated.Value(0)).current;

  const sPct = breakdownPct(S);
  const ePct = breakdownPct(E);
  const dPct = breakdownPct(D);
  const showSed = sPct != null || ePct != null || dPct != null;

  useEffect(() => {
    if (!visible) {
      anim.setValue(0);
      return;
    }
    anim.setValue(0);
    const t = Animated.timing(anim, {
      toValue: rounded,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    t.start();
    return () => t.stop();
  }, [visible, rounded, anim]);

  const widthInterpolated = anim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View>
      <View style={styles.coachHeaderRow}>
        <View style={styles.lightbulbBox}>
          <MaterialCommunityIcons name="lightbulb" size={22} color={AR.white} />
        </View>
        <View style={styles.headerTextCol}>
          <Text style={styles.kicker}>Maç analizi</Text>
          <Text style={[styles.coachTitle, fontTight]}>CoachAI tavsiyesi</Text>
        </View>
      </View>

      <View style={styles.scoreWidget}>
        <Text style={styles.matchKicker}>Eşleşme</Text>
        <Text style={[styles.scoreBig, fontTight]}>%{formatPercentInt(rounded)}</Text>
        {showTarget ? <Text style={styles.scoreTarget}>Hedef: %{formatPercentInt(potential)}</Text> : null}
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: widthInterpolated }]} />
        </View>
      </View>

      {showSed ? (
        <View style={styles.sedBlock}>
          <Text style={styles.sedTitle}>Bileşen skorları</Text>
          {sPct != null ? (
            <View style={styles.sedRow}>
              <Text style={styles.sedLabel}>Yetenek</Text>
              <Text style={styles.sedValue}>%{sPct}</Text>
            </View>
          ) : null}
          {ePct != null ? (
            <View style={styles.sedRow}>
              <Text style={styles.sedLabel}>Deneyim</Text>
              <Text style={styles.sedValue}>%{ePct}</Text>
            </View>
          ) : null}
          {dPct != null ? (
            <View style={styles.sedRow}>
              <Text style={styles.sedLabel}>Eğitim</Text>
              <Text style={styles.sedValue}>%{dPct}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {advice?.trim() ? (
        <Text style={[styles.bodyText, styles.bodySpaced]}>{advice.trim()}</Text>
      ) : (
        <Text style={[styles.muted, styles.bodySpaced]}>
          Bu kayıt için analiz metni yok veya henüz yüklenmedi.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerTextCol: {
    flex: 1,
  },
  coachHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bodySpaced: {
    marginTop: 16,
  },
  lightbulbBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: AR.indigo600,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: AR.indigo600,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  kicker: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: AR.slate400,
  },
  coachTitle: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "600",
    color: AR.slate900,
  },
  scoreWidget: {
    marginTop: 18,
    width: "100%",
    borderWidth: 1,
    borderColor: AR.slate200,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    padding: 18,
  },
  matchKicker: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: AR.slate500,
  },
  scoreBig: {
    marginTop: 6,
    fontSize: 36,
    fontWeight: "700",
    color: AR.slate900,
  },
  scoreTarget: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "500",
    color: AR.slate500,
    letterSpacing: -0.1,
  },
  progressTrack: {
    marginTop: 14,
    height: 8,
    borderRadius: 999,
    backgroundColor: AR.scoreTrack,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: AR.indigo600,
  },
  sedBlock: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: AR.slate200,
    gap: 10,
  },
  sedTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: AR.slate400,
    marginBottom: 2,
  },
  sedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sedLabel: {
    fontSize: 15,
    color: AR.slate700,
    fontWeight: "500",
  },
  sedValue: {
    fontSize: 15,
    fontWeight: "700",
    color: AR.slate900,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: AR.slate700,
    letterSpacing: -0.2,
  },
  muted: {
    fontSize: 14,
    color: AR.slate500,
    lineHeight: 20,
  },
});
