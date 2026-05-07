import { useEffect, useMemo, useState } from "react";
import { View, ScrollView } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Appbar, Button, Card, List, Snackbar, Text } from "react-native-paper";
import { listAlignments, scoreAlignment } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { RadialScore } from "../components/RadialScore";
import { RiskBadge } from "../components/RiskBadge";
import { mapRiskLevel } from "../utils/riskColors";
import { usePipelineStore } from "../store/usePipelineStore";
import type { AnalyzeParamList } from "../app/navigationTypes";

type Nav = NativeStackNavigationProp<AnalyzeParamList>;
type R = RouteProp<AnalyzeParamList, "AlignmentResult">;

export function AlignmentResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const qc = useQueryClient();
  const cvId = usePipelineStore((s) => s.cvId);
  const profileId = usePipelineStore((s) => s.profileId);
  const companyName = usePipelineStore((s) => s.companyName);
  const positionTitle = usePipelineStore((s) => s.positionTitle);
  const alignment = usePipelineStore((s) => s.alignment);
  const alignmentId = usePipelineStore((s) => s.alignmentId);
  const setAlignment = usePipelineStore((s) => s.setAlignment);
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

  const mutation = useMutation({
    mutationFn: scoreAlignment,
    onSuccess: (res) => {
      setAlignment(res.result_id, res);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["alignment-list"] });
    },
    onError: (e) => setSnack(extractDetail(e)),
  });

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

  useEffect(() => {
    if (resultId) return;
    if (!cvId || !profileId) return;
    if (alignment) return;
    mutation.mutate({ cv_id: cvId, profile_id: profileId });
  }, [alignment, cvId, mutation, profileId, resultId]);

  const payload = alignment;
  const score = payload?.score_percent ?? listItem?.score ?? 0;
  const risk = payload?.risk_level ?? listItem?.risk_level ?? "";
  const titleCompany = payload?.company_name ?? listItem?.company_name ?? companyName ?? "";
  const titlePos = payload?.position ?? listItem?.target_position ?? positionTitle ?? "";
  const effectiveAlignmentId = alignmentId ?? resultId ?? "";
  const riskUi = mapRiskLevel(risk);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Eşleşme sonucu" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 96 }}>
        {!payload && resultId && listQuery.isLoading ? (
          <Text>Yükleniyor…</Text>
        ) : (
          <Card mode="outlined">
            <Card.Content style={{ alignItems: "center" }}>
              <Text variant="titleLarge" style={{ fontWeight: "800", textAlign: "center" }}>
                {titleCompany}
              </Text>
              <Text variant="bodyLarge" style={{ opacity: 0.8, textAlign: "center", marginTop: 4 }}>
                {titlePos}
              </Text>
              <View style={{ marginTop: 14 }}>
                <RadialScore percent={Number(score) || 0} color={riskUi.accent} />
              </View>
              <View style={{ marginTop: 12 }}>
                <RiskBadge level={risk} />
              </View>
            </Card.Content>
          </Card>
        )}

        {payload?.advice ? (
          <Card mode="outlined" style={{ marginTop: 12 }}>
            <Card.Content>
              <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                Koçluk özeti
              </Text>
              <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                {payload.advice}
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        {payload?.next_steps && payload.next_steps.length > 0 ? (
          <Card mode="outlined" style={{ marginTop: 12 }}>
            <Card.Content>
              <Text variant="titleSmall" style={{ fontWeight: "700", marginBottom: 8 }}>
                Sonraki adımlar
              </Text>
              {payload.next_steps.map((s, idx) => (
                <Text key={`${idx}-${s}`} variant="bodyMedium" style={{ marginBottom: 6 }}>
                  • {s}
                </Text>
              ))}
            </Card.Content>
          </Card>
        ) : null}

        {payload?.matched_skills_ui && payload.matched_skills_ui.length > 0 ? (
          <List.Section>
            <List.Subheader>Eşleşen beceriler</List.Subheader>
            {payload.matched_skills_ui.map((it, idx) => (
              <List.Accordion title={(it.label as string) ?? (it.skill as string) ?? "Öğe"} key={`m-${idx}`}>
                <List.Item title={String(it.detail ?? "")} titleNumberOfLines={6} />
              </List.Accordion>
            ))}
          </List.Section>
        ) : null}

        {payload?.missing_skills_ui && payload.missing_skills_ui.length > 0 ? (
          <List.Section>
            <List.Subheader>Eksikler</List.Subheader>
            {payload.missing_skills_ui.map((it, idx) => (
              <List.Accordion title={(it.label as string) ?? (it.skill as string) ?? "Öğe"} key={`x-${idx}`}>
                <List.Item title={String(it.detail ?? "")} titleNumberOfLines={6} />
              </List.Accordion>
            ))}
          </List.Section>
        ) : null}

        {resultId && !payload ? (
          <Card mode="outlined" style={{ marginTop: 12 }}>
            <Card.Content>
              <Text variant="bodyMedium">
                Bu bağlantı için tam içerik bulunamadı. Liste özetinden skoru görüntülüyorsunuz. Tam beceri listesi için analizi yeniden çalıştırın.
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        <View style={{ height: 12 }} />
        <Button
          mode="contained"
          icon="microphone-message"
          onPress={() => {
            navigation.getParent()?.navigate("Mulakat", { screen: "InterviewHub" });
          }}
        >
          Mülakat merkezine git
        </Button>
        <View style={{ height: 10 }} />
        <Button
          mode="contained-tonal"
          icon="file-chart"
          disabled={!effectiveAlignmentId}
          onPress={() =>
            navigation.navigate("FeedbackReport", {
              sessionId: null,
              alignmentId: effectiveAlignmentId,
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
