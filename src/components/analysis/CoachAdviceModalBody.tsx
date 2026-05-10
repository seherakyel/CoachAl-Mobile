import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing, Platform } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AR, fontTight } from "./analysisResultTokens";

type Props = {
  visible: boolean;
  scoreNum: number;
  targetPct: number;
  advice: string | null | undefined;
};

export function CoachAdviceModalBody({ visible, scoreNum, targetPct, advice }: Props) {
  const pct = Math.min(100, Math.max(0, scoreNum));
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      anim.setValue(0);
      return;
    }
    anim.setValue(0);
    const t = Animated.timing(anim, {
      toValue: pct,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    t.start();
    return () => t.stop();
  }, [visible, pct, anim]);

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
        <Text style={[styles.scoreBig, fontTight]}>%{scoreNum}</Text>
        <Text style={styles.scoreTarget}>Hedef: %{targetPct}</Text>
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: widthInterpolated }]} />
        </View>
      </View>

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
  scoreBig: {
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
