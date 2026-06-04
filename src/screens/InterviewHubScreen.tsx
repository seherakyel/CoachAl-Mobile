import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, Snackbar } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { listCompletedInterviews } from "../services/api";
import { formatSessionDate, scoreTextColor, sessionModeIcon } from "../utils/sessionLabels";
import type { InterviewParamList, MainTabParamList } from "../app/navigationTypes";
import { CoachPageTitle } from "../components/ui/CoachPageTitle";
import { CoachPrimaryButton } from "../components/ui/CoachPrimaryButton";
import { CoachCard } from "../components/ui/CoachCard";
import { CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";
import { CoachTypography } from "../theme/coachTypography";

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<InterviewParamList, "InterviewHub">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function InterviewHubScreen() {
  const navigation = useNavigation<Nav>();
  const [snack, setSnack] = useState<string | null>(null);

  const history = useQuery({
    queryKey: ["interview-completed", 10],
    queryFn: () => listCompletedInterviews(10),
  });

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120, maxWidth: 1024, width: "100%", alignSelf: "center" }}>
        <CoachPageTitle
          title="Mülakat Modu Seçimi"
          subtitle="Pratik yapmak istediğiniz mülakat formatını seçin."
        />

        <View style={{ gap: 24 }}>
          <CoachCard style={{ overflow: "hidden" }}>
            <View
              style={{
                position: "absolute",
                top: -32,
                right: -32,
                width: 128,
                height: 128,
                borderBottomLeftRadius: 128,
                backgroundColor: "rgba(53, 37, 205, 0.06)",
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: CoachRadii.full,
                  backgroundColor: CoachColors.insightChipBg,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "700", color: CoachColors.primary, letterSpacing: 0.4 }}>
                  YAPAY ZEKA DESTEKLİ
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: CoachRadii.md,
                backgroundColor: CoachColors.surfaceContainer,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <MaterialCommunityIcons name="code-tags" size={28} color={CoachColors.primary} />
            </View>
            <Text style={[CoachTypography.h3, { color: CoachColors.onSurface, marginBottom: 8 }]}>Klasik Sınav</Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: CoachColors.onSurfaceVariant, marginBottom: 16, flexGrow: 1 }}>
              Yazılım mühendisliği temelleri, sistem tasarımı ve problem çözme odaklı kapsamlı oturum.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={CoachColors.onSurfaceVariant} />
                <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant }}>~45 dk</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialCommunityIcons name="signal" size={18} color={CoachColors.onSurfaceVariant} />
                <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant }}>Orta / zor</Text>
              </View>
            </View>
            <CoachPrimaryButton
              label="Başla"
              onPress={() => navigation.navigate("InterviewAlignmentSetup", { mode: "classic" })}
            />
          </CoachCard>

          <CoachCard style={{ overflow: "hidden" }}>
            <View
              style={{
                position: "absolute",
                top: -32,
                right: -32,
                width: 128,
                height: 128,
                borderBottomLeftRadius: 128,
                backgroundColor: "rgba(218, 226, 253, 0.45)",
              }}
            />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: CoachRadii.full,
                  backgroundColor: CoachColors.surfaceContainerLow,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: "700", color: CoachColors.onSurfaceVariant, letterSpacing: 0.4 }}>
                  ZAMAN SINIRLI
                </Text>
              </View>
            </View>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: CoachRadii.md,
                backgroundColor: CoachColors.surfaceContainer,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <MaterialCommunityIcons name="timer-outline" size={28} color={CoachColors.primary} />
            </View>
            <Text style={[CoachTypography.h3, { color: CoachColors.onSurface, marginBottom: 8 }]}>Teknik Quiz</Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: CoachColors.onSurfaceVariant, marginBottom: 16 }}>
              Çoktan seçmeli hızlı soru seti; temel kavramları ölçer.
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={CoachColors.onSurfaceVariant} />
                <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant }}>~20 dk</Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <MaterialCommunityIcons name="signal" size={18} color={CoachColors.onSurfaceVariant} />
                <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant }}>Kolay / orta</Text>
              </View>
            </View>
            <CoachPrimaryButton
              label="Başla"
              variant="outline"
              onPress={() => navigation.navigate("InterviewAlignmentSetup", { mode: "quiz" })}
            />
          </CoachCard>

          <View
            style={{
              backgroundColor: "rgba(247, 249, 251, 0.55)",
              borderWidth: 1,
              borderColor: "rgba(198, 198, 205, 0.4)",
              borderRadius: CoachRadii.xl,
              padding: 24,
              opacity: 0.72,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                backgroundColor: CoachColors.surfaceVariant,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: CoachRadii.full,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: "700", color: CoachColors.onSurfaceVariant, letterSpacing: 1 }}>
                YAKINDA
              </Text>
            </View>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: CoachRadii.md,
                backgroundColor: CoachColors.surfaceContainerLow,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <MaterialCommunityIcons name="microphone-outline" size={32} color={CoachColors.outline} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface, marginBottom: 12, opacity: 0.6 }}>
              Sesli Mülakat
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: CoachColors.onSurfaceVariant, marginBottom: 32, opacity: 0.6 }}>
              Yapay zeka ile gerçek zamanlı, sesli etkileşimli mülakat simülasyonu.
            </Text>
            <View
              style={{
                backgroundColor: CoachColors.surfaceContainerHighest,
                paddingVertical: 14,
                borderRadius: CoachRadii.md,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.outline }}>Kilitli</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.onSurface, marginTop: 36, marginBottom: 12 }}>
          Son oturumlar
        </Text>
        {(history.data?.items ?? []).length === 0 ? (
          <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant }}>Kayıt yok</Text>
        ) : (
          (history.data?.items ?? []).map((it) => {
            const sc = it.total_score ?? it.score;
            return (
              <View
                key={it.session_id || it.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderWidth: 1,
                  borderColor: CoachColors.outlineVariant,
                  borderRadius: CoachRadii.lg,
                  padding: 16,
                  marginBottom: 10,
                  backgroundColor: CoachColors.surfaceContainerLowest,
                  ...CoachShadow.card,
                }}
              >
                <View style={{ flexDirection: "row", flex: 1, minWidth: 0, paddingRight: 12, gap: 10 }}>
                  <MaterialCommunityIcons
                    name={sessionModeIcon(it.mode)}
                    size={22}
                    color={CoachColors.primary}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontWeight: "700", fontSize: 15, color: CoachColors.primary }}>
                      {it.mode_label || it.mode}
                    </Text>
                    <Text style={{ fontSize: 12, color: CoachColors.outline, marginTop: 4 }} numberOfLines={2}>
                      {it.list_label || `${it.cv_name} → ${it.company_name}`}
                    </Text>
                    <Text style={{ fontSize: 11, color: CoachColors.onSurfaceVariant, marginTop: 2 }}>
                      {formatSessionDate(it.completed_at || it.started_at)}
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, fontWeight: "700", color: scoreTextColor(sc ?? null) }}>
                  {sc == null ? "—" : `%${Math.round(Number(sc))}`}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
