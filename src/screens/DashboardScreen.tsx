import { useMemo, useState } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  useWindowDimensions,
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
import type { MainTabParamList, AnalyzeParamList } from "../app/navigationTypes";
import { CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";
import { useAuthStore } from "../store/useAuthStore";

type DashNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  NativeStackNavigationProp<AnalyzeParamList>
>;

function StatCard(props: {
  label: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  blurTint: string;
  value: string;
}) {
  return (
    <View
      style={{
        backgroundColor: CoachColors.surfaceContainerLowest,
        borderRadius: CoachRadii.xl,
        borderWidth: 1,
        borderColor: CoachColors.slate100,
        padding: 24,
        flex: 1,
        minWidth: 140,
        overflow: "hidden",
        ...CoachShadow.card,
      }}
    >
      <View
        style={{
          position: "absolute",
          top: -32,
          right: -32,
          width: 128,
          height: 128,
          borderRadius: 64,
          backgroundColor: props.blurTint,
          opacity: 0.35,
        }}
      />
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: "500", color: CoachColors.onSurfaceVariant, textTransform: "uppercase" }}>
          {props.label}
        </Text>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: props.iconBg,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MaterialCommunityIcons name={props.icon as "file-document-outline"} size={20} color={props.iconColor} />
        </View>
      </View>
      <Text style={{ fontSize: 36, fontWeight: "700", color: CoachColors.onSurface, marginTop: 12, zIndex: 1 }}>
        {props.value}
      </Text>
    </View>
  );
}

function QuickRow(props: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderRadius: CoachRadii.xl,
        borderWidth: 1,
        borderColor: CoachColors.outlineVariant,
        backgroundColor: pressed ? CoachColors.surfaceContainerLow : "transparent",
      })}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: CoachRadii.md,
          backgroundColor: CoachColors.surfaceContainer,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons name={props.icon as "file-document-outline"} size={22} color={CoachColors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: CoachColors.onSurface }}>{props.title}</Text>
        <Text style={{ fontSize: 12, color: CoachColors.onSurfaceVariant, marginTop: 2 }}>{props.subtitle}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={CoachColors.outline} />
    </Pressable>
  );
}

export function DashboardScreen() {
  const navigation = useNavigation<DashNav>();
  const user = useAuthStore((s) => s.user);
  const { width } = useWindowDimensions();
  const isWide = width >= 720;
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

  const chartItems = useMemo(() => {
    return (data?.applications ?? []).filter((a) => a.alignment_score != null).slice(0, 8);
  }, [data]);

  const avgScore = useMemo(() => {
    const scored = (data?.applications ?? []).filter((a) => a.alignment_score != null);
    if (scored.length === 0) return 0;
    const sum = scored.reduce((acc, a) => acc + (a.alignment_score || 0), 0);
    return Math.round(sum / scored.length);
  }, [data]);

  const bestScore = useMemo(() => {
    let best: number | null = null;
    for (const a of data?.applications ?? []) {
      if (a.classic_best != null && (best == null || a.classic_best > best)) best = a.classic_best;
      if (a.quiz_best != null && (best == null || a.quiz_best > best)) best = a.quiz_best;
    }
    return best;
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

  const statCv = data?.cv_count != null ? String(data.cv_count) : "—";
  const statAvg = avgScore ? `%${avgScore}` : "—";
  const statInterview = data?.interview_count != null ? String(data.interview_count) : "—";
  const statBest = bestScore != null ? String(bestScore) : "—";

  return (
    <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
      <CoachHeader searchValue={q} onSearchChange={setQ} />
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={CoachColors.primaryContainer} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <Text style={{ fontSize: 36, fontWeight: "700", color: CoachColors.onSurface, marginBottom: 4 }}>
            Hoş Geldin, {welcomeName}!
          </Text>
          <Text style={{ fontSize: 18, lineHeight: 28, color: CoachColors.onSurfaceVariant, marginBottom: 32 }}>
            İşte genel durumun ve son analizlerin.
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 16,
              marginBottom: 24,
            }}
          >
            <StatCard
              label="Yüklenen CV"
              icon="file-document-outline"
              iconBg={CoachColors.primaryFixed}
              iconColor={CoachColors.primary}
              blurTint={CoachColors.primary}
              value={isError ? "—" : statCv}
            />
            <StatCard
              label="Ort. Eşleşme"
              icon="percent"
              iconBg={CoachColors.emerald50}
              iconColor={CoachColors.emerald600}
              blurTint="#10b981"
              value={isError ? "—" : statAvg}
            />
            <StatCard
              label="Tamamlanan Mülakat"
              icon="check-circle-outline"
              iconBg={CoachColors.surfaceVariant}
              iconColor={CoachColors.secondary}
              blurTint={CoachColors.slate500}
              value={isError ? "—" : statInterview}
            />
            <StatCard
              label="En Yüksek Skor"
              icon="trophy-outline"
              iconBg={CoachColors.amber50}
              iconColor={CoachColors.amber600}
              blurTint={CoachColors.amber400}
              value={isError ? "—" : statBest}
            />
          </View>

          <View style={{ flexDirection: isWide ? "row" : "column", gap: 16, marginBottom: 24 }}>
            <View
              style={{
                flex: isWide ? 3 : undefined,
                backgroundColor: CoachColors.surfaceContainerLowest,
                borderRadius: CoachRadii.xl,
                borderWidth: 1,
                borderColor: CoachColors.slate100,
                padding: 24,
                minHeight: 240,
                ...CoachShadow.card,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface, marginBottom: 20 }}>
                Şirket Bazında Hazırlık
              </Text>
              {chartItems.length === 0 ? (
                <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 24, gap: 12 }}>
                  <MaterialCommunityIcons name="chart-bar" size={48} color={CoachColors.slate300} />
                  <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>Henüz analiziniz yok</Text>
                  <Pressable
                    onPress={() => navigation.navigate("CvAnalysis", { screen: "CvAnalysisHome" })}
                    style={{
                      borderWidth: 1,
                      borderColor: "rgba(53,37,205,0.3)",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: CoachRadii.lg,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: CoachColors.primary }}>CV Yükle ve Başla →</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "flex-end", height: 160, gap: 10, paddingHorizontal: 8 }}>
                  {chartItems.map((a) => {
                    const pct = Math.round(a.alignment_score || 0);
                    const h = Math.max(4, pct);
                    const color =
                      pct >= 80 ? CoachColors.emerald400 : pct >= 60 ? CoachColors.indigo400 : CoachColors.amber400;
                    const company = (a.company_name || "—").slice(0, 8);
                    const barH = Math.max(8, Math.round((h / 100) * 120));
                    return (
                      <View key={a.profile_id + company} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                        <Text style={{ fontSize: 10, fontWeight: "600", color: CoachColors.primary }}>{pct}%</Text>
                        <View
                          style={{
                            width: "100%",
                            height: barH,
                            backgroundColor: color,
                            borderTopLeftRadius: CoachRadii.md,
                            borderTopRightRadius: CoachRadii.md,
                          }}
                        />
                        <Text
                          numberOfLines={1}
                          style={{ fontSize: 10, color: CoachColors.onSurfaceVariant, textAlign: "center", width: "100%" }}
                        >
                          {company}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <View
              style={{
                flex: isWide ? 2 : undefined,
                backgroundColor: CoachColors.surfaceContainerLowest,
                borderRadius: CoachRadii.xl,
                borderWidth: 1,
                borderColor: CoachColors.slate100,
                padding: 24,
                ...CoachShadow.card,
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface, marginBottom: 20 }}>
                Hızlı Erişim
              </Text>
              <View style={{ gap: 12 }}>
                <QuickRow
                  icon="file-document-outline"
                  title="Yeni CV Analizi"
                  subtitle="CV yükle ve şirketle eşleştir"
                  onPress={() => navigation.navigate("CvAnalysis", { screen: "CvAnalysisHome" })}
                />
                <QuickRow
                  icon="microphone-message"
                  title="Mülakat Başlat"
                  subtitle="Klasik sınav veya quiz"
                  onPress={() => navigation.navigate("Interviews", { screen: "InterviewHub" })}
                />
                <QuickRow
                  icon="chart-box-outline"
                  title="CV Doktoru"
                  subtitle="Kişisel geri bildirim al"
                  onPress={() => navigation.navigate("Reports", { screen: "ReportsHub" })}
                />
              </View>
            </View>
          </View>

          <View
            style={{
              backgroundColor: CoachColors.surfaceContainerLowest,
              borderRadius: CoachRadii.xl,
              borderWidth: 1,
              borderColor: CoachColors.slate100,
              overflow: "hidden",
              ...CoachShadow.card,
            }}
          >
            <View
              style={{
                padding: 24,
                borderBottomWidth: 1,
                borderBottomColor: CoachColors.slate100,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface }}>Son Analizler</Text>
              <Pressable onPress={() => navigation.navigate("CvAnalysis", { screen: "CvAnalysisHome" })}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.primary }}>Yeni Analiz</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ minWidth: width - 48 }}>
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: CoachColors.surfaceContainerLowest,
                    borderBottomWidth: 1,
                    borderBottomColor: CoachColors.slate100,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    gap: 8,
                  }}
                >
                  <Text style={{ width: 120, fontSize: 12, fontWeight: "500", color: CoachColors.onSurfaceVariant }}>
                    ŞİRKET
                  </Text>
                  <Text style={{ width: 120, fontSize: 12, fontWeight: "500", color: CoachColors.onSurfaceVariant }}>
                    POZİSYON
                  </Text>
                  <Text style={{ width: 72, fontSize: 12, fontWeight: "500", color: CoachColors.onSurfaceVariant }}>
                    EŞLEŞME
                  </Text>
                  <Text style={{ width: 100, fontSize: 12, fontWeight: "500", color: CoachColors.onSurfaceVariant }}>
                    RİSK
                  </Text>
                  <Text
                    style={{
                      flex: 1,
                      minWidth: 72,
                      fontSize: 12,
                      fontWeight: "500",
                      color: CoachColors.onSurfaceVariant,
                      textAlign: "right",
                    }}
                  >
                    EYLEM
                  </Text>
                </View>
                {isError ? (
                  <Text style={{ padding: 32, textAlign: "center", color: CoachColors.onSurfaceVariant }}>
                    Veri yüklenemedi
                  </Text>
                ) : apps.length === 0 ? (
                  <View style={{ padding: 32, alignItems: "center", gap: 12 }}>
                    <MaterialCommunityIcons name="chart-bar" size={48} color={CoachColors.slate300} />
                    <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>Henüz analiziniz yok</Text>
                    <Pressable
                      onPress={() => navigation.navigate("CvAnalysis", { screen: "CvAnalysisHome" })}
                      style={{
                        borderWidth: 1,
                        borderColor: "rgba(53,37,205,0.3)",
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: CoachRadii.lg,
                      }}
                    >
                      <Text style={{ fontSize: 14, color: CoachColors.primary }}>CV Yükle ve Başla →</Text>
                    </Pressable>
                  </View>
                ) : (
                  apps.slice(0, 10).map((a) => {
                    const score = Math.round(a.alignment_score || 0);
                    const risk =
                      score >= 80 ? "Düşük Risk" : score >= 60 ? "Orta Risk" : a.alignment_score == null ? "—" : "Yüksek Risk";
                    const riskColor =
                      score >= 80 ? CoachColors.emerald600 : score >= 60 ? CoachColors.amber600 : CoachColors.red600;
                    const pillBg =
                      score >= 80
                        ? CoachColors.emerald50
                        : score >= 60
                          ? CoachColors.amber50
                          : CoachColors.red50;
                    const pillBorder =
                      score >= 80 ? CoachColors.emerald200 : score >= 60 ? CoachColors.amber400 : CoachColors.red200;
                    const pillText =
                      score >= 80 ? CoachColors.emerald700 : score >= 60 ? CoachColors.amber700 : CoachColors.red700;
                    return (
                      <View
                        key={a.profile_id}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingVertical: 14,
                          paddingHorizontal: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: CoachColors.slate100,
                          gap: 8,
                        }}
                      >
                        <Text style={{ width: 120, fontWeight: "500", fontSize: 15, color: CoachColors.onSurface }} numberOfLines={1}>
                          {a.company_name || "—"}
                        </Text>
                        <Text
                          style={{ width: 120, fontSize: 14, color: CoachColors.onSurfaceVariant }}
                          numberOfLines={2}
                        >
                          {a.position || "—"}
                        </Text>
                        <View style={{ width: 72 }}>
                          <View
                            style={{
                              alignSelf: "flex-start",
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: CoachRadii.full,
                              borderWidth: 1,
                              borderColor: pillBorder,
                              backgroundColor: pillBg,
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: "600", color: pillText }}>%{score}</Text>
                          </View>
                        </View>
                        <Text style={{ width: 100, fontSize: 12, fontWeight: "500", color: riskColor }}>{risk}</Text>
                        <View style={{ flex: 1, minWidth: 72, alignItems: "flex-end", flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                          <Pressable
                            onPress={() => {
                              if (a.alignment_id) {
                                navigation.navigate("CvAnalysis", {
                                  screen: "AlignmentResult",
                                  params: { resultId: a.alignment_id },
                                });
                              } else {
                                navigation.navigate("CvAnalysis", { screen: "CvAnalysisHome" });
                              }
                            }}
                            style={{
                              borderWidth: 1,
                              borderColor: CoachColors.slate200,
                              paddingHorizontal: 12,
                              paddingVertical: 6,
                              borderRadius: CoachRadii.lg,
                            }}
                          >
                            <Text style={{ fontSize: 14, color: CoachColors.slate500 }}>Detay</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => void openInterviewsFor(a)}
                            style={{
                              paddingHorizontal: 10,
                              paddingVertical: 6,
                              borderRadius: CoachRadii.lg,
                              backgroundColor: CoachColors.surfaceContainerLow,
                            }}
                          >
                            <MaterialCommunityIcons name="microphone-message" size={18} color={CoachColors.primary} />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
