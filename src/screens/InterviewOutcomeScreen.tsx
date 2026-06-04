import { View, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Appbar, Button, Card, Text } from "react-native-paper";
import { useInterviewStore } from "../store/useInterviewStore";
import type { InterviewParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<InterviewParamList>;

export function InterviewOutcomeScreen() {
  const navigation = useNavigation<Nav>();
  const lastMode = useInterviewStore((s) => s.lastMode);
  const classic = useInterviewStore((s) => s.classicResult);
  const quiz = useInterviewStore((s) => s.quizResult);
  const lastSessionId = useInterviewStore((s) => s.lastSessionId);

  const openReport = () => {
    if (!lastSessionId) return;
    const parent = navigation.getParent() as { navigate: (name: string, params?: Record<string, unknown>) => void } | undefined;
    if (!parent) return;
    parent.navigate("Reports", {
      screen: "ExamSessionDetail",
      params: { sessionId: lastSessionId },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
        <Appbar.Content title="Mülakat sonucu" titleStyle={{ color: CoachColors.onComponentSurface }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {lastMode === "classic" && classic ? (
          <Card mode="outlined">
            <Card.Content>
              <Text variant="titleLarge" style={{ fontWeight: "800" }}>
                Skor: {String(classic.total_score)}
              </Text>
              <Text variant="bodyMedium" style={{ marginTop: 10 }}>
                {classic.feedback}
              </Text>
              <Text variant="bodySmall" style={{ marginTop: 10, opacity: 0.7 }}>
                Oturum: {classic.session_id}
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        {lastMode === "quiz" && quiz ? (
          <Card mode="outlined">
            <Card.Content>
              <Text variant="titleLarge" style={{ fontWeight: "800" }}>
                Skor: {String(quiz.total_score)}
              </Text>
              <Text variant="bodyMedium" style={{ marginTop: 10 }}>
                Doğru: {String(quiz.correct_count)} / {String(quiz.total_questions)}
              </Text>
              <Text variant="bodySmall" style={{ marginTop: 10, opacity: 0.7 }}>
                Oturum: {quiz.session_id}
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        <View style={{ height: 12 }} />
        <Button mode="contained" disabled={!lastSessionId} onPress={openReport}>
          Raporu gör
        </Button>
        <View style={{ height: 10 }} />
        <Button mode="outlined" onPress={() => navigation.navigate("InterviewHub")}>
          Merkeze dön
        </Button>
      </ScrollView>
    </View>
  );
}
