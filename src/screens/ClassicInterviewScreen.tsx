import { useEffect, useMemo, useRef, useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Appbar, Button, Card, Snackbar, Text, TextInput } from "react-native-paper";
import { evaluateClassicInterview, startClassicInterview } from "../services/api";
import type { ClassicQuestion } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { usePipelineStore } from "../store/usePipelineStore";
import { useInterviewStore } from "../store/useInterviewStore";
import type { InterviewParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<InterviewParamList>;

export function ClassicInterviewScreen() {
  const navigation = useNavigation<Nav>();
  const cvId = usePipelineStore((s) => s.cvId);
  const profileId = usePipelineStore((s) => s.profileId);
  const [snack, setSnack] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ClassicQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [idx, setIdx] = useState(0);
  const bootRef = useRef(false);

  const start = useMutation({
    mutationFn: startClassicInterview,
    onSuccess: (d) => {
      setSessionId(d.session_id);
      setQuestions(d.questions ?? []);
      setIdx(0);
      setAnswers({});
    },
    onError: (e) => setSnack(extractDetail(e)),
  });

  const evaluate = useMutation({
    mutationFn: evaluateClassicInterview,
    onSuccess: (d) => {
      useInterviewStore.getState().setClassicOutcome(d.session_id, d);
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

  const finish = () => {
    if (!sessionId) return;
    const payload = questions.map((q) => ({
      question_index: q.index,
      answer: answers[q.index] ?? "",
    }));
    evaluate.mutate({ session_id: sessionId, answers: payload });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
        <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Klasik mülakat" titleStyle={{ color: CoachColors.onComponentSurface }} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={{ padding: 12 }}>
          {start.isPending ? <Text>Yükleniyor…</Text> : null}
          {current ? (
            <Card mode="outlined">
              <Card.Content>
                <Text variant="labelLarge" style={{ opacity: 0.7 }}>
                  Soru {idx + 1} / {total}
                </Text>
                <Text variant="titleMedium" style={{ marginTop: 10, fontWeight: "700" }}>
                  {current.question}
                </Text>
                <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.7 }}>
                  {(current.type ?? "") + (current.difficulty ? ` · ${current.difficulty}` : "")}
                </Text>
                <TextInput
                  multiline
                  style={{ marginTop: 12, minHeight: 120 }}
                  value={answers[current.index] ?? ""}
                  onChangeText={(t) => setAnswers((prev) => ({ ...prev, [current.index]: t }))}
                  placeholder="Cevabınızı yazın"
                />
                <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                  <Button
                    mode="outlined"
                    disabled={idx === 0}
                    onPress={() => setIdx((x) => Math.max(0, x - 1))}
                  >
                    Önceki
                  </Button>
                  {idx < total - 1 ? (
                    <Button mode="contained" onPress={() => setIdx((x) => Math.min(total - 1, x + 1))}>
                      Sonraki
                    </Button>
                  ) : (
                    <Button
                      mode="contained"
                      loading={evaluate.isPending}
                      onPress={() => finish()}
                    >
                      Bitir ve gönder
                    </Button>
                  )}
                </View>
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
    </KeyboardAvoidingView>
  );
}
