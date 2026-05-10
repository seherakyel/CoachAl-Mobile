import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import type { SkillUiItem } from "../../services/api";
import { AR } from "./analysisResultTokens";

type Variant = "matched" | "missing";

type Props = {
  variant: Variant;
  items: SkillUiItem[];
};

function SkillRow({
  item,
  open,
  onToggle,
}: {
  item: SkillUiItem;
  open: boolean;
  onToggle: () => void;
}) {
  const label = (item.label as string) ?? (item.skill as string) ?? "Öğe";
  const detail = String(item.detail ?? "").trim();
  return (
    <Pressable
      onPress={onToggle}
      android_ripple={{ color: "rgba(79,70,229,0.12)" }}
      style={({ pressed }) => [styles.skillRow, pressed && styles.pressed]}
    >
      <View style={styles.skillRowInner}>
        <Text style={styles.skillRowLabel}>{label}</Text>
        {detail ? (
          <MaterialCommunityIcons
            name={open ? "chevron-up" : "chevron-down"}
            size={20}
            color={AR.indigo600}
          />
        ) : null}
      </View>
      {open && detail ? <Text style={styles.skillRowDetail}>{detail}</Text> : null}
    </Pressable>
  );
}

export function SkillsListModalBody({ variant, items }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!items || items.length === 0) {
    return (
      <Text style={styles.empty}>
        {variant === "matched"
          ? "Eşleşen yetenek listesi bu kayıt için yok."
          : "Geliştirilebilir alanlar listesi bu kayıt için yok."}
      </Text>
    );
  }

  return (
    <View>
      <View style={styles.sectionHeadRow}>
        {variant === "matched" ? (
          <View style={styles.iconCircleIndigo}>
            <MaterialCommunityIcons name="check-circle-outline" size={22} color={AR.indigo600} />
          </View>
        ) : (
          <View style={styles.iconCircleDashed}>
            <MaterialCommunityIcons name="trending-up" size={22} color={AR.indigo600} />
          </View>
        )}
        <View style={styles.sectionTextCol}>
          <Text style={styles.sectionTitle}>
            {variant === "matched" ? "Eşleşen yetenekler" : "Eksik / geliştirilebilir"}
          </Text>
          <Text style={styles.sectionHint}>Satıra dokunun; CoachAI yorumunu açın.</Text>
        </View>
      </View>
      <View style={styles.listBox}>
        {items.map((it, idx) => (
          <SkillRow
            key={`sk-${variant}-${idx}`}
            item={it}
            open={openIdx === idx}
            onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTextCol: {
    flex: 1,
  },
  sectionHeadRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 12,
  },
  iconCircleIndigo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AR.indigo50,
    borderWidth: 1,
    borderColor: AR.indigo100,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleDashed: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AR.white,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: AR.indigo200,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: AR.slate900,
    letterSpacing: -0.35,
  },
  sectionHint: {
    marginTop: 4,
    fontSize: 12,
    color: AR.slate500,
    letterSpacing: -0.1,
  },
  listBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AR.slate200,
  },
  skillRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AR.slate200,
  },
  pressed: {
    opacity: Platform.OS === "ios" ? 0.88 : 1,
  },
  skillRowInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  skillRowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: AR.slate900,
    letterSpacing: -0.2,
  },
  skillRowDetail: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: AR.slate500,
  },
  empty: {
    fontSize: 14,
    lineHeight: 21,
    color: AR.slate500,
  },
});
