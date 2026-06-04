import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Animated, Platform } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { getAlignmentById, listAlignments } from "../services/api";
import { computePotentialMatchScore } from "../analysis/growthPotential";
import { extendKeyTraits } from "../analysis/analysisKeyTraits";
import { usePipelineStore } from "../store/usePipelineStore";
import type { AnalyzeParamList } from "../app/navigationTypes";
import { AR, fontTight } from "../components/analysis/analysisResultTokens";
import { AnalysisCompanySummaryCard } from "../components/analysis/AnalysisCompanySummaryCard";
import { AnalysisSectionTriggerRow } from "../components/analysis/AnalysisSectionTriggerRow";
import { AnalysisCenterModal } from "../components/analysis/AnalysisCenterModal";
import { CoachAdviceModalBody } from "../components/analysis/CoachAdviceModalBody";
import { KeyTraitsModalBody } from "../components/analysis/KeyTraitsModalBody";
import { SkillsListModalBody } from "../components/analysis/SkillsListModalBody";

type Nav = NativeStackNavigationProp<AnalyzeParamList>;
type R = RouteProp<AnalyzeParamList, "AlignmentResult">;

type ActiveModal = "coach" | "traits" | "matched" | "missing" | null;

const SKEL_BASE = "#e2e8f0";
const SKEL_SHIMMER = "rgba(255,255,255,0.55)";

const skelStyles = StyleSheet.create({
  shimmerTrack: {
    overflow: "hidden",
  },
  shimmerHighlight: {
    ...StyleSheet.absoluteFillObject,
    width: "55%",
    backgroundColor: SKEL_SHIMMER,
  },
  titleGap: { marginTop: 10 },
  companyRow: { flexDirection: "row", marginTop: 16, gap: 14 },
  companyTextCol: { flex: 1, gap: 8 },
  cultureKickerGap: { marginTop: 20 },
  cultureBodyGap: { marginTop: 10 },
  trigCard: { paddingVertical: 16 },
  trigRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  trigTextCol: { flex: 1, gap: 8 },
});

function ShimmerBlock({
  w,
  h,
  r = 8,
  style,
}: {
  w: number | `${number}%`;
  h: number;
  r?: number;
  style?: object;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 1300, useNativeDriver: true }),
        Animated.timing(a, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [a]);
  const tx = a.interpolate({ inputRange: [0, 1], outputRange: [-100, 100] });
  return (
    <View
      style={[
        skelStyles.shimmerTrack,
        { width: w, height: h, borderRadius: r, backgroundColor: SKEL_BASE },
        style,
      ]}
    >
      <Animated.View style={[skelStyles.shimmerHighlight, { transform: [{ translateX: tx }] }]} />
    </View>
  );
}

function SkelScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={onBack}
          android_ripple={{ color: "rgba(15,23,42,0.08)" }}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={AR.slate700} />
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={[styles.scrollPad, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <ShimmerBlock w="70%" h={22} r={6} />
          <ShimmerBlock w="100%" h={14} r={4} style={skelStyles.titleGap} />
        </View>
        <View style={[styles.card, styles.skelWrap]}>
          <ShimmerBlock w={80} h={10} r={4} />
          <View style={skelStyles.companyRow}>
            <ShimmerBlock w={72} h={72} r={16} />
            <View style={skelStyles.companyTextCol}>
              <ShimmerBlock w="85%" h={20} r={6} />
              <ShimmerBlock w="50%" h={14} r={4} />
            </View>
          </View>
          <ShimmerBlock w={100} h={10} r={4} style={skelStyles.cultureKickerGap} />
          <ShimmerBlock w="100%" h={48} r={8} style={skelStyles.cultureBodyGap} />
        </View>
        {[1, 2, 3, 4].map((i) => (
          <View key={`trig-${i}`} style={[styles.card, styles.skelWrap, skelStyles.trigCard]}>
            <View style={skelStyles.trigRow}>
              <ShimmerBlock w={44} h={44} r={12} />
              <View style={skelStyles.trigTextCol}>
                <ShimmerBlock w="55%" h={14} r={4} />
                <ShimmerBlock w="80%" h={12} r={4} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function AlignmentResultScreen() {
  const queryClient = useQueryClient();
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const insets = useSafeAreaInsets();
  const companyName = usePipelineStore((s) => s.companyName);
  const positionTitle = usePipelineStore((s) => s.positionTitle);
  const cultureSummary = usePipelineStore((s) => s.cultureSummary);
  const keyTraits = usePipelineStore((s) => s.keyTraits);
  const industry = usePipelineStore((s) => s.industry);
  const alignment = usePipelineStore((s) => s.alignment);
  const alignmentId = usePipelineStore((s) => s.alignmentId);
  const resultId = route.params?.resultId;
  const storeMatchesResult = !!resultId && alignment?.result_id === resultId;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalKind, setModalKind] = useState<ActiveModal>(null);

  useEffect(() => {
    if (modalOpen || !modalKind) return;
    if (Platform.OS === "ios") return;
    const t = setTimeout(() => setModalKind(null), 400);
    return () => clearTimeout(t);
  }, [modalOpen, modalKind]);

  const detailQuery = useQuery({
    queryKey: ["alignment-detail", resultId],
    queryFn: () => getAlignmentById(resultId!),
    enabled: !!resultId,
  });

  const listQuery = useQuery({
    queryKey: ["alignment-list"],
    queryFn: () => listAlignments(50),
    enabled: !!resultId && !storeMatchesResult,
  });

  const listItem = useMemo(() => {
    if (!resultId) return null;
    return (listQuery.data?.items ?? []).find((x) => x.id === resultId) ?? null;
  }, [listQuery.data, resultId]);

  useEffect(() => {
    if (!resultId || !listItem) return;
    usePipelineStore.getState().hydrateFromApplication({
      cvId: listItem.cv_id,
      profileId: listItem.profile_id,
      alignmentId: resultId,
      companyName: listItem.company_name,
      positionTitle: listItem.target_position,
    });
  }, [resultId, listItem]);

  useEffect(() => {
    const d = detailQuery.data;
    if (!resultId || !d || d.result_id !== resultId) return;
    usePipelineStore.getState().setAlignment(resultId, d);
    queryClient.invalidateQueries({ queryKey: ["alignment-list"] });
  }, [detailQuery.data, resultId, queryClient]);

  const payload = useMemo(() => {
    if (!resultId) return alignment;
    const d = detailQuery.data;
    if (d?.result_id === resultId) return d;
    if (alignment?.result_id === resultId) return alignment;
    return null;
  }, [resultId, detailQuery.data, alignment]);

  const scoreNum = Math.round(Number(payload?.score_percent ?? listItem?.score ?? 0)) || 0;
  const titleCompany = payload?.company_name ?? listItem?.company_name ?? companyName ?? "";
  const titlePos = payload?.position ?? listItem?.target_position ?? positionTitle ?? "";
  const effectiveAlignmentId = alignmentId ?? resultId ?? "";
  const missingUi = payload?.missing_skills_ui ?? [];
  const { potential: coachPotential } = computePotentialMatchScore(scoreNum, missingUi);
  const coachSubtitle =
    coachPotential > scoreNum ? `%${scoreNum} · Hedef %${coachPotential}` : `%${scoreNum} · Eşleşme`;

  const profileChips = useMemo(
    () => extendKeyTraits(payload?.key_traits ?? keyTraits),
    [payload?.key_traits, keyTraits],
  );

  const matchedUi = payload?.matched_skills_ui ?? [];

  const cultureBody =
    payload?.culture_summary?.trim() ||
    cultureSummary?.trim() ||
    "Bu kayıt için şirket kültürü özeti henüz bağlı değil. Yeni bir analiz akışı tamamladığınızda burada görünür.";

  const isLoading =
    !!resultId &&
    !payload &&
    !detailQuery.isError &&
    (detailQuery.isPending || (!storeMatchesResult && listQuery.isPending));

  const showDetailError = !!resultId && detailQuery.isError && !payload;

  const modalTitle =
    modalKind === "coach"
      ? "CoachAI tavsiyesi"
      : modalKind === "traits"
        ? "Aranan profil"
        : modalKind === "matched"
          ? "Eşleşen yetenekler"
          : modalKind === "missing"
            ? "Eksik / geliştirilebilir"
            : "";

  if (isLoading) {
    return <SkelScreen onBack={() => navigation.goBack()} />;
  }

  if (showDetailError) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingHorizontal: 20 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          android_ripple={{ color: "rgba(15,23,42,0.08)" }}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={AR.slate700} />
        </Pressable>
        <Text style={[styles.h1, fontTight, { marginTop: 24 }]}>Sonuç yüklenemedi</Text>
        <Text style={[styles.subtitle, { marginTop: 12 }]}>
          Bu hizalama kaydına erişilemedi veya bulunamadı. Listeden tekrar deneyin.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + 6 }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          android_ripple={{ color: "rgba(15,23,42,0.08)" }}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={12}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={AR.slate700} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollPad, { paddingBottom: insets.bottom + 112 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.pageHeader}>
          <Text style={[styles.h1, fontTight]}>Şirket eşleşme analizi</Text>
          <Text style={styles.subtitle}>
            Profilinizin şirketin teknik ve kültürel beklentileriyle ne kadar örtüştüğü.
          </Text>
        </View>

        <AnalysisCompanySummaryCard
          companyName={titleCompany}
          positionTitle={titlePos}
          industry={industry ?? "Technology"}
          cultureBody={cultureBody}
        />

        <AnalysisSectionTriggerRow
          variant="coach"
          title="CoachAI tavsiyesi"
          subtitle={coachSubtitle}
          onPress={() => {
            setModalKind("coach");
            setModalOpen(true);
          }}
        />
        <AnalysisSectionTriggerRow
          variant="traits"
          title="Aranan profil"
          subtitle={
            profileChips.length > 0 ? `${profileChips.length} özet madde` : "Profil beklentileri ve kriterler"
          }
          onPress={() => {
            setModalKind("traits");
            setModalOpen(true);
          }}
        />
        <AnalysisSectionTriggerRow
          variant="matched"
          title="Eşleşen yetenekler"
          subtitle={
            matchedUi.length > 0 ? `${matchedUi.length} yetenek · detay için dokunun` : "Liste bu kayıtta boş olabilir"
          }
          onPress={() => {
            setModalKind("matched");
            setModalOpen(true);
          }}
        />
        <AnalysisSectionTriggerRow
          variant="missing"
          title="Eksik / geliştirilebilir"
          subtitle={
            missingUi.length > 0
              ? `${missingUi.length} alan · detay için dokunun`
              : "Liste bu kayıtta boş olabilir"
          }
          onPress={() => {
            setModalKind("missing");
            setModalOpen(true);
          }}
        />

        <Pressable
          onPress={() => navigation.getParent()?.navigate("Reports", { screen: "ReportsHub" })}
          android_ripple={{ color: "rgba(56, 95, 140, 0.12)" }}
          style={({ pressed }) => [styles.linkRow, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="file-chart-outline" size={20} color={AR.indigo600} />
          <Text style={styles.linkText}>Sınav raporları</Text>
        </Pressable>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        <Pressable
          onPress={() => navigation.getParent()?.navigate("Interviews", { screen: "InterviewHub" })}
          android_ripple={{ color: "rgba(255,255,255,0.25)" }}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <MaterialCommunityIcons name="microphone" size={22} color={AR.white} />
          <Text style={styles.ctaText}>Mülakata geç</Text>
        </Pressable>
      </View>

      <AnalysisCenterModal
        visible={modalOpen}
        title={modalTitle}
        onClose={() => setModalOpen(false)}
        onDismiss={() => setModalKind(null)}
      >
        {modalKind === "coach" ? (
          <CoachAdviceModalBody
            visible={modalOpen && modalKind === "coach"}
            scorePercent={scoreNum}
            advice={payload?.advice}
            missingSkillsUi={missingUi}
            S={payload?.S}
            E={payload?.E}
            D={payload?.D}
          />
        ) : null}
        {modalKind === "traits" ? <KeyTraitsModalBody chips={profileChips} /> : null}
        {modalKind === "matched" ? <SkillsListModalBody variant="matched" items={matchedUi} /> : null}
        {modalKind === "missing" ? <SkillsListModalBody variant="missing" items={missingUi} /> : null}
      </AnalysisCenterModal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: AR.bg,
  },
  topBar: {
    paddingHorizontal: 8,
    paddingBottom: 4,
    backgroundColor: AR.bg,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  pressed: {
    opacity: Platform.OS === "ios" ? 0.85 : 1,
    transform: [{ scale: Platform.OS === "android" ? 0.98 : 1 }],
  },
  scrollPad: {
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  pageHeader: {
    width: "100%",
    marginBottom: 18,
  },
  h1: {
    fontSize: Platform.OS === "ios" ? 19 : 18,
    fontWeight: "600",
    color: AR.slate900,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: AR.slate500,
    letterSpacing: -0.2,
  },
  card: {
    width: "100%",
    backgroundColor: AR.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(226, 232, 240, 0.9)",
    padding: 24,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 2 },
    }),
  },
  skelWrap: {
    overflow: "hidden",
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: AR.slate700,
    letterSpacing: -0.2,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "600",
    color: AR.indigo600,
    textDecorationLine: "underline",
    letterSpacing: -0.2,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: AR.bg,
    borderTopWidth: 1,
    borderTopColor: AR.slate200,
  },
  cta: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: AR.indigo600,
    paddingVertical: 14,
    borderRadius: 14,
  },
  ctaPressed: {
    opacity: 0.92,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700",
    color: AR.white,
    letterSpacing: -0.2,
  },
});
