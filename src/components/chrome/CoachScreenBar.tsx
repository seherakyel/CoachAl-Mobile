import { View, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { CoachColors, CoachRadii } from "../../theme/coachTheme";
import { CoachTypography } from "../../theme/coachTypography";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function CoachScreenBar({ title, subtitle, onBack, right }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: CoachColors.surfaceContainerLowest,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: CoachColors.headerBorder,
      }}
    >
      <View style={styles.row}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.backBtn} accessibilityLabel="Geri">
            <MaterialCommunityIcons name="arrow-left" size={22} color={CoachColors.onSurface} />
          </Pressable>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.titleCol}>
          <Text style={[CoachTypography.labelSm, styles.title]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={[CoachTypography.caption, { color: CoachColors.onSurfaceVariant }]} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View style={styles.rightSlot}>{right ?? <View style={styles.backPlaceholder} />}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 48,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: CoachRadii.md,
    alignItems: "center",
    justifyContent: "center",
  },
  backPlaceholder: { width: 40 },
  titleCol: { flex: 1, paddingHorizontal: 4 },
  title: { color: CoachColors.onSurface, fontWeight: "600", fontSize: 16 },
  rightSlot: { minWidth: 40, alignItems: "flex-end" },
});
