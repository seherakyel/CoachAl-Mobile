import { useMemo, useState } from "react";
import { View, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Appbar, Button, Text } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { listCompletedInterviews, type CompletedSessionListItem } from "../services/api";
import type { ReportsParamList } from "../app/navigationTypes";
import {
  formatSessionDate,
  scoreTextColor,
  sessionModeIcon,
} from "../utils/sessionLabels";
import { CoachAppBarTheme, CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<ReportsParamList>;

function sessionIdOf(s: CompletedSessionListItem): string {
  return s.session_id || s.id;
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ minWidth: "45%", marginBottom: 12 }}>
      <Text style={{ fontSize: 10, fontWeight: "700", color: CoachColors.onSurfaceVariant, letterSpacing: 0.4 }}>
        {label.toUpperCase()}
      </Text>
      <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onSurface, marginTop: 2 }}>{value}</Text>
    </View>
  );
}

export function ReportsHubScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["interview-completed", 30],
    queryFn: () => listCompletedInterviews(30),
  });

  const items = q.data?.items ?? [];
  const selected = useMemo(
    () => items.find((s) => sessionIdOf(s) === selectedId) ?? null,
    [items, selectedId],
  );

  const statsLine = selected
    ? `${selected.question_count || 0} soru` +
      (selected.weak_answer_count != null ? ` · ${selected.weak_answer_count} zayıf cevap` : "") +
      (selected.correct_count != null && selected.mode === "quiz"
        ? ` · ${selected.correct_count} doğru`
        : "")
    : "";

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
        <Appbar.Content title="Raporlar" titleStyle={{ fontWeight: "700", color: CoachColors.onComponentSurface }} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: CoachColors.onSurface, marginBottom: 8 }}>
          Sınav sonuçları
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 24, color: CoachColors.onSurfaceVariant, marginBottom: 24 }}>
          Tamamladığınız klasik sınav ve teknik quiz oturumlarını inceleyin.
        </Text>

        {q.isLoading ? (
          <View style={{ paddingVertical: 32, alignItems: "center" }}>
            <ActivityIndicator color={CoachColors.primary} />
          </View>
        ) : null}

        {q.isError ? (
          <Text style={{ color: CoachColors.error, marginBottom: 16 }}>Liste yüklenemedi.</Text>
        ) : null}

        {!q.isLoading && !items.length ? (
          <View
            style={{
              padding: 24,
              borderRadius: CoachRadii.xl,
              borderWidth: 1,
              borderColor: CoachColors.outlineVariant,
              backgroundColor: CoachColors.surfaceContainerLowest,
            }}
          >
            <Text style={{ color: CoachColors.onSurfaceVariant }}>
              Henüz tamamlanmış sınav yok. Mülakatlar sekmesinden bir oturum başlatın.
            </Text>
          </View>
        ) : null}

        {items.length > 0 ? (
          <>
            <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, marginBottom: 12 }}>
              {items.length} kayıt
            </Text>
            {items.map((s) => {
              const id = sessionIdOf(s);
              const active = selectedId === id;
              const examScore =
                s.total_score != null ? (
                  <Text style={{ fontSize: 15, fontWeight: "700", color: scoreTextColor(s.total_score) }}>
                    %{Math.round(Number(s.total_score))}
                  </Text>
                ) : s.correct_count != null ? (
                  <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant }}>
                    {s.correct_count}/{s.question_count || "?"} doğru
                  </Text>
                ) : null;

              return (
                <Pressable
                  key={id}
                  onPress={() => setSelectedId(id)}
                  style={{
                    borderWidth: 1,
                    borderColor: active ? CoachColors.primary : CoachColors.outlineVariant,
                    borderRadius: CoachRadii.lg,
                    padding: 14,
                    marginBottom: 10,
                    backgroundColor: active ? CoachColors.primaryFixed : CoachColors.surfaceContainerLowest,
                    ...CoachShadow.card,
                  }}
                >
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: CoachRadii.md,
                        backgroundColor: CoachColors.primaryFixed,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        name={sessionModeIcon(s.mode)}
                        size={22}
                        color={CoachColors.primary}
                      />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.onSurface }}>
                        {s.mode_label || s.mode}
                      </Text>
                      <Text style={{ fontSize: 12, color: CoachColors.onSurfaceVariant, marginTop: 4 }} numberOfLines={2}>
                        {s.list_label || `${s.cv_name} → ${s.company_name}`}
                      </Text>
                      <Text style={{ fontSize: 11, color: CoachColors.onSurfaceVariant, marginTop: 4 }}>
                        {formatSessionDate(s.completed_at || s.started_at)}
                      </Text>
                    </View>
                    <View>{examScore}</View>
                  </View>
                </Pressable>
              );
            })}
          </>
        ) : null}

        {selected ? (
          <View
            style={{
              marginTop: 20,
              padding: 20,
              borderRadius: CoachRadii.xl,
              borderWidth: 1,
              borderColor: CoachColors.outlineVariant,
              backgroundColor: CoachColors.surfaceContainerLow,
              ...CoachShadow.card,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <Text style={{ flex: 1, fontSize: 16, fontWeight: "600", color: CoachColors.onSurface }}>
                {(selected.cv_name || "CV") +
                  " → " +
                  (selected.company_name || "Şirket") +
                  " · " +
                  (selected.position || "Rol")}
              </Text>
              {selected.total_score != null ? (
                <Text style={{ fontSize: 22, fontWeight: "700", color: scoreTextColor(selected.total_score) }}>
                  %{Math.round(Number(selected.total_score))}
                </Text>
              ) : null}
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 16 }}>
              <PreviewStat label="CV" value={selected.cv_name || "—"} />
              <PreviewStat label="Şirket" value={selected.company_name || "—"} />
              <PreviewStat label="Hedef rol" value={selected.position || "—"} />
              <PreviewStat
                label="Eşleşme analizi"
                value={
                  selected.alignment_score != null
                    ? `%${Math.round(Number(selected.alignment_score))}`
                    : "—"
                }
              />
              <PreviewStat label="Sınav türü" value={selected.mode_label || selected.mode || "—"} />
              <PreviewStat
                label="Tarih"
                value={formatSessionDate(selected.completed_at || selected.started_at)}
              />
              <PreviewStat label="İstatistik" value={statsLine || "—"} />
            </View>

            <Text style={{ fontSize: 14, lineHeight: 22, color: CoachColors.onSurfaceVariant, marginTop: 8 }}>
              {selected.feedback_preview ||
                selected.feedback ||
                "Genel geri bildirim özeti bu oturumda kayıtlı değil. Detaylar için aşağıdaki butonu kullanın."}
            </Text>

            <Button
              mode="contained"
              style={{ marginTop: 16, alignSelf: "flex-start", borderRadius: CoachRadii.md }}
              onPress={() =>
                navigation.navigate("ExamSessionDetail", { sessionId: sessionIdOf(selected) })
              }
            >
              Tüm detayları gör
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
