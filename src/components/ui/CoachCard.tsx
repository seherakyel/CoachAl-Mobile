import { View, type ViewStyle } from "react-native";
import { CoachColors, CoachRadii, CoachShadow } from "../../theme/coachTheme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
};

export function CoachCard({ children, style, padded = true }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: CoachColors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: CoachColors.outlineVariant,
          borderRadius: CoachRadii.xl,
          padding: padded ? 20 : 0,
          ...CoachShadow.card,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
