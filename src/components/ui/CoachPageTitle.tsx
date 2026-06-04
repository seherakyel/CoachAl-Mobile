import { View } from "react-native";
import { Text } from "react-native-paper";
import { CoachColors } from "../../theme/coachTheme";
import { CoachTypography } from "../../theme/coachTypography";

type Props = {
  title: string;
  subtitle?: string;
};

export function CoachPageTitle({ title, subtitle }: Props) {
  return (
    <View style={{ marginBottom: subtitle ? 24 : 16 }}>
      <Text style={[CoachTypography.h1, { color: CoachColors.onSurface }]}>{title}</Text>
      {subtitle ? (
        <Text style={[CoachTypography.bodyLg, { color: CoachColors.onSurfaceVariant, marginTop: 8 }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
