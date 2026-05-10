import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AR } from "./analysisResultTokens";

export type SkillCardVariant = "matched" | "missing";

export type SkillCardRow = {
  label: string;
  detail?: string;
};

const rowBg = "#e8eaf6";
const rowBorder = "#c7d2fe";
const labelTint = "#1e1b4b";
const detailTint = "#3730a3";

type RowProps = {
  variant: SkillCardVariant;
  label: string;
  detail: string;
  open: boolean;
  onToggle: () => void;
};

function SkillCardRow({ variant, label, detail, open, onToggle }: RowProps) {
  const hasDetail = detail.trim().length > 0;
  return (
    <Pressable
      onPress={onToggle}
      android_ripple={{ color: "rgba(79,70,229,0.14)" }}
      style={({ pressed }) => [styles.cardRow, pressed && styles.pressed]}
    >
      <View style={styles.cardRowMain}>
        <View style={styles.leftIconWrap}>
          {variant === "matched" ? (
            <MaterialCommunityIcons name="check-circle-outline" size={22} color={detailTint} />
          ) : (
            <MaterialCommunityIcons name="trending-up" size={22} color={detailTint} />
          )}
        </View>
        <Text style={styles.skillLabel} numberOfLines={2}>
          {label}
        </Text>
        <View style={styles.detailTrigger}>
          <Text style={styles.detailLabel}>Detay</Text>
          <MaterialCommunityIcons
            name={open ? "chevron-up" : "chevron-down"}
            size={20}
            color={detailTint}
          />
        </View>
      </View>
      {open ? (
        <Text style={styles.expandedBody}>
          {hasDetail ? detail : "Ek açıklama bulunmuyor."}
        </Text>
      ) : null}
    </Pressable>
  );
}

type Props = {
  variant: SkillCardVariant;
  rows: SkillCardRow[];
};

export function SkillCardList({ variant, rows }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (!rows.length) {
    return (
      <Text style={styles.empty}>
        {variant === "matched"
          ? "Eşleşen yetenek listesi bu kayıt için yok."
          : "Geliştirilebilir alanlar listesi bu kayıt için yok."}
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.list}>
        {rows.map((r, idx) => (
          <SkillCardRow
            key={`card-${idx}-${r.label}`}
            variant={variant}
            label={r.label}
            detail={r.detail ?? ""}
            open={openIdx === idx}
            onToggle={() => setOpenIdx(openIdx === idx ? null : idx)}
          />
        ))}
      </View>
      <Text style={styles.scrollCue}>DEVAMI İÇİN AŞAĞI KAYDIRIN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
  },
  list: {
    gap: 10,
  },
  cardRow: {
    borderRadius: 14,
    backgroundColor: rowBg,
    borderWidth: 1,
    borderColor: rowBorder,
    paddingVertical: 14,
    paddingHorizontal: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#312e81",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  pressed: {
    opacity: Platform.OS === "ios" ? 0.92 : 1,
  },
  cardRowMain: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  leftIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(199,210,254,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  skillLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: labelTint,
    letterSpacing: -0.3,
  },
  detailTrigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: detailTint,
    letterSpacing: -0.2,
  },
  expandedBody: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: rowBorder,
    fontSize: 14,
    lineHeight: 21,
    color: AR.slate700,
  },
  scrollCue: {
    marginTop: 18,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: AR.slate400,
  },
  empty: {
    fontSize: 14,
    lineHeight: 21,
    color: AR.slate500,
  },
});
