import { View } from "react-native";
import { Text } from "react-native-paper";
import { CoachColors, CoachRadii } from "../../theme/coachTheme";
import { CoachTypography } from "../../theme/coachTypography";

type Props = {
  message: string;
};

export function CoachErrorBanner({ message }: Props) {
  if (!message) return null;
  return (
    <View
      style={{
        padding: 12,
        borderRadius: CoachRadii.lg,
        backgroundColor: CoachColors.errorContainer,
        borderWidth: 1,
        borderColor: "rgba(186, 26, 26, 0.2)",
        marginBottom: 12,
      }}
    >
      <Text style={[CoachTypography.bodyMd, { color: CoachColors.onErrorContainer, fontSize: 14 }]}>
        {message}
      </Text>
    </View>
  );
}
