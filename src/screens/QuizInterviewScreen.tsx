import { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { Snackbar, Text } from "react-native-paper";
import { startQuizInterview, submitQuizInterview } from "../services/api";
import type { QuizQuestion } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { InterviewTimer } from "../components/InterviewTimer";
import { usePipelineStore } from "../store/usePipelineStore";
import { useInterviewStore } from "../store/useInterviewStore";
import type { InterviewParamList } from "../app/navigationTypes";
import { CoachScreenBar } from "../components/chrome/CoachScreenBar";
import { CoachCard } from "../components/ui/CoachCard";
import { CoachPrimaryButton } from "../components/ui/CoachPrimaryButton";
import { CoachLoadingPanel } from "../components/ui/CoachLoadingPanel";
import { CoachColors, CoachRadii } from "../theme/coachTheme";
import { CoachTypography } from "../theme/coachTypography";
import { scoreTextColor } from "../utils/sessionLabels";
type Nav = NativeStackNavigationProp<InterviewParamList>;
type R = RouteProp<InterviewParamList, "QuizInterview">;

type Phase = "loading" | "quiz" | "result";

export function QuizInterviewScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const alignmentId = route.params.alignmentId;
  const cvId = usePipelineStore((s) => s.cvId);
  const profileId = usePipelineStore((s) => s.profileId);

  const [phase, setPhase] = useState<Phase>("loading");
  const [snack, setSnack] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState("—");
  const [seconds, setSeconds] = useState(60);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [quizResult, setQuizResult] = useState<{
    total_score: number;
    correct_count: number;
    total_questions: number;
  } | null>(null);
  const bootRef = useRef(false);

  const start = useMutation({
    mutationFn: startQuizInterview,
    onSuccess: (d) => {
      setSessionId(d.session_id);
      setQuestions(d.questions ?? []);
      setSeconds(d.seconds_per_question ?? 60);
      setSubtitle([d.company_name, d.position].filter(Boolean).join(" · ") || "—");
      setIdx(0);
      setSelected(null);
      setLocked(false);
      setAnswers({});
      setPhase("quiz");
    },
    onError: (e) => setSnack(extractDetail(e)),
  });

  const submit = useMutation({
    mutationFn: submitQuizInterview,
    onSuccess: (d) => {
      useInterviewStore.getState().setQuizOutcome(d.session_id, d);
      setQuizResult({
        total_score: d.total_score,
        correct_count: d.correct_count,
        total_questions: d.total_questions,
      });
      setPhase("result");
    },
    onError: (e) => setSnack(extractDetail(e)),
  });

  useEffect(() => {
    if (!alignmentId && (!cvId || !profileId)) return;
    if (bootRef.current) return;
    bootRef.current = true;
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

  const current = useMemo(() => questions[idx] ?? null, [questions, idx]);
  const total = questions.length;

  const submitFinal = (map: Record<number, number | null>) => {
    if (!sessionId) return;
    const payload = questions.map((q, i) => ({
      question_index: q.index ?? i,
      selected_index: map[q.index ?? i] ?? null,
    }));
    submit.mutate({ session_id: sessionId, answers: payload });
  };

  const goNext = () => {
    if (!current) return;
    const qIdx = current.index ?? idx;
    const nextMap = { ...answers, [qIdx]: selected ?? null };
    setAnswers(nextMap);
    if (idx < total - 1) {
      setIdx((x) => x + 1);
      setSelected(null);
      setLocked(false);
    } else {
      submitFinal(nextMap);
    }
  };

  const openReport = () => {
    if (!sessionId) return;
    const parent = navigation.getParent() as { navigate: (name: string, params?: object) => void } | undefined;
    parent?.navigate("Reports", { screen: "ExamSessionDetail", params: { sessionId } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <CoachScreenBar title="Teknik Quiz" subtitle={phase === "quiz" ? subtitle : undefined} onBack={() => navigation.goBack()} />

      {phase === "loading" || start.isPending ? <CoachLoadingPanel message="AI soruları oluşturuyor…" /> : null}

      {phase === "quiz" && current ? (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <View>
              <Text style={[CoachTypography.h2, { color: CoachColors.onSurface }]}>Teknik Quiz</Text>
              <Text style={[CoachTypography.bodyMd, { color: CoachColors.onSurfaceVariant, marginTop: 4 }]}>
                Soru {idx + 1} / {total}
              </Text>
            </View>
            <InterviewTimer
              key={`${sessionId}-${idx}`}
              secondsTotal={seconds}
              active={!locked && !submit.isPending}
              onExpire={() => setLocked(true)}
            />
          </View>

          <CoachCard>
            <Text style={[CoachTypography.bodyLg, { color: CoachColors.onSurface, fontWeight: "600", marginBottom: 16 }]}>
              {current.question}
            </Text>
            <View style={{ gap: 10 }}>
              {(current.options ?? []).map((opt, oi) => {
                const selectedNow = selected === oi;
                return (
                  <Pressable
                    key={`${current.index}-${oi}`}
                    disabled={locked}
                    onPress={() => setSelected(oi)}
                    style={{
                      paddingVertical: 14,
                      paddingHorizontal: 16,
                      borderRadius: CoachRadii.lg,
                      borderWidth: 1,
                      borderColor: selectedNow ? CoachColors.primary : CoachColors.outlineVariant,
                      backgroundColor: selectedNow ? CoachColors.primaryFixed : CoachColors.surfaceContainerLow,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        color: selectedNow ? CoachColors.primary : CoachColors.onSurface,
                        fontWeight: selectedNow ? "600" : "400",
                      }}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {locked ? (
              <Text style={[CoachTypography.caption, { color: CoachColors.onSurfaceVariant, marginTop: 12 }]}>
                Süre doldu. Seçim yapılmadıysa boş gönderilir.
              </Text>
            ) : null}
            <CoachPrimaryButton
              label={idx < total - 1 ? "Sonraki" : "Gönder"}
              onPress={goNext}
              loading={submit.isPending}
              style={{ marginTop: 16 }}
            />
          </CoachCard>
        </ScrollView>
      ) : null}

      {phase === "result" && quizResult ? (
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
          <CoachCard>
            <Text style={[CoachTypography.h2, { color: CoachColors.onSurface, textAlign: "center" }]}>Quiz Tamamlandı</Text>
            <Text
              style={{
                textAlign: "center",
                fontSize: 32,
                fontWeight: "700",
                color: scoreTextColor(quizResult.total_score),
                marginVertical: 12,
              }}
            >
              %{Math.round(quizResult.total_score)}
            </Text>
            <Text style={[CoachTypography.bodyMd, { textAlign: "center", color: CoachColors.onSurfaceVariant }]}>
              Doğru: {quizResult.correct_count} / {quizResult.total_questions}
            </Text>
          </CoachCard>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
            <CoachPrimaryButton
              label="Yeniden dene"
              variant="outline"
              onPress={() => navigation.navigate("InterviewHub")}
              style={{ flex: 1 }}
            />
            <CoachPrimaryButton label="Raporu Gör" onPress={openReport} style={{ flex: 1 }} />
          </View>
        </ScrollView>
      ) : null}

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={7000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
