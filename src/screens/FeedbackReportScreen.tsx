import { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, ActivityIndicator, Text, StyleSheet, Platform } from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Appbar, Button, Snackbar } from "react-native-paper";
import { generateFeedback, getAlignmentById } from "../services/api";
import type { AlignmentDetailResponse, FeedbackResponse } from "../services/api";
import { computePotentialMatchScore } from "../analysis/growthPotential";
import { extendKeyTraits } from "../analysis/analysisKeyTraits";
import { extractDetail } from "../services/apiClient";
import { usePipelineStore } from "../store/usePipelineStore";
import type { ReportsParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors } from "../theme/coachTheme";
import { AR } from "../components/analysis/analysisResultTokens";
import { AnalysisCompanySummaryCard } from "../components/analysis/AnalysisCompanySummaryCard";
import { AnalysisSectionTriggerRow } from "../components/analysis/AnalysisSectionTriggerRow";
import { AnalysisCenterModal } from "../components/analysis/AnalysisCenterModal";
import { CoachAdviceModalBody } from "../components/analysis/CoachAdviceModalBody";
import { KeyTraitsModalBody } from "../components/analysis/KeyTraitsModalBody";
import { SkillCardList } from "../components/analysis/SkillCardList";
import { SkillsListModalBody } from "../components/analysis/SkillsListModalBody";

type Nav = NativeStackNavigationProp<ReportsParamList>;
type R = RouteProp<ReportsParamList, "FeedbackReport">;

type FeedbackModalKind = "coach" | "traits" | "strengths" | "weaknesses" | "resources" | null;

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

function FeedbackModalBody({
  kind,
  data,
  alignment,
  traitChips,
  modalOpen,
}: {
  kind: FeedbackModalKind;
  data: FeedbackResponse;
  alignment?: AlignmentDetailResponse | null;
  traitChips: string[];
  modalOpen: boolean;
}) {
  const scoreRaw = Number(alignment?.score_percent ?? data.score ?? 0) || 0;
  const adviceText =
    (alignment?.advice?.trim() || data.why_can_be_eliminated?.trim() || "").trim() || null;

  if (kind === "coach") {
    return (
      <CoachAdviceModalBody
        visible={modalOpen}
        scorePercent={scoreRaw}
        advice={adviceText}
        missingSkillsUi={alignment?.missing_skills_ui}
        S={alignment?.S}
        E={alignment?.E}
        D={alignment?.D}
      />
    );
  }
  if (kind === "traits") {
    return <KeyTraitsModalBody chips={traitChips} />;
  }
  if (kind === "strengths") {
    const ui = alignment?.matched_skills_ui;
    if (ui && ui.length > 0) {
      return <SkillsListModalBody variant="matched" items={ui} />;
    }
    const list = data.strengths ?? [];
    const rows = list.map((s) => ({ label: s, detail: "" }));
    return <SkillCardList variant="matched" rows={rows} />;
  }
  if (kind === "weaknesses") {
    const ui = alignment?.missing_skills_ui;
    if (ui && ui.length > 0) {
      return <SkillsListModalBody variant="missing" items={ui} />;
    }
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
  const storeIndustry = usePipelineStore((s) => s.industry);
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

  const alignQuery = useQuery({
    queryKey: ["alignment-detail", alignmentId],
    queryFn: () => getAlignmentById(alignmentId),
    enabled: !!alignmentId,
  });

  useEffect(() => {
    if (!alignmentId) return;
    if (firedRef.current) return;
    firedRef.current = true;
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alignmentId]);

  const data = mutation.data;

  const traitChips = useMemo(() => {
    if (!alignQuery.isSuccess || !alignQuery.data) return [];
    return extendKeyTraits(alignQuery.data.key_traits ?? []);
  }, [alignQuery.isSuccess, alignQuery.data]);

  const openModal = (kind: NonNullable<FeedbackModalKind>) => {
    setModalKind(kind);
    setModalOpen(true);
  };

  const modalTitle =
    modalKind === "coach"
      ? "CoachAI tavsiyesi"
      : modalKind === "traits"
        ? "Aranan profil"
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
  const alignment = alignQuery.data;

  const coachScore = Math.round(Number(alignment?.score_percent ?? data.score ?? 0)) || 0;
  const coachPotential = computePotentialMatchScore(coachScore, alignment?.missing_skills_ui ?? []).potential;
  const coachSubtitle =
    coachPotential > coachScore ? `%${coachScore} · Hedef %${coachPotential}` : `%${coachScore} · Eşleşme`;

  const summarySecondary = [
    `Skor: %${formatScore(data.score)} · Risk: ${data.risk_level ?? "—"}`,
    "",
    "Aşağıdaki satırlara dokunarak rapor bölümlerini okuyabilirsiniz.",
  ].join("\n");

  const culturePrimary = alignment?.culture_summary?.trim();
  const companyName = alignment?.company_name?.trim() || data.company_name;
  const positionTitle = alignment?.position?.trim() || data.position;
  const cultureBody = culturePrimary
    ? `${culturePrimary}\n\nSkor: %${formatScore(data.score)} · Risk: ${data.risk_level ?? "—"}`
    : summarySecondary;
  const cultureSectionTitle = culturePrimary ? "Kültür özeti" : "Skor ve risk";

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
          <Text style={styles.pageSubtitle}>Özet üstte; detaylar ortada açılan pencerede kaydırılarak okunur.</Text>
        </View>

        <AnalysisCompanySummaryCard
          companyName={companyName}
          positionTitle={positionTitle}
          positionLabelMode="plain"
          industry={storeIndustry ?? "Technology"}
          cultureBody={cultureBody}
          secondarySectionTitle={cultureSectionTitle}
        />

        <AnalysisSectionTriggerRow
          variant="coach"
          title="CoachAI tavsiyesi"
          subtitle={coachSubtitle}
          onPress={() => openModal("coach")}
        />
        {traitChips.length > 0 ? (
          <AnalysisSectionTriggerRow
            variant="traits"
            title="Aranan profil"
            subtitle={`${traitChips.length} özet madde`}
            onPress={() => openModal("traits")}
          />
        ) : null}
        <AnalysisSectionTriggerRow
          variant="strength"
          title="Eşleşen yetenekler"
          subtitle={
            alignment?.matched_skills_ui && alignment.matched_skills_ui.length > 0
              ? `${alignment.matched_skills_ui.length} yetenek · detay için dokunun`
              : strengths.length
                ? `${strengths.length} madde · ${previewLine(strengths[0] ?? "", 48)}`
                : "Liste boş olabilir"
          }
          onPress={() => openModal("strengths")}
        />
        <AnalysisSectionTriggerRow
          variant="weakness"
          title="Eksik / geliştirilebilir"
          subtitle={
            alignment?.missing_skills_ui && alignment.missing_skills_ui.length > 0
              ? `${alignment.missing_skills_ui.length} alan · detay için dokunun`
              : weaknesses.length
                ? `${weaknesses.length} madde · ${previewLine(weaknesses[0] ?? "", 48)}`
                : "Liste boş olabilir"
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

      <AnalysisCenterModal
        visible={modalOpen}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
        onDismiss={() => setModalKind(null)}
      >
        {modalKind ? (
          <FeedbackModalBody
            kind={modalKind}
            data={data}
            alignment={alignment}
            traitChips={traitChips}
            modalOpen={modalOpen}
          />
        ) : null}
      </AnalysisCenterModal>

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
