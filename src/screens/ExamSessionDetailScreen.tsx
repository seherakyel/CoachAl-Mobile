import { View, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getInterviewSession } from "../services/api";
import type { InterviewSessionQuestionRow } from "../services/api";
import type { ReportsParamList } from "../app/navigationTypes";
import { CoachScreenBar } from "../components/chrome/CoachScreenBar";
import { CoachCard } from "../components/ui/CoachCard";
import { CoachLoadingPanel } from "../components/ui/CoachLoadingPanel";
import { formatSessionDate, scoreTextColor } from "../utils/sessionLabels";
import { CoachColors, CoachRadii } from "../theme/coachTheme";
import { CoachTypography } from "../theme/coachTypography";
import { WebTokens } from "../theme/webTokens";

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
      <CoachCard
        style={{
          marginBottom: 12,
          borderColor: ok ? WebTokens.scoreEmerald : WebTokens.scoreRed,
          backgroundColor: ok ? "rgba(5, 150, 105, 0.06)" : "rgba(220, 38, 38, 0.06)",
        }}
      >
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <MaterialCommunityIcons
            name={ok ? "check-circle" : "close-circle"}
            size={22}
            color={ok ? WebTokens.scoreEmerald : WebTokens.scoreRed}
          />
          <Text style={[CoachTypography.labelSm, { flex: 1, fontWeight: "600", color: CoachColors.onSurface }]}>
            {index + 1}. {row.question}
            {row.difficulty ? ` (${row.difficulty})` : ""}
          </Text>
        </View>
        <Text style={[CoachTypography.bodyMd, { color: CoachColors.onSurfaceVariant }]}>Seçiminiz: {sel}</Text>
        <Text style={[CoachTypography.bodyMd, { color: CoachColors.onSurfaceVariant, marginTop: 4 }]}>
          Doğru: {cor}
        </Text>
        {row.explanation ? (
          <Text style={[CoachTypography.caption, { marginTop: 8, fontStyle: "italic", color: CoachColors.onSurfaceVariant }]}>
            {row.explanation}
          </Text>
        ) : null}
      </CoachCard>
    );
  }

  const weak = row.score != null && row.score < 60;
  return (
    <CoachCard
      style={{
        marginBottom: 12,
        borderColor: weak ? WebTokens.scoreRed : CoachColors.outlineVariant,
        backgroundColor: weak ? "rgba(220, 38, 38, 0.04)" : CoachColors.surfaceContainerLowest,
      }}
    >
      <Text style={[CoachTypography.labelSm, { fontWeight: "600", color: CoachColors.onSurface, marginBottom: 8 }]}>
        {index + 1}. {row.question}
        {row.difficulty ? ` (${row.difficulty})` : ""}
      </Text>
      <Text style={[CoachTypography.bodyMd, { color: CoachColors.onSurfaceVariant }]}>Cevap: {row.answer || "—"}</Text>
      {row.score != null ? (
        <Text style={[CoachTypography.labelSm, { marginTop: 6, fontWeight: "600", color: scoreTextColor(row.score) }]}>
          Puan: %{Math.round(Number(row.score))}
        </Text>
      ) : null}
      {row.feedback ? (
        <Text style={[CoachTypography.caption, { marginTop: 8, color: CoachColors.onSurfaceVariant }]}>{row.feedback}</Text>
      ) : null}
    </CoachCard>
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
      <CoachScreenBar
        title={d?.mode_label || "Sınav detayı"}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        {q.isLoading ? <CoachLoadingPanel message="Detaylar yükleniyor…" /> : null}
        {q.isError ? <Text style={{ color: CoachColors.error }}>Detay yüklenemedi.</Text> : null}
        {d && !q.isLoading ? (
          <>
            <CoachCard style={{ marginBottom: 16 }}>
              <Text style={[CoachTypography.bodyMd, { color: CoachColors.onSurfaceVariant }]}>
                {(d.cv_name || "CV") + " · " + (d.company_name || "") + " · " + (d.position || "")}
              </Text>
              <Text style={[CoachTypography.caption, { color: CoachColors.onSurfaceVariant, marginTop: 6 }]}>
                Eşleşme:{" "}
                {d.alignment_score != null ? `%${Math.round(Number(d.alignment_score))}` : "—"} · Sınav:{" "}
                {d.total_score != null ? `%${Math.round(Number(d.total_score))}` : "—"} ·{" "}
                {formatSessionDate(d.completed_at || d.started_at)}
              </Text>
            </CoachCard>
            {(d.feedback_full || d.feedback) ? (
              <Text style={[CoachTypography.bodyMd, { color: CoachColors.onSurface, marginBottom: 16, lineHeight: 22 }]}>
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
