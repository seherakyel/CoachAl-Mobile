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
  if (variant === "coach") {
    return (
      <View style={[styles.iconBox, styles.coachIcon]}>
        <MaterialCommunityIcons name="lightbulb" size={22} color={AR.white} />
      </View>
    );
  }
  if (variant === "traits") {
    return (
      <View style={[styles.iconBox, styles.traitsIcon]}>
        <MaterialCommunityIcons name="account-search-outline" size={22} color={AR.indigo600} />
      </View>
    );
  }
  if (variant === "matched") {
    return (
      <View style={[styles.iconBox, styles.matchedIcon]}>
        <MaterialCommunityIcons name="check-circle-outline" size={22} color={AR.indigo600} />
      </View>
    );
  }
  if (variant === "missing") {
    return (
      <View style={[styles.iconBox, styles.missingIcon]}>
        <MaterialCommunityIcons name="trending-up" size={22} color={AR.indigo600} />
      </View>
    );
  }
  if (variant === "risk") {
    return (
      <View style={[styles.iconBox, styles.traitsIcon]}>
        <MaterialCommunityIcons name="alert-decagram-outline" size={22} color={AR.indigo600} />
      </View>
    );
  }
  if (variant === "strength") {
    return (
      <View style={[styles.iconBox, styles.matchedIcon]}>
        <MaterialCommunityIcons name="check-circle-outline" size={22} color={AR.indigo600} />
      </View>
    );
  }
  if (variant === "weakness") {
    return (
      <View style={[styles.iconBox, styles.missingIcon]}>
        <MaterialCommunityIcons name="trending-down" size={22} color={AR.indigo600} />
      </View>
    );
  }
  if (variant === "plan") {
    return (
      <View style={[styles.iconBox, styles.traitsIcon]}>
        <MaterialCommunityIcons name="clipboard-list-outline" size={22} color={AR.indigo600} />
      </View>
    );
  }
  if (variant === "time") {
    return (
      <View style={[styles.iconBox, styles.traitsIcon]}>
        <MaterialCommunityIcons name="clock-outline" size={22} color={AR.indigo600} />
      </View>
    );
  }
  return (
    <View style={[styles.iconBox, styles.traitsIcon]}>
      <MaterialCommunityIcons name="help-circle-outline" size={22} color={AR.indigo600} />
    </View>
  );
}

export function AnalysisSectionTriggerRow({ variant, title, subtitle, onPress, disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: "rgba(79,70,229,0.12)" }}
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
        <Text style={styles.subtitle} numberOfLines={2}>
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
  coachIcon: {
    backgroundColor: AR.indigo600,
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
  traitsIcon: {
    backgroundColor: AR.indigo50,
    borderWidth: 1,
    borderColor: AR.indigo100,
  },
  matchedIcon: {
    backgroundColor: AR.indigo50,
    borderWidth: 1,
    borderColor: AR.indigo100,
  },
  missingIcon: {
    backgroundColor: AR.white,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: AR.indigo200,
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
  },
});
