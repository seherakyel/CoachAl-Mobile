import { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Appbar, Button, Card, Snackbar, Text } from "react-native-paper";
import { startQuizInterview, submitQuizInterview } from "../services/api";
import type { QuizQuestion } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { InterviewTimer } from "../components/InterviewTimer";
import { usePipelineStore } from "../store/usePipelineStore";
import { useInterviewStore } from "../store/useInterviewStore";
import type { InterviewParamList } from "../app/navigationTypes";

type Nav = NativeStackNavigationProp<InterviewParamList>;

export function QuizInterviewScreen() {
  const navigation = useNavigation<Nav>();
  const cvId = usePipelineStore((s) => s.cvId);
  const profileId = usePipelineStore((s) => s.profileId);
  const [snack, setSnack] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(60);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const bootRef = useRef(false);

  const start = useMutation({
    mutationFn: startQuizInterview,
    onSuccess: (d) => {
      setSessionId(d.session_id);
      setQuestions(d.questions ?? []);
      setSeconds(d.seconds_per_question ?? 60);
      setIdx(0);
      setSelected(null);
      setLocked(false);
      setAnswers({});
    },
    onError: (e) => setSnack(extractDetail(e)),
  });

  const submit = useMutation({
    mutationFn: submitQuizInterview,
    onSuccess: (d) => {
      useInterviewStore.getState().setQuizOutcome(d.session_id, d);
      navigation.replace("InterviewOutcome");
    },
    onError: (e) => setSnack(extractDetail(e)),
  });

  useEffect(() => {
    if (!cvId || !profileId) return;
    if (bootRef.current) return;
    bootRef.current = true;
    start.mutate({ cv_id: cvId, profile_id: profileId });
  }, [cvId, profileId]);

  const current = useMemo(() => questions[idx] ?? null, [questions, idx]);
  const total = questions.length;

  const submitFinal = (map: Record<number, number | null>) => {
    if (!sessionId) return;
    const payload = questions.map((q) => ({
      question_index: q.index,
      selected_index: map[q.index] ?? null,
    }));
    submit.mutate({ session_id: sessionId, answers: payload });
  };

  const goNext = () => {
    if (!current) return;
    const nextMap = { ...answers, [current.index]: selected ?? null };
    setAnswers(nextMap);
    if (idx < total - 1) {
      setIdx((x) => x + 1);
      setSelected(null);
      setLocked(false);
    } else {
      submitFinal(nextMap);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header elevated>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quiz mülakat" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {start.isPending ? <Text>Yükleniyor…</Text> : null}
        {current ? (
          <Card mode="outlined">
            <Card.Content>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text variant="labelLarge" style={{ opacity: 0.7 }}>
                  Soru {idx + 1} / {total}
                </Text>
                <InterviewTimer
                  key={`${sessionId}-${idx}`}
                  secondsTotal={seconds}
                  active={!locked && !submit.isPending}
                  onExpire={() => setLocked(true)}
                />
              </View>
              <Text variant="titleMedium" style={{ marginTop: 10, fontWeight: "700" }}>
                {current.question}
              </Text>
              <View style={{ marginTop: 12, gap: 8 }}>
                {(current.options ?? []).map((opt, oi) => {
                  const disabled = locked;
                  const selectedNow = selected === oi;
                  return (
                    <Button
                      key={`${current.index}-${oi}`}
                      mode={selectedNow ? "contained" : "outlined"}
                      disabled={disabled}
                      onPress={() => setSelected(oi)}
                    >
                      {opt}
                    </Button>
                  );
                })}
              </View>
              <Button
                mode="contained-tonal"
                style={{ marginTop: 14 }}
                loading={submit.isPending}
                onPress={() => goNext()}
              >
                {idx < total - 1 ? "Sonraki" : "Gönder"}
              </Button>
              {locked ? (
                <Text variant="bodySmall" style={{ marginTop: 10, opacity: 0.75 }}>
                  Süre doldu. Seçim yapılmadıysa boş gönderilir.
                </Text>
              ) : null}
            </Card.Content>
          </Card>
        ) : (
          !start.isPending ? <Text>Soru bulunamadı</Text> : null
        )}
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={7000}>
        {snack ?? ""}
      </Snackbar>
    </View>
  );
}
