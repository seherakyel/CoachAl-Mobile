import { Pressable, ActivityIndicator, type ViewStyle } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Text } from "react-native-paper";
import { CoachColors, CoachRadii } from "../../theme/coachTheme";
import { CoachTypography } from "../../theme/coachTypography";

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: ViewStyle;
  variant?: "filled" | "outline";
};

export function CoachPrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  icon,
  style,
  variant = "filled",
}: Props) {
  const filled = variant === "filled";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderRadius: CoachRadii.lg,
          backgroundColor: filled ? CoachColors.primaryContainer : CoachColors.surfaceContainerLowest,
          borderWidth: filled ? 0 : 1,
          borderColor: CoachColors.outlineVariant,
          opacity: disabled || loading ? 0.55 : pressed ? 0.92 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={filled ? CoachColors.onPrimary : CoachColors.primary} />
      ) : (
        <>
          {icon ? (
            <MaterialCommunityIcons
              name={icon}
              size={20}
              color={filled ? CoachColors.onPrimary : CoachColors.onSurface}
            />
          ) : null}
          <Text
            style={[
              CoachTypography.labelSm,
              {
                color: filled ? CoachColors.onPrimary : CoachColors.onSurface,
                fontWeight: "600",
              },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
