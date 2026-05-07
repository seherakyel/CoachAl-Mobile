import { useState } from "react";
import { View, ScrollView } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Appbar, Button, Card, List, Snackbar, Text } from "react-native-paper";
import { generateFeedback } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { usePipelineStore } from "../store/usePipelineStore";
import type { ReportsParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<ReportsParamList>;
type R = RouteProp<ReportsParamList, "FeedbackReport">;

export function FeedbackReportScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const storeAlignmentId = usePipelineStore((s) => s.alignmentId);
  const alignmentId = route.params?.alignmentId ?? storeAlignmentId ?? "";
  const sessionId = route.params?.sessionId ?? null;
  const [snack, setSnack] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      generateFeedback({
        alignment_id: alignmentId,
        session_id: sessionId ?? undefined,
      }),
    onError: (e) => setSnack(extractDetail(e)),
  });

  const data = mutation.data;

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="CV Doktoru" titleStyle={{ color: CoachColors.onComponentSurface }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 96 }}>
        <Card mode="outlined">
          <Card.Content>
            <Text variant="bodyMedium" style={{ opacity: 0.75 }}>
              Hizalama ve isteğe bağlı mülakat özetine göre kişiselleştirilmiş geri bildirim üretir.
            </Text>
            <Button
              mode="contained"
              style={{ marginTop: 12 }}
              loading={mutation.isPending}
              disabled={!alignmentId}
              onPress={() => mutation.mutate()}
            >
              Raporu oluştur
            </Button>
          </Card.Content>
        </Card>

        {data ? (
          <View style={{ marginTop: 12, gap: 12 }}>
            <Card mode="outlined">
              <Card.Content>
                <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                  Özet
                </Text>
                <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                  {data.company_name} · {data.position}
                </Text>
                <Text variant="bodySmall" style={{ marginTop: 6, opacity: 0.7 }}>
                  Rapor: {data.report_id}
                </Text>
              </Card.Content>
            </Card>

            <Card mode="outlined">
              <Card.Content>
                <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                  Neden elenebilirsin?
                </Text>
                <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                  {data.why_can_be_eliminated ?? ""}
                </Text>
              </Card.Content>
            </Card>

            <List.Section>
              <List.Subheader>Güçlü yönler</List.Subheader>
              {(data.strengths ?? []).map((s, idx) => (
                <List.Item key={`st-${idx}`} title={s} />
              ))}
            </List.Section>

            <List.Section>
              <List.Subheader>Zayıf yönler</List.Subheader>
              {(data.weaknesses ?? []).map((s, idx) => (
                <List.Item key={`wk-${idx}`} title={s} />
              ))}
            </List.Section>

            <Card mode="outlined">
              <Card.Content>
                <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                  Aksiyon planı
                </Text>
                <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                  {data.action_plan ?? ""}
                </Text>
              </Card.Content>
            </Card>

            <List.Section>
              <List.Subheader>Önerilen kaynaklar</List.Subheader>
              {(data.recommended_resources ?? []).map((s, idx) => (
                <List.Item key={`rs-${idx}`} title={s} />
              ))}
            </List.Section>

            <Card mode="outlined">
              <Card.Content>
                <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                  Tahmini hazırlık süresi
                </Text>
                <Text variant="bodyMedium" style={{ marginTop: 8 }}>
                  {data.estimated_prep_time ?? ""}
                </Text>
              </Card.Content>
            </Card>
          </View>
        ) : null}
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={7000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
