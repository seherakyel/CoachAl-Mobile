import { View, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Appbar, Card, Text } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getInterviewSession } from "../services/api";
import type { InterviewSessionQuestionRow } from "../services/api";
import type { ReportsParamList } from "../app/navigationTypes";
import { formatSessionDate, scoreTextColor } from "../utils/sessionLabels";
import { CoachAppBarTheme, CoachColors, CoachRadii } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<ReportsParamList>;
type R = RouteProp<ReportsParamList, "ExamSessionDetail">;

function QuestionBlock({ row, index, mode }: { row: InterviewSessionQuestionRow; index: number; mode: string }) {
  if (mode === "quiz") {
    const ok = row.is_correct === true;
    const opts = row.options ?? [];
    const sel =
      row.selected_index != null && opts[row.selected_index] != null
        ? opts[row.selected_index]
        : "—";
    const cor =
      row.correct_index != null && opts[row.correct_index] != null ? opts[row.correct_index] : "—";
    return (
      <Card
        mode="outlined"
        style={{
          marginBottom: 12,
          borderColor: ok ? "#a7f3d0" : "#fecaca",
          backgroundColor: ok ? "rgba(236, 253, 245, 0.5)" : "rgba(254, 242, 242, 0.5)",
        }}
      >
        <Card.Content>
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
            <MaterialCommunityIcons
              name={ok ? "check-circle" : "close-circle"}
              size={22}
              color={ok ? "#059669" : "#dc2626"}
            />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: "600", color: CoachColors.onSurface }}>
              {index + 1}. {row.question}
              {row.difficulty ? ` (${row.difficulty})` : ""}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant }}>Seçiminiz: {sel}</Text>
          <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, marginTop: 4 }}>
            Doğru: {cor}
          </Text>
          {row.explanation ? (
            <Text style={{ fontSize: 12, color: CoachColors.onSurfaceVariant, marginTop: 8, fontStyle: "italic" }}>
              {row.explanation}
            </Text>
          ) : null}
        </Card.Content>
      </Card>
    );
  }

  const weak = row.score != null && row.score < 60;
  return (
    <Card
      mode="outlined"
      style={{
        marginBottom: 12,
        borderColor: weak ? "#fecaca" : CoachColors.outlineVariant,
        backgroundColor: weak ? "rgba(254, 242, 242, 0.35)" : CoachColors.surfaceContainerLowest,
      }}
    >
      <Card.Content>
        <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.onSurface, marginBottom: 8 }}>
          {index + 1}. {row.question}
          {row.difficulty ? ` (${row.difficulty})` : ""}
        </Text>
        <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant }}>Cevap: {row.answer || "—"}</Text>
        {row.score != null ? (
          <Text style={{ fontSize: 13, fontWeight: "600", marginTop: 6, color: scoreTextColor(row.score) }}>
            Puan: %{Math.round(Number(row.score))}
          </Text>
        ) : null}
        {row.feedback ? (
          <Text style={{ fontSize: 12, color: CoachColors.onSurfaceVariant, marginTop: 8 }}>{row.feedback}</Text>
        ) : null}
      </Card.Content>
    </Card>
  );
}

export function ExamSessionDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const sessionId = route.params.sessionId;

  const q = useQuery({
    queryKey: ["interview-session", sessionId],
    queryFn: () => getInterviewSession(sessionId),
    enabled: !!sessionId,
  });

  const d = q.data;
  const perQ = d?.per_question ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={d?.mode_label || "Sınav detayı"}
          titleStyle={{ color: CoachColors.onComponentSurface }}
        />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        {q.isLoading ? <Text>Yükleniyor…</Text> : null}
        {q.isError ? <Text style={{ color: CoachColors.error }}>Detay yüklenemedi.</Text> : null}
        {d ? (
          <>
            <View
              style={{
                padding: 16,
                borderRadius: CoachRadii.xl,
                backgroundColor: CoachColors.surfaceContainerLow,
                borderWidth: 1,
                borderColor: CoachColors.outlineVariant,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant }}>
                {(d.cv_name || "CV") +
                  " · " +
                  (d.company_name || "") +
                  " · " +
                  (d.position || "")}
              </Text>
              <Text style={{ fontSize: 12, color: CoachColors.onSurfaceVariant, marginTop: 6 }}>
                Eşleşme:{" "}
                {d.alignment_score != null ? `%${Math.round(Number(d.alignment_score))}` : "—"} · Sınav:{" "}
                {d.total_score != null ? `%${Math.round(Number(d.total_score))}` : "—"} ·{" "}
                {formatSessionDate(d.completed_at || d.started_at)}
              </Text>
            </View>
            {(d.feedback_full || d.feedback) ? (
              <Text style={{ fontSize: 14, lineHeight: 22, color: CoachColors.onSurface, marginBottom: 16 }}>
                {d.feedback_full || d.feedback}
              </Text>
            ) : null}
            {perQ.length === 0 ? (
              <Text style={{ color: CoachColors.onSurfaceVariant }}>Soru detayı bulunamadı.</Text>
            ) : (
              perQ.map((row, i) => (
                <QuestionBlock key={String(row.question_index ?? i)} row={row} index={i} mode={d.mode} />
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
