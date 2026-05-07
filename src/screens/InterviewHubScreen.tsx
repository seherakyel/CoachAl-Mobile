import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text, Snackbar } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { listInterviews } from "../services/api";
import { usePipelineStore } from "../store/usePipelineStore";
import type { InterviewParamList, MainTabParamList } from "../app/navigationTypes";
import { CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";

type Nav = CompositeNavigationProp<
  NativeStackNavigationProp<InterviewParamList, "InterviewHub">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function InterviewHubScreen() {
  const navigation = useNavigation<Nav>();
  const cvId = usePipelineStore((s) => s.cvId);
  const profileId = usePipelineStore((s) => s.profileId);
  const companyName = usePipelineStore((s) => s.companyName);
  const positionTitle = usePipelineStore((s) => s.positionTitle);
  const cvDisplayName = usePipelineStore((s) => s.cvDisplayName);
  const resetFlow = usePipelineStore((s) => s.resetFlow);
  const [snack, setSnack] = useState<string | null>(null);

  const history = useQuery({
    queryKey: ["interview-list"],
    queryFn: () => listInterviews(20),
  });

  const requireContext = () => {
    if (!cvId || !profileId) {
      setSnack("Önce panelden bir başvuru seçin veya analiz akışını tamamlayın.");
      return false;
    }
    return true;
  };

  const showSessionBanner = !!(cvId && companyName);

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120, maxWidth: 1024, width: "100%", alignSelf: "center" }}>
        <Text style={{ fontSize: 36, fontWeight: "700", color: CoachColors.onSurface, marginBottom: 8 }}>
          Mülakat Modu Seçimi
        </Text>
        <Text style={{ fontSize: 18, lineHeight: 28, color: CoachColors.onSurfaceVariant, marginBottom: showSessionBanner ? 24 : 40 }}>
          Pratik yapmak istediğiniz mülakat formatını seçin.
        </Text>

        {showSessionBanner ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 16,
              backgroundColor: CoachColors.primaryFixed,
              borderRadius: CoachRadii.xl,
              borderWidth: 1,
              borderColor: CoachColors.primaryFixedDim,
              marginBottom: 32,
            }}
          >
            <MaterialCommunityIcons name="information-outline" size={22} color={CoachColors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.onSurface }}>
                {(cvDisplayName || "CV") + " → " + companyName + " için hazır"}
              </Text>
              <Pressable
                onPress={() => {
                  resetFlow();
                  navigation.navigate("CvAnalysis", { screen: "CvAnalysisHome" });
                }}
                style={{ marginTop: 6 }}
              >
                <Text style={{ fontSize: 12, color: CoachColors.primary, textDecorationLine: "underline" }}>
                  Farklı CV/şirket seç →
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={{ gap: 24 }}>
          <View
            style={{
              backgroundColor: CoachColors.surfaceContainerLowest,
              borderWidth: 1,
              borderColor: CoachColors.outlineVariant,
              borderRadius: CoachRadii.xl,
              padding: 24,
              ...CoachShadow.card,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: -32,
                right: -32,
                width: 128,
                height: 128,
                borderBottomLeftRadius: 128,
                backgroundColor: "rgba(79,70,229,0.05)",
              }}
            />
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: CoachRadii.md,
                backgroundColor: CoachColors.surfaceContainer,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <MaterialCommunityIcons name="code-tags" size={32} color={CoachColors.primary} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface, marginBottom: 12 }}>Klasik Sınav</Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: CoachColors.onSurfaceVariant, marginBottom: 32, flexGrow: 1 }}>
              Açık uçlu, algoritma ve sistem tasarımı ağırlıklı klasik teknik mülakat formatı.
            </Text>
            <Pressable
              onPress={() => {
                if (!requireContext()) return;
                navigation.navigate("ClassicInterview");
              }}
              style={{
                backgroundColor: CoachColors.primaryContainer,
                paddingVertical: 14,
                borderRadius: CoachRadii.md,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onPrimary }}>Başla</Text>
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: CoachColors.surfaceContainerLowest,
              borderWidth: 1,
              borderColor: CoachColors.outlineVariant,
              borderRadius: CoachRadii.xl,
              padding: 24,
              ...CoachShadow.card,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                position: "absolute",
                top: -32,
                right: -32,
                width: 128,
                height: 128,
                borderBottomLeftRadius: 128,
                backgroundColor: "rgba(213,224,248,0.5)",
              }}
            />
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: CoachRadii.md,
                backgroundColor: CoachColors.surfaceContainer,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <MaterialCommunityIcons name="timer-outline" size={32} color={CoachColors.primary} />
            </View>
            <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface, marginBottom: 12 }}>Teknik Quiz</Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: CoachColors.onSurfaceVariant, marginBottom: 32 }}>
              60 saniyelik çoktan seçmeli hızlı test. Temel konseptleri ve bilgi düzeyini ölçer.
            </Text>
            <Pressable
              onPress={() => {
                if (!requireContext()) return;
                navigation.navigate("QuizInterview");
              }}
              style={{
                backgroundColor: CoachColors.surfaceContainerLowest,
                borderWidth: 1,
                borderColor: CoachColors.outlineVariant,
                paddingVertical: 14,
                borderRadius: CoachRadii.md,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onSurface }}>Başla</Text>
            </Pressable>
          </View>

          <View
            style={{
              backgroundColor: "rgba(252,248,255,0.5)",
              borderWidth: 1,
              borderColor: "rgba(199,196,216,0.5)",
              borderRadius: CoachRadii.xl,
              padding: 24,
              opacity: 0.65,
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
          (history.data?.items ?? []).map((it) => (
            <View
              key={it.session_id}
              style={{
                borderWidth: 1,
                borderColor: CoachColors.outlineVariant,
                borderRadius: CoachRadii.md,
                padding: 16,
                marginBottom: 10,
                backgroundColor: CoachColors.surfaceContainerLowest,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 15, color: CoachColors.onSurface }}>{it.type}</Text>
              <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, marginTop: 6 }}>
                Skor: {it.score === null || it.score === undefined ? "—" : String(it.score)}
              </Text>
              <Text style={{ fontSize: 12, color: CoachColors.outline, marginTop: 4 }} numberOfLines={1}>
                {it.session_id}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
