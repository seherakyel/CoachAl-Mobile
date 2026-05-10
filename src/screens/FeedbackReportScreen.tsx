import { useEffect, useRef, useState } from "react";
import { View, ScrollView, ActivityIndicator, Text, StyleSheet, Platform } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Appbar, Button, Snackbar } from "react-native-paper";
import { generateFeedback } from "../services/api";
import type { FeedbackResponse } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { usePipelineStore } from "../store/usePipelineStore";
import type { ReportsParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors } from "../theme/coachTheme";
import { AR } from "../components/analysis/analysisResultTokens";
import { AnalysisCompanySummaryCard } from "../components/analysis/AnalysisCompanySummaryCard";
import { AnalysisSectionTriggerRow } from "../components/analysis/AnalysisSectionTriggerRow";
import { AnalysisBottomModal } from "../components/analysis/AnalysisBottomModal";
import { SkillCardList } from "../components/analysis/SkillCardList";

type Nav = NativeStackNavigationProp<ReportsParamList>;
type R = RouteProp<ReportsParamList, "FeedbackReport">;

type FeedbackModalKind = "eliminated" | "strengths" | "weaknesses" | "resources" | null;

function previewLine(text: string, max = 64): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "Detay için dokunun";
  return t.length <= max ? t : `${t.slice(0, max - 1)}…`;
}

function formatScore(score?: number | null): string {
  if (score == null || Number.isNaN(Number(score))) return "—";
  const n = Number(score);
  if (Number.isInteger(n)) return String(n);
  return String(n);
}

function FeedbackModalBody({ kind, data }: { kind: FeedbackModalKind; data: FeedbackResponse }) {
  if (kind === "eliminated") {
    const body = (data.why_can_be_eliminated ?? "").trim();
    return body ? (
      <Text style={styles.modalParagraph}>{body}</Text>
    ) : (
      <Text style={styles.modalMuted}>Bu bölüm için metin dönmedi.</Text>
    );
  }
  if (kind === "strengths") {
    const list = data.strengths ?? [];
    const rows = list.map((s) => ({ label: s, detail: "" }));
    return <SkillCardList variant="matched" rows={rows} />;
  }
  if (kind === "weaknesses") {
    const list = data.weaknesses ?? [];
    const rows = list.map((s) => ({ label: s, detail: "" }));
    return <SkillCardList variant="missing" rows={rows} />;
  }
  if (kind === "resources") {
    const list = data.recommended_resources ?? [];
    if (list.length === 0) {
      return <Text style={styles.modalMuted}>Önerilen kaynak bulunmuyor.</Text>;
    }
    return (
      <View style={styles.bulletBlock}>
        {list.map((s, idx) => (
          <Text key={`rs-${idx}`} style={styles.modalBullet}>
            • {s}
          </Text>
        ))}
      </View>
    );
  }
  return null;
}

export function FeedbackReportScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const insets = useSafeAreaInsets();
  const storeAlignmentId = usePipelineStore((s) => s.alignmentId);
  const alignmentId = route.params?.alignmentId ?? storeAlignmentId ?? "";
  const sessionId = route.params?.sessionId ?? null;
  const [snack, setSnack] = useState<string | null>(null);
  const firedRef = useRef(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<FeedbackModalKind>(null);

  useEffect(() => {
    if (modalOpen || !modalKind) return;
    if (Platform.OS === "ios") return;
    const t = setTimeout(() => setModalKind(null), 400);
    return () => clearTimeout(t);
  }, [modalOpen, modalKind]);

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

  const openModal = (kind: NonNullable<FeedbackModalKind>) => {
    setModalKind(kind);
    setModalOpen(true);
  };

  const modalTitle =
    modalKind === "eliminated"
      ? "Neden elenebilirsin?"
      : modalKind === "strengths"
        ? "Eşleşen yetenekler"
        : modalKind === "weaknesses"
          ? "Eksik / geliştirilebilir"
          : modalKind === "resources"
            ? "Önerilen kaynaklar"
            : "";

  if (mutation.isPending) {
    return (
      <View style={styles.flexFill}>
        <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Şirket Eşleşme Analizi" titleStyle={{ color: CoachColors.onComponentSurface }} />
        </Appbar.Header>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={CoachColors.secondary} />
          <Text style={styles.loadingTitle}>Rapor hazırlanıyor…</Text>
          <Text style={styles.loadingSub}>Yapay zeka kişisel geri bildiriminizi oluşturuyor.</Text>
        </View>
      </View>
    );
  }

  if (!data && mutation.isError) {
    return (
      <View style={styles.flexFill}>
        <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Şirket eşleşme analizi" titleStyle={{ color: CoachColors.onComponentSurface }} />
        </Appbar.Header>
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Rapor oluşturulamadı</Text>
          <Button
            mode="contained"
            onPress={() => {
              firedRef.current = false;
              mutation.mutate();
            }}
          >
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

  const strengths = data.strengths ?? [];
  const weaknesses = data.weaknesses ?? [];
  const resources = data.recommended_resources ?? [];
  const why = (data.why_can_be_eliminated ?? "").trim();

  const summarySecondary = [
    `Skor: %${formatScore(data.score)} · Risk: ${data.risk_level ?? "—"}`,
    "",
    "Aşağıdaki satırlara dokunarak rapor bölümlerini tam ekran okuyabilirsiniz.",
  ].join("\n");

  return (
    <View style={styles.flexFill}>
      <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Şirket eşleşme analizi" titleStyle={{ color: CoachColors.onComponentSurface }} />
      </Appbar.Header>

      <ScrollView
        style={styles.scrollBg}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageIntro}>
          <Text style={styles.pageTitle}>AI geri bildirim raporu</Text>
          <Text style={styles.pageSubtitle}>Özet üstte; uzun metinler modallarda kaydırılarak okunur.</Text>
        </View>

        <AnalysisCompanySummaryCard
          companyName={data.company_name}
          positionTitle={data.position}
          cultureBody={summarySecondary}
          secondarySectionTitle="Skor ve risk"
        />

        <AnalysisSectionTriggerRow
          variant="risk"
          title="Neden elenebilirsin?"
          subtitle={previewLine(why)}
          onPress={() => openModal("eliminated")}
        />
        <AnalysisSectionTriggerRow
          variant="strength"
          title="Eşleşen yetenekler"
          subtitle={strengths.length ? `${strengths.length} madde · ${previewLine(strengths[0] ?? "", 48)}` : "Liste boş olabilir"}
          onPress={() => openModal("strengths")}
        />
        <AnalysisSectionTriggerRow
          variant="weakness"
          title="Eksik / geliştirilebilir"
          subtitle={
            weaknesses.length ? `${weaknesses.length} madde · ${previewLine(weaknesses[0] ?? "", 48)}` : "Liste boş olabilir"
          }
          onPress={() => openModal("weaknesses")}
        />
        <AnalysisSectionTriggerRow
          variant="resources"
          title="Önerilen kaynaklar"
          subtitle={resources.length ? `${resources.length} kaynak` : "Kaynak önerisi yok"}
          onPress={() => openModal("resources")}
        />
      </ScrollView>

      <AnalysisBottomModal
        visible={modalOpen}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
        onDismiss={() => setModalKind(null)}
      >
        {modalKind ? <FeedbackModalBody kind={modalKind} data={data} /> : null}
      </AnalysisBottomModal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={7000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  flexFill: {
    flex: 1,
    backgroundColor: AR.bg,
  },
  scrollBg: {
    flex: 1,
    backgroundColor: AR.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  pageIntro: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: Platform.OS === "ios" ? 19 : 18,
    fontWeight: "600",
    color: AR.slate900,
    letterSpacing: -0.35,
  },
  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: AR.slate500,
    letterSpacing: -0.2,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: AR.bg,
  },
  loadingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: AR.slate900,
    textAlign: "center",
    marginTop: 20,
  },
  loadingSub: {
    fontSize: 13,
    color: AR.slate500,
    textAlign: "center",
    marginTop: 12,
  },
  errorTitle: {
    fontSize: 16,
    color: AR.slate900,
    textAlign: "center",
    marginBottom: 16,
  },
  modalParagraph: {
    fontSize: 15,
    lineHeight: 24,
    color: AR.slate700,
    letterSpacing: -0.2,
  },
  modalMuted: {
    fontSize: 14,
    lineHeight: 21,
    color: AR.slate500,
  },
  bulletBlock: {
    gap: 10,
  },
  modalBullet: {
    fontSize: 15,
    lineHeight: 22,
    color: AR.slate700,
    letterSpacing: -0.15,
  },
});
