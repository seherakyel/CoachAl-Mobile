import { View, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text } from "react-native-paper";
import { useInterviewStore } from "../store/useInterviewStore";
import type { InterviewParamList } from "../app/navigationTypes";
import { CoachScreenBar } from "../components/chrome/CoachScreenBar";
import { CoachCard } from "../components/ui/CoachCard";
import { CoachPrimaryButton } from "../components/ui/CoachPrimaryButton";
import { CoachColors } from "../theme/coachTheme";
import { CoachTypography } from "../theme/coachTypography";
import { scoreTextColor } from "../utils/sessionLabels";

type Nav = NativeStackNavigationProp<InterviewParamList>;

/** Deep-link / legacy fallback — ana akış artık exam/quiz ekranında inline sonuç. */
export function InterviewOutcomeScreen() {
  const navigation = useNavigation<Nav>();
  const lastMode = useInterviewStore((s) => s.lastMode);
  const classic = useInterviewStore((s) => s.classicResult);
  const quiz = useInterviewStore((s) => s.quizResult);
  const lastSessionId = useInterviewStore((s) => s.lastSessionId);

  const openReport = () => {
    if (!lastSessionId) return;
    const parent = navigation.getParent() as { navigate: (name: string, params?: object) => void } | undefined;
    parent?.navigate("Reports", { screen: "ExamSessionDetail", params: { sessionId: lastSessionId } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <CoachScreenBar title="Mülakat sonucu" onBack={() => navigation.navigate("InterviewHub")} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {lastMode === "classic" && classic ? (
          <CoachCard>
            <Text style={[CoachTypography.h2, { color: scoreTextColor(classic.total_score) }]}>
              Skor: {String(classic.total_score)}%
            </Text>
            <Text style={[CoachTypography.bodyMd, { marginTop: 10, color: CoachColors.onSurfaceVariant }]}>
              {classic.feedback}
            </Text>
          </CoachCard>
        ) : null}
        {lastMode === "quiz" && quiz ? (
          <CoachCard>
            <Text style={[CoachTypography.h2, { color: scoreTextColor(quiz.total_score) }]}>
              Skor: {String(quiz.total_score)}%
            </Text>
            <Text style={[CoachTypography.bodyMd, { marginTop: 10, color: CoachColors.onSurfaceVariant }]}>
              Doğru: {quiz.correct_count} / {quiz.total_questions}
            </Text>
          </CoachCard>
        ) : null}
        <CoachPrimaryButton label="Raporu gör" onPress={openReport} disabled={!lastSessionId} style={{ marginTop: 16 }} />
        <CoachPrimaryButton
          label="Merkeze dön"
          variant="outline"
          onPress={() => navigation.navigate("InterviewHub")}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </View>
  );
}
