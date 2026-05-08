import { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Text } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getDashboardSummary, listAlignments } from "../services/api";
import { CoachHeader } from "../components/chrome/CoachHeader";
import { usePipelineStore } from "../store/usePipelineStore";
import { useAnalysisJobStore, type AnalysisJob } from "../store/useAnalysisJobStore";
import type { MainTabParamList, AnalyzeParamList } from "../app/navigationTypes";
import { CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";
import { useAuthStore } from "../store/useAuthStore";

type DashNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  NativeStackNavigationProp<AnalyzeParamList>
>;

function MetricTotalAnalyses(props: { value: string }) {
  return (
    <View
      style={{
        backgroundColor: CoachColors.primary,
        borderRadius: CoachRadii.xl,
        padding: 16,
        flex: 1,
        minHeight: 120,
        justifyContent: "space-between",
        ...CoachShadow.elevated,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <MaterialCommunityIcons name="folder-multiple-outline" size={20} color={CoachColors.onPrimaryMuted} />
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: CoachColors.onPrimaryMuted,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          Toplam analiz
        </Text>
      </View>
      <Text style={{ fontSize: 32, fontWeight: "700", color: CoachColors.onPrimary }}>{props.value}</Text>
    </View>
  );
}

function MetricAvgMatch(props: { value: string }) {
  return (
    <View
      style={{
        backgroundColor: CoachColors.surfaceCard,
        borderRadius: CoachRadii.xl,
        borderWidth: 1,
        borderColor: CoachColors.outlineVariant,
        padding: 16,
        flex: 1,
        minHeight: 120,
        justifyContent: "space-between",
        overflow: "hidden",
        ...CoachShadow.card,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <MaterialCommunityIcons name="chart-donut" size={20} color={CoachColors.accent} />
        <Text
          style={{
            fontSize: 11,
            fontWeight: "600",
            color: CoachColors.onSurfaceVariant,
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          Ort. eşleşme
        </Text>
      </View>
      <Text style={{ fontSize: 32, fontWeight: "700", color: CoachColors.primary }}>{props.value}</Text>
    </View>
  );
}

export function DashboardScreen() {
  const navigation = useNavigation<DashNav>();
  const user = useAuthStore((s) => s.user);
  const [q, setQ] = useState("");

  const { data, isLoading, refetch, isRefetching, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardSummary,
  });

  const apps = useMemo(() => {
    const items = data?.applications ?? [];
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (a) =>
        (a.company_name ?? "").toLowerCase().includes(s) ||
        (a.position ?? "").toLowerCase().includes(s)
    );
  }, [data, q]);

  const avgScore = useMemo(() => {
    const scored = (data?.applications ?? []).filter((a) => a.alignment_score != null);
    if (scored.length === 0) return 0;
    const sum = scored.reduce((acc, a) => acc + (a.alignment_score || 0), 0);
    return Math.round(sum / scored.length);
  }, [data]);

  const welcomeName = user?.displayName || user?.email?.split("@")[0] || "sen";

  const openInterviewsFor = async (appItem: (typeof apps)[number]) => {
    try {
      const list = await listAlignments(80);
      const candidates = list.items.filter((x) => x.profile_id === appItem.profile_id);
      const sorted = [...candidates].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      const pickItem = sorted[0];
      const recent = data?.recent_alignments?.find(
        (r) => r.profile_id === appItem.profile_id && r.alignment_id === (appItem.alignment_id ?? "")
      );
      const cvId = recent?.cv_id ?? pickItem?.cv_id ?? "";
      const alignmentId = appItem.alignment_id ?? pickItem?.id ?? null;
      usePipelineStore.getState().hydrateFromApplication({
        cvId,
        profileId: appItem.profile_id,
        alignmentId,
        companyName: appItem.company_name,
        positionTitle: appItem.position,
      });
      navigation.navigate("Interviews", { screen: "InterviewHub" });
    } catch {
      usePipelineStore.getState().hydrateFromApplication({
        cvId: "",
        profileId: appItem.profile_id,
        alignmentId: appItem.alignment_id,
        companyName: appItem.company_name,
        positionTitle: appItem.position,
      });
      navigation.navigate("Interviews", { screen: "InterviewHub" });
    }
  };

  const totalAnalyses = data?.applications?.length ?? 0;
  const statTotal = isError ? "—" : String(totalAnalyses);
  const statAvg = avgScore ? `%${avgScore}` : "—";

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <CoachHeader searchValue={q} onSearchChange={setQ} />
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={CoachColors.secondary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <Text style={{ fontSize: 30, fontWeight: "700", letterSpacing: -0.6, color: CoachColors.primary, marginBottom: 4 }}>
            Merhaba, {welcomeName}
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: CoachColors.onSurfaceVariant, marginBottom: 28 }}>
            Kariyer verilerin güncel; son analizlerin aşağıda.
          </Text>

          <View style={{ flexDirection: "row", gap: 16, marginBottom: 28 }}>
            <MetricTotalAnalyses value={statTotal} />
            <MetricAvgMatch value={statAvg} />
          </View>

          <View style={{ flexDirection: "row", gap: 16, marginBottom: 32 }}>
            <Pressable
              onPress={() => navigation.navigate("CvAnalysis", { screen: "CvAnalysisHome" })}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: CoachColors.primary,
                borderRadius: CoachRadii.xl,
                paddingVertical: 22,
                paddingHorizontal: 12,
                alignItems: "center",
                gap: 8,
                opacity: pressed ? 0.94 : 1,
                ...CoachShadow.elevated,
              })}
            >
              <MaterialCommunityIcons name="upload-outline" size={32} color={CoachColors.onPrimary} />
              <Text style={{ fontSize: 15, fontWeight: "600", color: CoachColors.onPrimary }}>CV yükle</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate("Interviews", { screen: "InterviewHub" })}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: CoachColors.surfaceCard,
                borderRadius: CoachRadii.xl,
                borderWidth: 1,
                borderColor: CoachColors.outlineVariant,
                paddingVertical: 22,
                paddingHorizontal: 12,
                alignItems: "center",
                gap: 8,
                opacity: pressed ? 0.96 : 1,
                ...CoachShadow.card,
              })}
            >
              <MaterialCommunityIcons name="microphone-outline" size={32} color={CoachColors.primary} />
              <Text style={{ fontSize: 15, fontWeight: "600", color: CoachColors.primary }}>Mülakat pratiği</Text>
            </Pressable>
          </View>

          <ActiveJobsBanner navigation={navigation} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "600", color: CoachColors.primary }}>Son analizler</Text>
            <Pressable onPress={() => navigation.navigate("CvAnalysis", { screen: "CvAnalysisHome" })}>
              <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.secondary }}>Yeni analiz</Text>
            </Pressable>
          </View>

          <View style={{ gap: 12 }}>
            {isError ? (
              <Text style={{ textAlign: "center", color: CoachColors.onSurfaceVariant, padding: 24 }}>
                Veri yüklenemedi
              </Text>
            ) : apps.length === 0 ? (
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 32,
                  paddingHorizontal: 16,
                  backgroundColor: CoachColors.surfaceCard,
                  borderRadius: CoachRadii.xl,
                  borderWidth: 1,
                  borderColor: CoachColors.outlineVariant,
                  ...CoachShadow.card,
                }}
              >
                <MaterialCommunityIcons name="file-document-outline" size={44} color={CoachColors.slate300} />
                <Text style={{ fontSize: 15, color: CoachColors.onSurfaceVariant, marginTop: 12, textAlign: "center" }}>
                  Henüz analiz yok. CV yükleyerek başlayın.
                </Text>
                <Pressable
                  onPress={() => navigation.navigate("CvAnalysis", { screen: "CvAnalysisHome" })}
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    borderRadius: CoachRadii.lg,
                    backgroundColor: CoachColors.primary,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.onPrimary }}>CV analizi →</Text>
                </Pressable>
              </View>
            ) : (
              apps.slice(0, 10).map((a) => {
                const score = Math.round(a.alignment_score || 0);
                const strong = score >= 80;
                const openDetail = () => {
                  if (a.alignment_id) {
                    navigation.navigate("Reports", {
                      screen: "FeedbackReport",
                      params: { alignmentId: a.alignment_id, sessionId: null },
                    });
                  } else {
                    navigation.navigate("CvAnalysis", { screen: "CvAnalysisHome" });
                  }
                };
                return (
                  <View
                    key={a.profile_id + (a.company_name ?? "")}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 14,
                      padding: 16,
                      borderRadius: CoachRadii.xl,
                      borderWidth: 1,
                  borderColor: CoachColors.outlineVariant,
                  backgroundColor: CoachColors.surfaceCard,
                      ...CoachShadow.card,
                    }}
                  >
                    <Pressable
                      onPress={openDetail}
                      style={({ pressed }) => ({
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 14,
                        opacity: pressed ? 0.85 : 1,
                      })}
                    >
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: CoachRadii.md,
                          backgroundColor: CoachColors.surfaceContainerLow,
                          alignItems: "center",
                          justifyContent: "center",
                          borderWidth: 1,
                          borderColor: CoachColors.outlineVariant,
                        }}
                      >
                        <Text style={{ fontSize: 18, fontWeight: "700", color: CoachColors.secondary }}>
                          {(a.company_name || "?")[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "600", color: CoachColors.primary }}>
                          {a.company_name || "—"}
                        </Text>
                        <Text numberOfLines={2} style={{ fontSize: 14, color: CoachColors.onSurfaceVariant, marginTop: 2 }}>
                          {a.position || "—"}
                        </Text>
                      </View>
                    </Pressable>
                    <View style={{ alignItems: "flex-end", gap: 8 }}>
                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: CoachRadii.full,
                          backgroundColor: strong ? CoachColors.accentMuted : CoachColors.surfaceContainer,
                          borderWidth: 1,
                          borderColor: strong ? CoachColors.accent : CoachColors.outlineVariant,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: strong ? CoachColors.accent : CoachColors.onSurfaceVariant,
                          }}
                        >
                          %{score}
                        </Text>
                      </View>
                      <Pressable onPress={() => void openInterviewsFor(a)} hitSlop={8} style={{ padding: 4 }}>
                        <MaterialCommunityIcons name="microphone-outline" size={22} color={CoachColors.secondary} />
                      </Pressable>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function ActiveJobsBanner({ navigation }: { navigation: DashNav }) {
  const jobs = useAnalysisJobStore((s) => s.jobs);
  const removeJob = useAnalysisJobStore((s) => s.removeJob);

  if (jobs.length === 0) return null;

  return (
    <View style={{ gap: 10, marginBottom: 20 }}>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} navigation={navigation} onDismiss={() => removeJob(job.id)} />
      ))}
    </View>
  );
}

function JobCard({ job, navigation, onDismiss }: { job: AnalysisJob; navigation: DashNav; onDismiss: () => void }) {
  const isRunning = job.status === "running";
  const isDone = job.status === "done";
  const isErr = job.status === "error";

  const bgColor = isRunning
    ? "#FEF9C3"
    : isDone
      ? CoachColors.emerald50
      : CoachColors.errorContainer;

  const borderColor = isRunning
    ? "#F59E0B"
    : isDone
      ? CoachColors.emerald200
      : "rgba(186,26,26,0.3)";

  const statusText = isRunning
    ? "Analiz işleniyor…"
    : isDone
      ? "Analiz tamamlandı"
      : "Analiz başarısız";

  const handlePress = () => {
    if (!isDone || !job.result) return;
    usePipelineStore.getState().setAlignment(job.result.result_id, job.result);
    usePipelineStore.getState().hydrateFromApplication({
      cvId: job.cvId,
      profileId: job.profileId,
      alignmentId: job.result.result_id,
      companyName: job.companyName,
      positionTitle: job.positionTitle,
    });
    onDismiss();
    if (job.feedback) {
      navigation.navigate("Reports", {
        screen: "FeedbackReport",
        params: { alignmentId: job.result.result_id, sessionId: null },
      });
    } else {
      navigation.navigate("CvAnalysis", {
        screen: "AlignmentResult",
        params: { resultId: job.result.result_id },
      });
    }
  };

  return (
    <Pressable
      onPress={isDone ? handlePress : undefined}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
        borderRadius: CoachRadii.xl,
        backgroundColor: bgColor,
        borderWidth: 1,
        borderColor: borderColor,
      }}
    >
      {isRunning ? (
        <ActivityIndicator size="small" color="#D97706" />
      ) : (
        <MaterialCommunityIcons
          name={isDone ? "check-circle" : "alert-circle"}
          size={22}
          color={isDone ? CoachColors.emerald600 : "#B91C1C"}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.onSurface }}>
          {job.companyName} — {job.positionTitle}
        </Text>
        <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, marginTop: 2 }}>
          {isErr ? job.error : statusText}
        </Text>
      </View>
      {isDone ? (
        <Text style={{ fontSize: 12, fontWeight: "600", color: CoachColors.emerald600 }}>Görüntüle →</Text>
      ) : isErr ? (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={18} color={CoachColors.onSurfaceVariant} />
        </Pressable>
      ) : null}
    </Pressable>
  );
}
