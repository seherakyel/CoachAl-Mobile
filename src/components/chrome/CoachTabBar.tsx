import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CoachColors, CoachRadii, CoachShadow } from "../../theme/coachTheme";
import type { MainTabParamList } from "../../app/navigationTypes";

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Home: "view-dashboard-outline",
  CvAnalysis: "file-document-outline",
  Interviews: "head-lightbulb-outline",
  Reports: "chart-box-outline",
  Settings: "account-outline",
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Home: "Panel",
  CvAnalysis: "CV Analizi",
  Interviews: "Mülakatlar",
  Reports: "Raporlar",
  Settings: "Profil",
};

export function CoachTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: CoachColors.tabBarBackground,
          borderTopColor: CoachColors.outlineVariant,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const name = route.name as keyof MainTabParamList;
        const iconName = TAB_ICONS[name] ?? "circle-outline";
        const label = (options.tabBarLabel as string) ?? TAB_LABELS[name] ?? name;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const fg = focused ? CoachColors.tabActiveForeground : CoachColors.tabInactiveForeground;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            onPress={onPress}
            style={({ pressed }) => [
              styles.tab,
              focused && { backgroundColor: CoachColors.tabActivePill },
              pressed && { opacity: 0.88 },
            ]}
          >
            <MaterialCommunityIcons name={iconName as "home"} size={22} color={fg} />
            <Text numberOfLines={1} style={[styles.label, { color: fg }]}>
              {label}
            </Text>
            <View style={[styles.dot, { backgroundColor: CoachColors.tabActiveForeground }, !focused && { opacity: 0 }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 4,
    ...CoachShadow.card,
    shadowOffset: { width: 0, height: -2 },
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: CoachRadii.lg,
    maxWidth: 88,
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.4,
    marginTop: 4,
    textTransform: "uppercase",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
