import { useState } from "react";
import { View, Pressable, TextInput, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Menu, Text } from "react-native-paper";
import { useAuthStore } from "../../store/useAuthStore";
import { CoachColors, CoachRadii } from "../../theme/coachTheme";
import { CoachTypography } from "../../theme/coachTypography";

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
        backgroundColor: CoachColors.surfaceContainerLowest,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: CoachColors.headerBorder,
      }}
    >
      <View style={styles.row}>
        <View style={styles.logoBox}>
          <Text style={styles.logoLetter}>C</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[CoachTypography.labelSm, { fontWeight: "700", color: CoachColors.onSurface }]}>
            CoachAI
          </Text>
          <Text style={[CoachTypography.caption, { color: CoachColors.onSurfaceVariant }]}>AI Mülakat Koçu</Text>
        </View>
        <Menu
          visible={notifVisible}
          onDismiss={() => setNotifVisible(false)}
          anchor={
            <Pressable onPress={() => setNotifVisible(true)} style={styles.iconBtn} accessibilityLabel="Bildirimler">
              <MaterialCommunityIcons name="bell-outline" size={22} color={CoachColors.onSurfaceVariant} />
            </Pressable>
          }
          contentStyle={{ minWidth: 260, backgroundColor: CoachColors.surfaceContainerLowest }}
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
              <MaterialCommunityIcons name="bell-off-outline" size={36} color={CoachColors.outlineVariant} />
              <Text style={{ fontSize: 12, color: CoachColors.onSurfaceVariant }}>Yeni bildirim yok</Text>
            </View>
          </View>
        </Menu>
        <View style={styles.avatar}>
          <Text style={{ fontWeight: "700", fontSize: 14, color: CoachColors.primary }}>{initial}</Text>
        </View>
      </View>
      {onSearchChange ? (
        <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
          <View style={styles.searchWrap}>
            <MaterialCommunityIcons name="magnify" size={20} color={CoachColors.onSurfaceVariant} />
            <TextInput
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder="Şirket veya pozisyon ara…"
              placeholderTextColor={CoachColors.onSurfaceVariant}
              style={styles.searchInput}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: CoachRadii.md,
    backgroundColor: CoachColors.primaryContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontWeight: "700",
    fontSize: 14,
    color: CoachColors.onPrimary,
  },
  iconBtn: { padding: 8, borderRadius: 20 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: CoachColors.primaryFixed,
    borderWidth: 2,
    borderColor: CoachColors.primaryFixedDim,
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CoachColors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: CoachColors.outlineVariant,
    borderRadius: CoachRadii.full,
    paddingLeft: 14,
    paddingRight: 10,
    height: 40,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 0,
    fontSize: 15,
    color: CoachColors.onSurface,
  },
});
