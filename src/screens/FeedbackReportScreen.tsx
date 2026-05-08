import { useEffect, useRef, useState } from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Appbar, Button, Card, Snackbar, Text } from "react-native-paper";
import { generateFeedback } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { usePipelineStore } from "../store/usePipelineStore";
import type { ReportsParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors, CoachRadii } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<ReportsParamList>;
type R = RouteProp<ReportsParamList, "FeedbackReport">;

export function FeedbackReportScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const storeAlignmentId = usePipelineStore((s) => s.alignmentId);
  const alignmentId = route.params?.alignmentId ?? storeAlignmentId ?? "";
  const sessionId = route.params?.sessionId ?? null;
  const [snack, setSnack] = useState<string | null>(null);
  const firedRef = useRef(false);

  const mutation = useMutation({
    mutationFn: () =>
      generateFeedback({
        alignment_id: alignmentId,
        session_id: sessionId ?? undefined,
      }),
    onError: (e) => setSnack(extractDetail(e)),
  });

  useEffect(() => {
    if (!alignmentId) return;
    if (firedRef.current) return;
    firedRef.current = true;
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alignmentId]);

  const data = mutation.data;

  if (mutation.isPending) {
    return (
      <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
        <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="CV Doktoru" titleStyle={{ color: CoachColors.onComponentSurface }} />
        </Appbar.Header>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
          <ActivityIndicator size="large" color={CoachColors.secondary} />
          <Text style={{ fontSize: 16, fontWeight: "500", color: CoachColors.onSurface, textAlign: "center", marginTop: 20 }}>
            Rapor hazırlanıyor…
          </Text>
          <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, textAlign: "center", marginTop: 12 }}>
            Yapay zeka kişisel geri bildiriminizi oluşturuyor.
          </Text>
        </View>
      </View>
    );
  }

  if (!data && mutation.isError) {
    return (
      <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
        <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="CV Doktoru" titleStyle={{ color: CoachColors.onComponentSurface }} />
        </Appbar.Header>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
          <Text style={{ fontSize: 16, color: CoachColors.onSurface, textAlign: "center", marginBottom: 16 }}>
            Rapor oluşturulamadı
          </Text>
          <Button mode="contained" onPress={() => { firedRef.current = false; mutation.mutate(); }}>
            Tekrar dene
          </Button>
        </View>
        <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={7000}>
          {snack ?? ""}
        </Snackbar>
      </View>
    );
  }

  if (!data) return null;

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="CV Doktoru" titleStyle={{ color: CoachColors.onComponentSurface }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 96, gap: 14 }}>
        <Card mode="outlined" style={{ borderRadius: CoachRadii.xl }}>
          <Card.Content>
            <Text variant="titleMedium" style={{ fontWeight: "700", color: CoachColors.primary }}>
              {data.company_name} · {data.position}
            </Text>
            <Text variant="bodySmall" style={{ marginTop: 6, opacity: 0.6 }}>
              Skor: %{data.score ?? 0} · Risk: {data.risk_level ?? "—"}
            </Text>
          </Card.Content>
        </Card>

        <Card mode="outlined" style={{ borderRadius: CoachRadii.xl }}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: "700", color: CoachColors.primary }}>
              Neden elenebilirsin?
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, lineHeight: 22 }}>
              {data.why_can_be_eliminated ?? ""}
            </Text>
          </Card.Content>
        </Card>

        <Card mode="outlined" style={{ borderRadius: CoachRadii.xl }}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: "700", color: CoachColors.primary, marginBottom: 8 }}>
              Güçlü yönler
            </Text>
            {(data.strengths ?? []).map((s, idx) => (
              <Text key={`st-${idx}`} variant="bodyMedium" style={{ marginBottom: 4 }}>• {s}</Text>
            ))}
          </Card.Content>
        </Card>

        <Card mode="outlined" style={{ borderRadius: CoachRadii.xl }}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: "700", color: CoachColors.primary, marginBottom: 8 }}>
              Zayıf yönler
            </Text>
            {(data.weaknesses ?? []).map((s, idx) => (
              <Text key={`wk-${idx}`} variant="bodyMedium" style={{ marginBottom: 4 }}>• {s}</Text>
            ))}
          </Card.Content>
        </Card>

        <Card mode="outlined" style={{ borderRadius: CoachRadii.xl }}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: "700", color: CoachColors.primary }}>
              Aksiyon planı
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8, lineHeight: 22 }}>
              {data.action_plan ?? ""}
            </Text>
          </Card.Content>
        </Card>

        {(data.recommended_resources ?? []).length > 0 ? (
          <Card mode="outlined" style={{ borderRadius: CoachRadii.xl }}>
            <Card.Content>
              <Text variant="titleSmall" style={{ fontWeight: "700", color: CoachColors.primary, marginBottom: 8 }}>
                Önerilen kaynaklar
              </Text>
              {data.recommended_resources.map((s, idx) => (
                <Text key={`rs-${idx}`} variant="bodyMedium" style={{ marginBottom: 4 }}>• {s}</Text>
              ))}
            </Card.Content>
          </Card>
        ) : null}

        <Card mode="outlined" style={{ borderRadius: CoachRadii.xl }}>
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: "700", color: CoachColors.primary }}>
              Tahmini hazırlık süresi
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8 }}>
              {data.estimated_prep_time ?? "—"}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}
