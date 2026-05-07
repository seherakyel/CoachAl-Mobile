import { useMemo, useState } from "react";
import { View, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Appbar, Button, Card, Searchbar, Text } from "react-native-paper";
import { getDashboardSummary, listAlignments } from "../services/api";
import { MetricRow } from "../components/MetricRow";
import { ApplicationCard } from "../components/ApplicationCard";
import { RiskBadge } from "../components/RiskBadge";
import { formatScore, formatDash } from "../utils/format";
import { emailLogout } from "../services/firebaseAuth";
import { usePipelineStore } from "../store/usePipelineStore";
import type { MainTabParamList, AnalyzeParamList } from "../app/navigationTypes";

type DashNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, "Home">,
  NativeStackNavigationProp<AnalyzeParamList>
>;

export function DashboardScreen() {
  const navigation = useNavigation<DashNav>();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading, refetch, isRefetching } = useQuery({
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

  const openInterviewsFor = async (appItem: (typeof apps)[number]) => {
    try {
      const list = await listAlignments(80);
      const candidates = list.items.filter((x) => x.profile_id === appItem.profile_id);
      const sorted = [...candidates].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      const pick = sorted[0];
      const recent = data?.recent_alignments?.find(
        (r) => r.profile_id === appItem.profile_id && r.alignment_id === (appItem.alignment_id ?? "")
      );
      const cvId = recent?.cv_id ?? pick?.cv_id ?? "";
      const alignmentId = appItem.alignment_id ?? pick?.id ?? null;
      usePipelineStore.getState().hydrateFromApplication({
        cvId,
        profileId: appItem.profile_id,
        alignmentId,
        companyName: appItem.company_name,
        positionTitle: appItem.position,
      });
      navigation.navigate("Mulakat", { screen: "InterviewHub" });
    } catch {
      usePipelineStore.getState().hydrateFromApplication({
        cvId: "",
        profileId: appItem.profile_id,
        alignmentId: appItem.alignment_id,
        companyName: appItem.company_name,
        positionTitle: appItem.position,
      });
      navigation.navigate("Mulakat", { screen: "InterviewHub" });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header elevated>
        <Appbar.Content title="Panel" />
        <Appbar.Action
          icon="refresh"
          onPress={() => {
            refetch();
          }}
        />
        <Appbar.Action
          icon="logout"
          onPress={async () => {
            await emailLogout();
            qc.clear();
          }}
        />
      </Appbar.Header>
      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 12, paddingBottom: 96 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        >
          <MetricRow
            cvCount={data?.cv_count ?? 0}
            companyCount={data?.company_count ?? 0}
            interviewCount={data?.interview_count ?? 0}
            loading={false}
          />
          <View style={{ height: 12 }} />
          <Button
            mode="contained"
            icon="chart-timeline-variant"
            onPress={() => navigation.navigate("Analiz", { screen: "CvUpload" })}
          >
            Analiz başlat
          </Button>
          <View style={{ height: 12 }} />
          <Searchbar placeholder="Başvurularda ara" value={q} onChangeText={setQ} />
          <View style={{ height: 12 }} />
          <Text variant="titleMedium" style={{ fontWeight: "700" }}>
            Başvurular
          </Text>
          <View style={{ height: 8 }} />
          {apps.length === 0 ? (
            <Card mode="outlined">
              <Card.Content>
                <Text variant="bodyMedium">
                  Henüz kayıtlı başvuru görünmüyor. Analiz başlatarak oluşturabilirsiniz.
                </Text>
              </Card.Content>
            </Card>
          ) : (
            apps.map((item) => (
              <ApplicationCard
                key={item.profile_id}
                companyName={item.company_name}
                position={item.position}
                alignmentScore={item.alignment_score}
                riskLevel={item.risk_level}
                classicBest={item.classic_best}
                quizBest={item.quiz_best}
                onOpenInterviews={() => {
                  void openInterviewsFor(item);
                }}
              />
            ))
          )}
          <View style={{ height: 18 }} />
          <Text variant="titleMedium" style={{ fontWeight: "700", marginBottom: 8 }}>
            Son hizalamalar
          </Text>
          {(data?.recent_alignments ?? []).length === 0 ? (
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              Kayıt yok
            </Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {(data?.recent_alignments ?? []).map((r) => (
                  <Card key={r.alignment_id} mode="outlined" style={{ width: 220 }}>
                    <Card.Content>
                      <Text variant="titleSmall" style={{ fontWeight: "700" }}>
                        {formatScore(r.score)}
                      </Text>
                      <View style={{ marginTop: 6 }}>
                        <RiskBadge level={r.risk_level} />
                      </View>
                      <Text variant="bodySmall" style={{ marginTop: 8, opacity: 0.75 }} numberOfLines={2}>
                        {formatDash(r.alignment_id)}
                      </Text>
                    </Card.Content>
                  </Card>
                ))}
              </View>
            </ScrollView>
          )}
        </ScrollView>
      )}
    </View>
  );
}
