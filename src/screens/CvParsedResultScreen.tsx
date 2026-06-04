import { useQuery, useQueryClient } from "@tanstack/react-query";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, ActivityIndicator, Button } from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { getCvById, type CvAnalysisResponse } from "../services/api";
import { extractDetail } from "../services/apiClient";
import type { AnalyzeParamList } from "../app/navigationTypes";
import { CoachScreenBar } from "../components/chrome/CoachScreenBar";
import { CoachColors, CoachRadii } from "../theme/coachTheme";
import { normalizeParsedData } from "../utils/cvAnalysisHelpers";
import { usePipelineStore } from "../store/usePipelineStore";

type Route = RouteProp<AnalyzeParamList, "CvParsedResult">;
type Nav = NativeStackNavigationProp<AnalyzeParamList>;

export function CvParsedResultScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const cvId = route.params?.cvId ?? "";
  const qc = useQueryClient();
  const setCv = usePipelineStore((s) => s.setCv);

  const q = useQuery({
    queryKey: ["cv-analysis", cvId],
    queryFn: () => getCvById(cvId),
    enabled: !!cvId,
    initialData: () => qc.getQueryData<CvAnalysisResponse | null>(["cv-analysis", cvId]) ?? undefined,
    staleTime: route.params?.fromUpload ? 60_000 : 0,
  });

  const record = q.data;
  const pd = record ? normalizeParsedData(record.parsed_data) : null;
  const skills = pd?.skills ?? [];
  const summary = (pd?.summary ?? "").trim();
  const matchLogic = (pd?.match_score_logic ?? "").trim();

  return (
    <View style={styles.flex}>
      <CoachScreenBar title="CV Analiz Sonucu" onBack={() => navigation.goBack()} />

      {q.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={CoachColors.secondary} />
          <Text style={styles.loadingLabel}>Analiz verileri yükleniyor…</Text>
        </View>
      ) : null}

      {q.isError ? (
        <View style={styles.errPad}>
          <Text style={styles.errText}>{extractDetail(q.error)}</Text>
        </View>
      ) : null}

      {record && pd ? (
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.card}>
            <Text style={styles.fileTitle}>{record.file_name}</Text>
            {record.analyzed_at ? (
              <Text style={styles.meta}>Kayıtlı analiz · {new Date(record.analyzed_at).toLocaleDateString("tr-TR")}</Text>
            ) : (
              <Text style={styles.meta}>Veritabanından yüklendi (Gemini atlandı)</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Tespit edilen yetenekler</Text>
            {skills.length > 0 ? (
              skills.map((s) => (
                <Text key={s} style={styles.bullet}>
                  • {s}
                </Text>
              ))
            ) : (
              <Text style={styles.muted}>Yetenek tespit edilemedi</Text>
            )}
          </View>

          {summary ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Yapay zeka özeti</Text>
              <Text style={styles.body}>{summary}</Text>
            </View>
          ) : null}

          {matchLogic ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Kısa değerlendirme</Text>
              <Text style={styles.bodyMuted}>{matchLogic}</Text>
            </View>
          ) : null}

          <Button
            mode="contained"
            icon="arrow-right"
            onPress={() => {
              setCv(cvId, record.file_name);
              navigation.navigate("CvAnalysisHome");
            }}
            buttonColor={CoachColors.primary}
            textColor={CoachColors.onPrimary}
            style={{ borderRadius: CoachRadii.md }}
          >
            Şirket eşleşmesine devam et
          </Button>
        </ScrollView>
      ) : null}

      {!q.isLoading && !q.isError && !record ? (
        <View style={styles.errPad}>
          <Text style={styles.errText}>Bu CV için kayıtlı analiz bulunamadı.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CoachColors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingLabel: { fontSize: 15, color: CoachColors.onSurfaceVariant },
  scroll: { padding: 24, paddingBottom: 120, gap: 16 },
  card: {
    backgroundColor: CoachColors.surfaceContainerLowest,
    borderRadius: CoachRadii.xl,
    borderWidth: 1,
    borderColor: CoachColors.outlineVariant,
    padding: 20,
  },
  fileTitle: { fontSize: 20, fontWeight: "600", color: CoachColors.onSurface },
  meta: { marginTop: 6, fontSize: 13, color: CoachColors.onSurfaceVariant },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: CoachColors.onSurface, marginBottom: 10 },
  bullet: { fontSize: 14, color: CoachColors.onSurface, marginBottom: 4 },
  body: { fontSize: 15, lineHeight: 22, color: CoachColors.onSurface },
  bodyMuted: { fontSize: 14, lineHeight: 20, color: CoachColors.onSurfaceVariant },
  muted: { fontSize: 14, color: CoachColors.onSurfaceVariant },
  errPad: { padding: 24 },
  errText: { fontSize: 14, color: CoachColors.onErrorContainer },
});
