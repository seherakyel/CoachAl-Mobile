import { useEffect, useRef, useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Snackbar, Text } from "react-native-paper";
import { evaluateClassicInterview, startClassicInterview } from "../services/api";
import type { ClassicQuestion } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { usePipelineStore } from "../store/usePipelineStore";
import { useInterviewStore } from "../store/useInterviewStore";
import type { InterviewParamList } from "../app/navigationTypes";
import { CoachScreenBar } from "../components/chrome/CoachScreenBar";
import { CoachCard } from "../components/ui/CoachCard";
import { CoachTextArea } from "../components/ui/CoachTextArea";
import { CoachPrimaryButton } from "../components/ui/CoachPrimaryButton";
import { CoachLoadingPanel } from "../components/ui/CoachLoadingPanel";
import { CoachErrorBanner } from "../components/ui/CoachErrorBanner";
import { CoachColors, CoachRadii } from "../theme/coachTheme";
import { CoachTypography } from "../theme/coachTypography";
import { scoreTextColor } from "../utils/sessionLabels";
type Nav = NativeStackNavigationProp<InterviewParamList>;
type R = RouteProp<InterviewParamList, "ClassicInterview">;

type Phase = "loading" | "exam" | "result";

type ResultRow = {
  question?: string;
  score?: number;
  feedback?: string;
  comment?: string;
};

export function ClassicInterviewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const alignmentId = route.params.alignmentId;
  const cvId = usePipelineStore((s) => s.cvId);
  const profileId = usePipelineStore((s) => s.profileId);

  const [phase, setPhase] = useState<Phase>("loading");
  const [snack, setSnack] = useState<string | null>(null);
  const [examError, setExamError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState("—");
  const [questions, setQuestions] = useState<ClassicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [resultRows, setResultRows] = useState<ResultRow[]>([]);
  const [totalScore, setTotalScore] = useState<number | null>(null);
  const bootRef = useRef(false);

  const start = useMutation({
    mutationFn: startClassicInterview,
    onSuccess: (d) => {
      setSessionId(d.session_id);
      setQuestions(d.questions ?? []);
      setAnswers({});
      const sub = [d.company_name, d.position].filter(Boolean).join(" · ");
      setSubtitle(sub || "—");
      setPhase("exam");
    },
    onError: (e) => {
      setSnack(extractDetail(e));
      setPhase("loading");
    },
  });

  const evaluate = useMutation({
    mutationFn: evaluateClassicInterview,
    onSuccess: (d) => {
      useInterviewStore.getState().setClassicOutcome(d.session_id, d);
      const rows = (d.per_question ?? []) as ResultRow[];
      setResultRows(rows);
      setTotalScore(typeof d.total_score === "number" ? d.total_score : null);
      setPhase("result");
    },
    onError: (e) => setSnack(extractDetail(e)),
  });

  useEffect(() => {
    if (!alignmentId && (!cvId || !profileId)) return;
    if (bootRef.current) return;
    bootRef.current = true;
    setPhase("loading");
    if (alignmentId) {
      start.mutate({
        alignment_id: alignmentId,
        cv_id: cvId ?? undefined,
        profile_id: profileId ?? undefined,
      });
    } else {
      start.mutate({ cv_id: cvId!, profile_id: profileId! });
    }
  }, [alignmentId, cvId, profileId]);

  const finish = () => {
    if (!sessionId) return;
    setExamError(null);
    const payload = questions.map((q, i) => ({
      question_index: q.index ?? i,
      answer: answers[q.index ?? i] ?? "",
    }));
    const hasContent = payload.some((a) => a.answer.trim().length > 0);
    if (!hasContent) {
      setExamError("En az bir soruyu cevaplayın.");
      return;
    }
    evaluate.mutate({ session_id: sessionId, answers: payload });
  };

  const openReport = () => {
    if (!sessionId) return;
    const parent = navigation.getParent() as { navigate: (name: string, params?: object) => void } | undefined;
    parent?.navigate("Reports", {
      screen: "ExamSessionDetail",
      params: { sessionId },
    });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
        <CoachScreenBar
          title="Klasik Sınav"
          subtitle={phase === "exam" ? subtitle : undefined}
          onBack={() => navigation.goBack()}
        />

        {phase === "loading" || start.isPending ? (
          <CoachLoadingPanel />
        ) : null}

        {phase === "exam" && !start.isPending ? (
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={[CoachTypography.h2, { color: CoachColors.onSurface }]}>Klasik Sınav</Text>
              <View
                style={{
                  backgroundColor: CoachColors.primaryFixed,
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: CoachRadii.full,
                }}
              >
                <Text style={[CoachTypography.labelSm, { color: CoachColors.primary, fontWeight: "600" }]}>
                  Başladı
                </Text>
              </View>
            </View>
            <Text style={[CoachTypography.bodyMd, { color: CoachColors.onSurfaceVariant, marginBottom: 20 }]}>
              {subtitle}
            </Text>

            {questions.map((q, i) => {
              const qIdx = q.index ?? i;
              const text = q.question || "";
              return (
                <CoachCard key={String(qIdx)} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                    <View
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: CoachColors.primaryFixed,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontWeight: "700", fontSize: 13, color: CoachColors.primary }}>{i + 1}</Text>
                    </View>
                    <Text style={[CoachTypography.bodyLg, { flex: 1, color: CoachColors.onSurface, fontWeight: "500" }]}>
                      {text}
                    </Text>
                  </View>
                  <CoachTextArea
                    value={answers[qIdx] ?? ""}
                    onChangeText={(t) => setAnswers((prev) => ({ ...prev, [qIdx]: t }))}
                    placeholder="Cevabınızı buraya yazın…"
                  />
                </CoachCard>
              );
            })}

            <CoachErrorBanner message={examError ?? ""} />
            <CoachPrimaryButton
              label="Sınavı Teslim Et"
              icon="send"
              loading={evaluate.isPending}
              onPress={finish}
              style={{ marginTop: 8 }}
            />
          </ScrollView>
        ) : null}

        {phase === "result" ? (
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
            <CoachCard>
              <Text style={[CoachTypography.h2, { color: CoachColors.onSurface, textAlign: "center", marginBottom: 8 }]}>
                Sınav Tamamlandı
              </Text>
              {totalScore != null ? (
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 28,
                    fontWeight: "700",
                    color: scoreTextColor(totalScore),
                    marginBottom: 20,
                  }}
                >
                  %{Math.round(totalScore)}
                </Text>
              ) : null}
              {resultRows.map((r, i) => {
                const sc = typeof r.score === "number" ? r.score : null;
                const fb = r.feedback || r.comment || "";
                return (
                  <View
                    key={i}
                    style={{
                      borderBottomWidth: i < resultRows.length - 1 ? 1 : 0,
                      borderBottomColor: CoachColors.outlineVariant,
                      paddingVertical: 16,
                    }}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                      <Text style={[CoachTypography.labelSm, { flex: 1, color: CoachColors.onSurface, fontWeight: "600" }]}>
                        {r.question || `Soru ${i + 1}`}
                      </Text>
                      {sc != null ? (
                        <Text style={{ fontSize: 22, fontWeight: "700", color: scoreTextColor(sc) }}>{sc}</Text>
                      ) : null}
                    </View>
                    {fb ? (
                      <Text style={[CoachTypography.bodyMd, { color: CoachColors.onSurfaceVariant, marginTop: 8 }]}>
                        {fb}
                      </Text>
                    ) : null}
                  </View>
                );
              })}
            </CoachCard>
            <View style={{ flexDirection: "row", gap: 12, marginTop: 20, justifyContent: "center" }}>
              <CoachPrimaryButton
                label="Yeniden dene"
                variant="outline"
                onPress={() => navigation.navigate("InterviewHub")}
                style={{ flex: 1 }}
              />
              <CoachPrimaryButton label="Raporu Gör" icon="chart-box-outline" onPress={openReport} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        ) : null}

        {phase === "exam" && questions.length === 0 && !start.isPending ? (
          <View style={{ padding: 20 }}>
            <Text style={{ color: CoachColors.onSurfaceVariant }}>Soru bulunamadı.</Text>
          </View>
        ) : null}

        <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={7000}>
          {snack ?? ""}
        </Snackbar>
      </View>
    </KeyboardAvoidingView>
  );
}
