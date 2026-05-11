import { Pressable, Text, View, Platform, StyleSheet } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { AR, fontTight } from "./analysisResultTokens";

export type TriggerVariant =
  | "coach"
  | "traits"
  | "matched"
  | "missing"
  | "risk"
  | "strength"
  | "weakness"
  | "plan"
  | "time";

type Props = {
  variant: TriggerVariant;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
};

function IconBox({ variant }: { variant: TriggerVariant }) {
  if (
    variant === "coach" ||
    variant === "traits" ||
    variant === "matched" ||
    variant === "strength"
  ) {
    const name =
      variant === "coach"
        ? "lightbulb"
        : variant === "traits"
          ? "account-search-outline"
          : "check-circle-outline";
    return (
      <View style={[styles.iconBox, styles.iconSolidBlue]}>
        <MaterialCommunityIcons name={name} size={22} color={AR.white} />
      </View>
    );
  }
  if (variant === "missing" || variant === "weakness") {
    const name = variant === "weakness" ? "trending-down" : "trending-up";
    return (
      <View style={[styles.iconBox, styles.iconDashedOutline]}>
        <MaterialCommunityIcons name={name} size={22} color={AR.indigo600} />
      </View>
    );
  }
  if (variant === "risk" || variant === "plan" || variant === "time") {
    const name =
      variant === "risk"
        ? "alert-decagram-outline"
        : variant === "plan"
          ? "clipboard-list-outline"
          : "clock-outline";
    return (
      <View style={[styles.iconBox, styles.iconSolidBlue]}>
        <MaterialCommunityIcons name={name} size={22} color={AR.white} />
      </View>
    );
  }
  return (
    <View style={[styles.iconBox, styles.iconSolidBlue]}>
      <MaterialCommunityIcons name="help-circle-outline" size={22} color={AR.white} />
    </View>
  );
}

export function AnalysisSectionTriggerRow({ variant, title, subtitle, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: AR.rippleBlue }}
      style={({ pressed }) => [
        styles.row,
        pressed && !disabled && styles.pressed,
        disabled && { opacity: 0.45 },
      ]}
    >
      <IconBox variant={variant} />
      <View style={styles.textCol}>
        <Text style={[styles.title, fontTight]} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={4}>
          {subtitle}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={AR.slate400} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    width: "100%",
    backgroundColor: AR.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
  pressed: {
    opacity: Platform.OS === "ios" ? 0.88 : 1,
    transform: [{ scale: Platform.OS === "android" ? 0.99 : 1 }],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  iconSolidBlue: {
    backgroundColor: AR.indigo600,
    ...Platform.select({
      ios: {
        shadowColor: AR.indigo600,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.22,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  iconDashedOutline: {
    backgroundColor: AR.white,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: AR.indigo600,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: AR.slate900,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: AR.slate500,
    letterSpacing: -0.1,
    lineHeight: 16,
    flexShrink: 1,
  },
});
