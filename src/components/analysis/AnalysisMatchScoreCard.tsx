import { View, Text, StyleSheet, Platform } from "react-native";
import { AR, fontTight } from "./analysisResultTokens";

type Props = {
  /** Ham yüzde (ör. 41.72); çubuk genişliği için kullanılır. */
  scorePercent: number;
  /** Üst hedef satırı; skordan büyükse gösterilir. */
  potentialPercent?: number | null;
  riskLabel?: string | null;
};

export function AnalysisMatchScoreCard({ scorePercent, potentialPercent, riskLabel }: Props) {
  const raw = Number(scorePercent);
  const bounded = Math.min(100, Math.max(0, Number.isFinite(raw) ? raw : 0));
  const displayInt = Math.round(bounded);
  const pot =
    potentialPercent != null && Number.isFinite(Number(potentialPercent))
      ? Math.round(Number(potentialPercent))
      : null;
  const showTarget = pot != null && pot > displayInt;

  return (
    <View style={styles.wrap} accessibilityLabel="Eşleşme skoru özeti">
      <View style={styles.topRow}>
        <View style={styles.scoreCluster}>
          <Text style={[styles.scoreBig, fontTight]}>{displayInt}</Text>
          <Text style={styles.pctSign}>%</Text>
        </View>
        <View style={styles.labelsCol}>
          <Text style={styles.matchLabel}>EŞLEŞME</Text>
          {showTarget ? <Text style={styles.hedef}>Hedef: %{pot}</Text> : null}
        </View>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${bounded}%` }]} />
      </View>
      {riskLabel?.trim() ? (
        <Text style={styles.riskLine}>Risk: {riskLabel.trim()}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 18,
    width: "100%",
    backgroundColor: AR.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.95)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  scoreCluster: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  scoreBig: {
    fontSize: 40,
    fontWeight: "700",
    color: AR.slate900,
    lineHeight: 44,
  },
  pctSign: {
    fontSize: 18,
    fontWeight: "600",
    color: AR.slate700,
    marginLeft: 2,
    paddingBottom: 4,
    lineHeight: 22,
  },
  labelsCol: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
    flexShrink: 1,
  },
  matchLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    color: AR.slate900,
  },
  hedef: {
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "500",
    color: AR.slate500,
  },
  track: {
    marginTop: 14,
    height: 6,
    borderRadius: 999,
    backgroundColor: AR.scoreTrack,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: AR.indigo600,
  },
  riskLine: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: AR.indigo600,
    letterSpacing: 0.2,
  },
});
