import { View, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { CoachColors } from "../../theme/coachTheme";
import { CoachTypography } from "../../theme/coachTypography";

type Props = {
  message?: string;
};

export function CoachLoadingPanel({ message = "AI soruları hazırlıyor…" }: Props) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 48, gap: 16 }}>
      <ActivityIndicator size="large" color={CoachColors.primary} />
      <Text style={[CoachTypography.bodyLg, { color: CoachColors.onSurfaceVariant }]}>{message}</Text>
    </View>
  );
}
