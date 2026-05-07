import { useState } from "react";
import { View, Pressable, TextInput } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Menu, Text } from "react-native-paper";
import { useAuthStore } from "../../store/useAuthStore";
import { CoachColors, CoachRadii } from "../../theme/coachTheme";

type Props = {
  searchValue?: string;
  onSearchChange?: (text: string) => void;
};

export function CoachHeader({ searchValue = "", onSearchChange }: Props) {
  const user = useAuthStore((s) => s.user);
  const email = user?.email ?? "";
  const initial = email ? email[0].toUpperCase() : "U";
  const [notifVisible, setNotifVisible] = useState(false);

  return (
    <View
      style={{
        backgroundColor: "rgba(255,255,255,0.92)",
        borderBottomWidth: 1,
        borderBottomColor: CoachColors.slate100,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 }}>
        {onSearchChange ? (
          <View
            style={{
              flex: 1,
              maxWidth: 260,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: CoachColors.surfaceContainerLow,
              borderWidth: 1,
              borderColor: CoachColors.slate200,
              borderRadius: CoachRadii.full,
              paddingLeft: 12,
              paddingRight: 8,
              height: 36,
            }}
          >
            <MaterialCommunityIcons name="magnify" size={20} color={CoachColors.slate500} />
            <TextInput
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder="Ara..."
              placeholderTextColor={CoachColors.slate500}
              style={{
                flex: 1,
                marginLeft: 6,
                paddingVertical: 0,
                fontSize: 14,
                color: CoachColors.onSurface,
              }}
            />
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Menu
          visible={notifVisible}
          onDismiss={() => setNotifVisible(false)}
          anchor={
            <Pressable
              onPress={() => setNotifVisible(true)}
              style={{ padding: 8, borderRadius: 20 }}
              accessibilityLabel="Bildirimler"
            >
              <MaterialCommunityIcons name="bell-outline" size={22} color={CoachColors.slate500} />
            </Pressable>
          }
          contentStyle={{ minWidth: 260 }}
        >
          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "700", fontSize: 14, color: CoachColors.onSurface }}>
                Sistem Bildirimleri
              </Text>
              <View
                style={{
                  backgroundColor: CoachColors.surfaceContainer,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: CoachRadii.full,
                }}
              >
                <Text style={{ fontSize: 11, color: CoachColors.onSurfaceVariant }}>0 yeni</Text>
              </View>
            </View>
            <View style={{ alignItems: "center", paddingVertical: 20, gap: 8 }}>
              <MaterialCommunityIcons name="bell-off-outline" size={36} color={CoachColors.slate300} />
              <Text style={{ fontSize: 12, color: CoachColors.onSurfaceVariant }}>Yeni bildirim yok</Text>
            </View>
          </View>
        </Menu>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: CoachColors.primaryFixed,
            borderWidth: 2,
            borderColor: CoachColors.primaryFixedDim,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 14, color: CoachColors.primary }}>{initial}</Text>
        </View>
      </View>
    </View>
  );
}
