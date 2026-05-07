import { useState } from "react";
import { View, Pressable, TextInput, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Menu, Text } from "react-native-paper";
import { useAuthStore } from "../../store/useAuthStore";
import { CoachColors, CoachRadii } from "../../theme/coachTheme";

type Props = {
  searchValue?: string;
  onSearchChange?: (text: string) => void;
};

export function CoachHeader({ searchValue = "", onSearchChange }: Props) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const email = user?.email ?? "";
  const initial = email ? email[0].toUpperCase() : "U";
  const [notifVisible, setNotifVisible] = useState(false);

  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: CoachColors.componentSurface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: CoachColors.outlineVariant,
      }}
    >
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: CoachColors.onComponentSurface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontWeight: "700", fontSize: 14, color: CoachColors.primary }}>{initial}</Text>
        </View>
        <Text
          style={{
            flex: 1,
            textAlign: "center",
            fontSize: 22,
            fontWeight: "700",
            letterSpacing: -0.3,
            color: CoachColors.onComponentSurface,
          }}
        >
          CoachAI
        </Text>
        <Menu
          visible={notifVisible}
          onDismiss={() => setNotifVisible(false)}
          anchor={
            <Pressable
              onPress={() => setNotifVisible(true)}
              style={{ padding: 8, borderRadius: 20 }}
              accessibilityLabel="Bildirimler"
            >
              <MaterialCommunityIcons name="bell-outline" size={22} color={CoachColors.onComponentSurface} />
            </Pressable>
          }
          contentStyle={{ minWidth: 260, backgroundColor: CoachColors.surfaceCard }}
        >
          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "700", fontSize: 14, color: CoachColors.onSurface }}>Sistem Bildirimleri</Text>
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
      </View>
      {onSearchChange ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: CoachColors.surfaceCard,
              borderWidth: 1,
              borderColor: CoachColors.outlineVariant,
              borderRadius: CoachRadii.full,
              paddingLeft: 14,
              paddingRight: 10,
              height: 40,
            }}
          >
            <MaterialCommunityIcons name="magnify" size={20} color={CoachColors.onSurfaceVariant} />
            <TextInput
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder="Şirket veya pozisyon ara…"
              placeholderTextColor={CoachColors.secondaryText}
              style={{
                flex: 1,
                marginLeft: 8,
                paddingVertical: 0,
                fontSize: 15,
                color: CoachColors.onSurface,
              }}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
