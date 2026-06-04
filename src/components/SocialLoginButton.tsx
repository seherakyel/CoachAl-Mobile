import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CoachColors, CoachRadii } from "../theme/coachTheme";

type Props = {
  onGoogle: () => void;
  onLinkedIn: () => void;
};

export function SocialLoginRow({ onGoogle, onLinkedIn }: Props) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, textAlign: "center", marginBottom: 4 }}>
        veya şununla devam et
      </Text>
      <Pressable
        onPress={onGoogle}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          paddingVertical: 14,
          borderRadius: CoachRadii.lg,
          borderWidth: 1,
          borderColor: CoachColors.outlineVariant,
          backgroundColor: CoachColors.surfaceContainerLowest,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <MaterialCommunityIcons name="google" size={22} color={CoachColors.primary} />
        <Text style={{ fontSize: 15, fontWeight: "600", color: CoachColors.onSurface }}>Google</Text>
      </Pressable>
      <Pressable
        onPress={onLinkedIn}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          paddingVertical: 14,
          borderRadius: CoachRadii.lg,
          borderWidth: 1,
          borderColor: CoachColors.outlineVariant,
          backgroundColor: CoachColors.surfaceContainerLowest,
          opacity: pressed ? 0.9 : 1,
        })}
      >
        <MaterialCommunityIcons name="linkedin" size={22} color={CoachColors.primaryContainer} />
        <Text style={{ fontSize: 15, fontWeight: "600", color: CoachColors.onSurface }}>LinkedIn</Text>
      </Pressable>
    </View>
  );
}
