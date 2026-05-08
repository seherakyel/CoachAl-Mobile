import { useEffect, useMemo, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Appbar, Button, List, Snackbar, Text } from "react-native-paper";
import { listAlignments } from "../services/api";
import { RadialScore } from "../components/RadialScore";
import { RiskBadge } from "../components/RiskBadge";
import { usePipelineStore } from "../store/usePipelineStore";
import type { AnalyzeParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<AnalyzeParamList>;
type R = RouteProp<AnalyzeParamList, "AlignmentResult">;


export function AlignmentResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const companyName = usePipelineStore((s) => s.companyName);
  const positionTitle = usePipelineStore((s) => s.positionTitle);
  const alignment = usePipelineStore((s) => s.alignment);
  const alignmentId = usePipelineStore((s) => s.alignmentId);
  const [snack, setSnack] = useState<string | null>(null);

  const resultId = route.params?.resultId;

  const listQuery = useQuery({
    queryKey: ["alignment-list"],
    queryFn: () => listAlignments(50),
    enabled: !!resultId && alignment?.result_id !== resultId,
  });

  const listItem = useMemo(() => {
    if (!resultId) return null;
    return (listQuery.data?.items ?? []).find((x) => x.id === resultId) ?? null;
  }, [listQuery.data, resultId]);

  useEffect(() => {
    if (!resultId || !listItem) return;
    usePipelineStore.getState().hydrateFromApplication({
      cvId: listItem.cv_id,
      profileId: listItem.profile_id,
      alignmentId: resultId,
      companyName: listItem.company_name,
      positionTitle: listItem.target_position,
    });
  }, [resultId, listItem]);

  const payload = alignment;
  const score = payload?.score_percent ?? listItem?.score ?? 0;
  const risk = payload?.risk_level ?? listItem?.risk_level ?? "";
  const titleCompany = payload?.company_name ?? listItem?.company_name ?? companyName ?? "";
  const titlePos = payload?.position ?? listItem?.target_position ?? positionTitle ?? "";
  const effectiveAlignmentId = alignmentId ?? resultId ?? "";

  const isLoading = !payload && resultId && listQuery.isLoading;

  const cardBase = {
    backgroundColor: CoachColors.surfaceContainerLowest,
    borderRadius: CoachRadii.xl,
    borderWidth: 1,
    borderColor: CoachColors.outlineVariant,
    ...CoachShadow.card,
  } as const;

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
        <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Hizalama sonucu" titleStyle={{ fontWeight: "700", color: CoachColors.onComponentSurface }} />
        </Appbar.Header>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
          <ActivityIndicator size="large" color={CoachColors.secondary} />
          <Text style={{ fontSize: 15, color: CoachColors.onSurfaceVariant, textAlign: "center", marginTop: 16 }}>
            Sonuçlar yükleniyor…
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Hizalama sonucu" titleStyle={{ fontWeight: "700", color: CoachColors.onComponentSurface }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: CoachColors.primary, textAlign: "center", marginBottom: 6 }}>
          Eşleşme özeti
        </Text>
        <Text style={{ fontSize: 15, color: CoachColors.onSurfaceVariant, textAlign: "center", marginBottom: 20 }}>
          Analiz tamamlandı. Rol ile uyumunuz aşağıda.
        </Text>

        <View style={{ ...cardBase, padding: 20, alignItems: "center", position: "relative" }}>
          <View style={{ position: "absolute", top: 14, right: 14, zIndex: 2 }}>
            <RiskBadge level={risk} />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "700", color: CoachColors.primary, textAlign: "center", marginTop: 8 }}>
            {titleCompany}
          </Text>
          <Text style={{ fontSize: 15, color: CoachColors.onSurfaceVariant, textAlign: "center", marginTop: 4 }}>
            {titlePos}
          </Text>
          <View style={{ marginTop: 16, marginBottom: 8 }}>
            <RadialScore percent={Number(score) || 0} color={CoachColors.successGreen} />
          </View>
          <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, textAlign: "center", maxWidth: 280 }}>
            Match skoru; risk seviyesi rozetinde özetlenir.
          </Text>
        </View>

        {payload?.advice ? (
          <View style={{ ...cardBase, padding: 18, marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: CoachColors.primary }}>Koçluk özeti</Text>
            <Text style={{ fontSize: 15, lineHeight: 22, color: CoachColors.onSurface, marginTop: 10 }}>{payload.advice}</Text>
          </View>
        ) : null}

        {payload?.next_steps && payload.next_steps.length > 0 ? (
          <View style={{ ...cardBase, padding: 18, marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: CoachColors.primary, marginBottom: 10 }}>Sonraki adımlar</Text>
            {payload.next_steps.map((s, idx) => (
              <Text key={`${idx}-${s}`} style={{ fontSize: 15, lineHeight: 22, color: CoachColors.onSurface, marginBottom: 6 }}>
                • {s}
              </Text>
            ))}
          </View>
        ) : null}

        {payload?.matched_skills_ui && payload.matched_skills_ui.length > 0 ? (
          <View style={{ ...cardBase, padding: 18, marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: CoachColors.primary, marginBottom: 12 }}>Eşleşen yetenekler</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {payload.matched_skills_ui.map((it, idx) => {
                const label = (it.label as string) ?? (it.skill as string) ?? "Öğe";
                return (
                  <View
                    key={`chip-${idx}`}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: CoachRadii.full,
                      backgroundColor: CoachColors.insightChipBg,
                      borderWidth: 1,
                      borderColor: CoachColors.outlineVariant,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "600", color: CoachColors.secondary }}>{label}</Text>
                  </View>
                );
              })}
            </View>
            <List.Section style={{ marginTop: 8, marginBottom: -8 }}>
              {payload.matched_skills_ui.map((it, idx) => (
                <List.Accordion title={(it.label as string) ?? (it.skill as string) ?? "Öğe"} key={`m-${idx}`}>
                  <List.Item title={String(it.detail ?? "")} titleNumberOfLines={8} />
                </List.Accordion>
              ))}
            </List.Section>
          </View>
        ) : null}

        {payload?.missing_skills_ui && payload.missing_skills_ui.length > 0 ? (
          <View style={{ ...cardBase, padding: 18, marginTop: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: CoachColors.primary, marginBottom: 12 }}>Geliştirilmesi gerekenler</Text>
            {payload.missing_skills_ui.map((it, idx) => (
              <View
                key={`x-${idx}`}
                style={{
                  flexDirection: "row",
                  gap: 12,
                  padding: 14,
                  borderRadius: CoachRadii.lg,
                  backgroundColor: CoachColors.surfaceContainerLow,
                  borderWidth: 1,
                  borderColor: CoachColors.outlineVariant,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: CoachColors.surfaceContainerHigh,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontWeight: "700", color: CoachColors.onSurfaceVariant }}>!</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: CoachColors.primary }}>
                    {(it.label as string) ?? (it.skill as string) ?? "Öğe"}
                  </Text>
                  <Text style={{ fontSize: 14, lineHeight: 20, color: CoachColors.onSurfaceVariant, marginTop: 4 }}>
                    {String(it.detail ?? "")}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {resultId && !payload ? (
          <View style={{ ...cardBase, padding: 18, marginTop: 16 }}>
            <Text style={{ fontSize: 15, lineHeight: 22, color: CoachColors.onSurface }}>
              Bu bağlantı için tam içerik bulunamadı. Liste özetinden skoru görüntülüyorsunuz. Tam beceri listesi için analizi yeniden çalıştırın.
            </Text>
          </View>
        ) : null}

        <View style={{ height: 16 }} />
        <Button
          mode="contained"
          icon="microphone-message"
          buttonColor={CoachColors.primary}
          textColor={CoachColors.onPrimary}
          style={{ borderRadius: CoachRadii.xl }}
          contentStyle={{ paddingVertical: 6 }}
          onPress={() => {
            navigation.getParent()?.navigate("Interviews", { screen: "InterviewHub" });
          }}
        >
          Mülakata hazırlan
        </Button>
        <View style={{ height: 10 }} />
        <Button
          mode="outlined"
          icon="file-chart"
          disabled={!effectiveAlignmentId}
          textColor={CoachColors.secondary}
          style={{ borderRadius: CoachRadii.xl, borderColor: CoachColors.outlineVariant }}
          onPress={() =>
            navigation.getParent()?.navigate("Reports", {
              screen: "FeedbackReport",
              params: { alignmentId: effectiveAlignmentId, sessionId: null },
            })
          }
        >
          AI raporu üret
        </Button>
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={6000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
