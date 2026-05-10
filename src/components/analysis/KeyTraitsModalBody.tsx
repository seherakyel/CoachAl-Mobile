import { View, Text, StyleSheet, Platform } from "react-native";
import { AR } from "./analysisResultTokens";

type Props = {
  chips: string[];
};

export function KeyTraitsModalBody({ chips }: Props) {
  const list = chips.map((s) => s.trim()).filter(Boolean);

  if (list.length === 0) {
    return (
      <Text style={styles.empty}>
        Aranan profil için özet çip listesi bu kayıtta yok. Tam analiz veya yeni bir akış sonrası tekrar deneyin.
      </Text>
    );
  }

  return (
    <View style={styles.chipWrap}>
      {list.map((c, i) => (
        <View key={`trait-${i}`} style={styles.chip}>
          <Text style={styles.chipText}>{c}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: AR.slate200,
    backgroundColor: AR.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  chipText: {
    fontSize: 13,
    color: AR.slate700,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  empty: {
    fontSize: 14,
    lineHeight: 21,
    color: AR.slate500,
  },
});
