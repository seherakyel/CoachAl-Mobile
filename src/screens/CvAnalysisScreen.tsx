import { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from "@react-native-documents/picker";
import { Appbar, Button, Snackbar, Text, TextInput } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { CompanyAutocomplete } from "../components/CompanyAutocomplete";
import { analyzeCompany, uploadCvPdf, type CompanySearchItem, type UploadProgress } from "../services/api";
import { extractDetail } from "../services/apiClient";
import {
  CV_LIST_QUERY_KEY,
  applyCvSelection,
  cacheCvFromUpload,
  cvAnalysisQueryKey,
  fetchCvDetail,
  fetchCvListWithMeta,
  formatCvListItemSubtitle,
  getMaxCvsFromList,
  isAtCvLimit,
  loadPersistedCvId,
} from "../services/cvDocuments";
import { coachToast } from "../components/coach/CoachDialogs";
import { normalizeParsedData } from "../utils/cvAnalysisHelpers";
import { usePipelineStore } from "../store/usePipelineStore";
import { useAnalysisJobStore } from "../store/useAnalysisJobStore";
import type { AnalyzeParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<AnalyzeParamList>;
type CvRoute = RouteProp<AnalyzeParamList, "CvAnalysisHome">;

const PHASE_LABELS: Record<UploadProgress, string> = {
  uploading: "PDF sunucuya gönderiliyor…",
  processing: "CV analiz ediliyor…",
  finalizing: "Sonuçlar hazırlanıyor…",
};

export function CvAnalysisScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<CvRoute>();
  const qc = useQueryClient();
  const setCv = usePipelineStore((s) => s.setCv);
  const setCompanyProfile = usePipelineStore((s) => s.setCompany);
  const storeCvId = usePipelineStore((s) => s.cvId);

  const [snack, setSnack] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [cvId, setCvIdLocal] = useState<string | null>(storeCvId);
  const [fileName, setFileName] = useState<string | null>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [matchLogic, setMatchLogic] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadProgress>("uploading");
  const [showUploadOk, setShowUploadOk] = useState(false);
  const [step2Unlocked, setStep2Unlocked] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanySearchItem | null>(null);
  const [positionTitle, setPositionTitle] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const [selectingCv, setSelectingCv] = useState(false);

  const cvListQuery = useQuery({
    queryKey: CV_LIST_QUERY_KEY,
    queryFn: fetchCvListWithMeta,
  });
  const listMeta = cvListQuery.data ?? { items: [], cv_count: 0, max_cvs: 3 };
  const savedCvs = listMeta.items;
  const maxCvs = getMaxCvsFromList(listMeta);

  useFocusEffect(
    useCallback(() => {
      void cvListQuery.refetch();
    }, [cvListQuery.refetch]),
  );

  const applyCachedCvToUi = useCallback((cached: NonNullable<Awaited<ReturnType<typeof fetchCvDetail>>>) => {
    const pd = normalizeParsedData(cached.parsed_data);
    applyCvSelection(cached.cv_id, cached.file_name);
    setCvIdLocal(cached.cv_id);
    setFileName(cached.file_name);
    setSkills(pd.skills);
    setSummary((pd.summary ?? "").trim());
    setMatchLogic((pd.match_score_logic ?? "").trim());
    setShowUploadOk(true);
    setStep2Unlocked(true);
    qc.setQueryData(cvAnalysisQueryKey(cached.cv_id), cached);
  }, [qc]);

  const selectSavedCv = useCallback(
    async (id: string, navigateToDetail = false) => {
      setSelectingCv(true);
      setGlobalError(null);
      try {
        const cached = await fetchCvDetail(id);
        if (cached?.analysis_complete) {
          applyCachedCvToUi(cached);
          coachToast("Kayıtlı CV seçildi.", "success");
          if (navigateToDetail) {
            navigation.navigate("CvParsedResult", { cvId: cached.cv_id });
          }
          return;
        }
        const row = savedCvs.find((c) => c.cv_id === id);
        applyCvSelection(id, row?.file_name ?? "CV");
        setCvIdLocal(id);
        setStep2Unlocked(true);
        setShowUploadOk(true);
        setFileName(row?.file_name ?? "CV");
        coachToast("Kayıtlı analiz bulunamadı; yeni analiz için CV'yi yeniden yükleyin.", "info");
      } catch (e) {
        const msg = extractDetail(e);
        setSnack(msg);
        coachToast(msg, "error");
      } finally {
        setSelectingCv(false);
      }
    },
    [applyCachedCvToUi, navigation, savedCvs],
  );

  const initialCvParam = route.params?.cvId;
  useEffect(() => {
    if (initialCvParam) {
      void selectSavedCv(initialCvParam, false);
    }
  }, [initialCvParam, selectSavedCv]);

  useEffect(() => {
    if (initialCvParam || cvId) return;
    if (!storeCvId) return;
    void (async () => {
      const persisted = await loadPersistedCvId();
      if (persisted) {
        await selectSavedCv(persisted, false);
      } else {
        setCvIdLocal(storeCvId);
        setStep2Unlocked(true);
        setShowUploadOk(true);
        setFileName("Kayıtlı CV");
      }
    })();
  }, [initialCvParam, cvId, storeCvId, selectSavedCv]);

  const uploadMut = useMutation({
    mutationFn: (form: FormData) => {
      const ac = new AbortController();
      abortRef.current = ac;
      return uploadCvPdf(form, {
        signal: ac.signal,
        onProgress: setUploadPhase,
      });
    },
    onError: (e) => {
      if ((e as Error).name === "AbortError") {
        setSnack("Yükleme iptal edildi");
      } else {
        setSnack(extractDetail(e));
      }
    },
  });

  const cancelUpload = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setUploading(false);
    uploadMut.reset();
  }, [uploadMut]);

  const pickAndUpload = async () => {
    try {
      const list = await fetchCvListWithMeta();
      if (isAtCvLimit(list)) {
        const msg = `En fazla ${maxCvs} CV yükleyebilirsiniz. Profil → CV ve Dosyalar'dan silin.`;
        setSnack(msg);
        coachToast(msg, "error");
        return;
      }
      const [res] = await pick({ type: [types.pdf] });
      const fname = res.name ?? "cv.pdf";
      const [copy] = await keepLocalCopy({
        files: [{ uri: res.uri, fileName: fname }],
        destination: "cachesDirectory",
      });
      if (copy.status === "error") {
        setSnack(copy.copyError);
        return;
      }
      const form = new FormData();
      form.append(
        "file",
        { uri: copy.localUri, name: fname, type: "application/pdf" } as unknown as Blob,
      );
      setUploading(true);
      setUploadPhase("uploading");
      setGlobalError(null);
      uploadMut.mutate(form, {
        onSettled: () => {
          setUploading(false);
          abortRef.current = null;
        },
        onSuccess: (data) => {
          setFileName(fname);
          setCv(data.cv_id, fname);
          setCvIdLocal(data.cv_id);
          const pd = data.parsed_data;
          setSkills(Array.isArray(pd.skills) ? pd.skills : []);
          setSummary((pd.summary ?? "").trim());
          setMatchLogic((pd.match_score_logic ?? "").trim());
          setShowUploadOk(true);
          setStep2Unlocked(true);
          setGlobalError(null);
          qc.invalidateQueries({ queryKey: ["dashboard"] });
          qc.invalidateQueries({ queryKey: CV_LIST_QUERY_KEY });
          cacheCvFromUpload(qc, data);
          coachToast("CV analiz edildi.", "success");
          navigation.navigate("CvParsedResult", {
            cvId: data.cv_id,
            fileName: fname,
            fromUpload: true,
          });
        },
      });
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      setSnack(extractDetail(e));
    }
  };

  const startJob = useAnalysisJobStore((s) => s.startJob);

  const analyzeMut = useMutation({
    mutationFn: analyzeCompany,
    onSuccess: (res) => {
      setCompanyProfile(
        res.profile_id,
        res.company_name,
        res.position,
        typeof res.culture_summary === "string" ? res.culture_summary : null,
        Array.isArray(res.key_traits) ? res.key_traits.map((x) => String(x)) : [],
        typeof res.industry === "string" ? res.industry : null,
      );
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      startJob({
        cvId: cvId!,
        profileId: res.profile_id,
        companyName: res.company_name,
        positionTitle: res.position,
      });
      setSnack("Analiz arka planda başlatıldı. Panel'den takip edebilirsiniz.");
      resetForm();
    },
    onError: (e) => {
      const msg = "Analiz başarısız: " + extractDetail(e);
      setGlobalError(msg);
      coachToast(msg, "error");
    },
  });

  const resetForm = () => {
    setCv(null);
    setCvIdLocal(null);
    setFileName(null);
    setSkills([]);
    setSummary("");
    setMatchLogic("");
    setShowUploadOk(false);
    setStep2Unlocked(false);
    setCompanyName("");
    setSelectedCompany(null);
    setPositionTitle("");
    setGlobalError(null);
  };

  const reupload = () => {
    resetForm();
    analyzeMut.reset();
  };

  const analyzeReady = !!(cvId && companyName.trim() && positionTitle.trim());
  const analyzePending = analyzeMut.isPending;
  const isUploading = uploading || uploadMut.isPending;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flex: 1, backgroundColor: CoachColors.background }}>
        <Appbar.Header elevated style={{ backgroundColor: CoachColors.componentSurface }} theme={CoachAppBarTheme}>
          {navigation.canGoBack() ? <Appbar.BackAction onPress={() => navigation.goBack()} /> : null}
          <Appbar.Content title="CV Analizi" titleStyle={{ fontWeight: "700", color: CoachColors.onComponentSurface }} />
        </Appbar.Header>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120, maxWidth: 800, alignSelf: "center", width: "100%" }}>
          <Text style={{ fontSize: 30, fontWeight: "600", color: CoachColors.onSurface, marginBottom: 8 }}>
            Yeni Bir Analiz Başlat
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: CoachColors.onSurfaceVariant, marginBottom: 24 }}>
            Özgeçmişinizi yükleyin ve yapay zeka destekli analiz ile hedeflerinize ulaşın.
          </Text>

          {globalError ? (
            <View style={{ padding: 16, backgroundColor: CoachColors.errorContainer, borderRadius: CoachRadii.xl, borderWidth: 1, borderColor: "rgba(186,26,26,0.2)", marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: CoachColors.onErrorContainer }}>{globalError}</Text>
            </View>
          ) : null}

          {savedCvs.length > 0 ? (
            <View style={{ backgroundColor: CoachColors.surfaceContainerLowest, borderWidth: 1, borderColor: CoachColors.outlineVariant, borderRadius: CoachRadii.xl, padding: 20, marginBottom: 16, ...CoachShadow.card }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: CoachColors.onSurface }}>
                  Daha önce yüklediğim CV&apos;ler ({listMeta.cv_count ?? savedCvs.length}/{maxCvs})
                </Text>
                <Pressable onPress={() => void cvListQuery.refetch()} hitSlop={8}>
                  <MaterialCommunityIcons name="refresh" size={20} color={CoachColors.secondary} />
                </Pressable>
              </View>
              <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, marginBottom: 12 }}>
                Seçilen CV için Gemini tekrar çalıştırılmaz; hedef şirket analizine geçebilirsiniz.
              </Text>
              {savedCvs.map((cv) => (
                <Pressable
                  key={cv.cv_id}
                  onPress={() => void selectSavedCv(cv.cv_id, false)}
                  disabled={selectingCv || isUploading}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: CoachRadii.md,
                    borderWidth: 1,
                    borderColor: cvId === cv.cv_id ? CoachColors.secondary : CoachColors.outlineVariant,
                    marginBottom: 8,
                    backgroundColor: pressed ? CoachColors.surfaceContainer : CoachColors.surfaceContainerLowest,
                  })}
                >
                  <MaterialCommunityIcons
                    name={cv.analysis_complete ? "check-circle" : "file-document-outline"}
                    size={20}
                    color={cv.analysis_complete ? CoachColors.emerald600 : CoachColors.secondary}
                  />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onSurface }} numberOfLines={1}>
                      {cv.file_name}
                    </Text>
                    <Text style={{ fontSize: 12, color: CoachColors.onSurfaceVariant }} numberOfLines={1}>
                      {formatCvListItemSubtitle(cv)}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => navigation.navigate("CvParsedResult", { cvId: cv.cv_id })}
                    hitSlop={8}
                  >
                    <MaterialCommunityIcons name="file-eye-outline" size={20} color={CoachColors.secondary} />
                  </Pressable>
                </Pressable>
              ))}
              {selectingCv ? <ActivityIndicator color={CoachColors.secondary} style={{ marginTop: 4 }} /> : null}
              <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, textAlign: "center", marginTop: 8 }}>
                veya yeni yükle
              </Text>
            </View>
          ) : null}

          <View style={{ backgroundColor: CoachColors.surfaceContainerLowest, borderWidth: 1, borderColor: CoachColors.outlineVariant, borderRadius: CoachRadii.xl, padding: 24, marginBottom: 24, ...CoachShadow.card }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: CoachColors.primaryContainer, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: CoachColors.onPrimary, fontWeight: "700" }}>1</Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface }}>Özgeçmiş Yükleme</Text>
            </View>

            {!isUploading && !showUploadOk ? (
              <Pressable
                onPress={() => void pickAndUpload()}
                style={({ pressed }) => ({
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: CoachColors.outlineVariant,
                  borderRadius: CoachRadii.xl,
                  padding: 40,
                  alignItems: "center",
                  backgroundColor: pressed ? CoachColors.surfaceContainer : CoachColors.surfaceContainerLow,
                })}
              >
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: CoachColors.surfaceContainerHighest, alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <MaterialCommunityIcons name="cloud-upload-outline" size={36} color={CoachColors.secondary} />
                </View>
                <Text style={{ fontSize: 18, color: CoachColors.onSurface, marginBottom: 8, textAlign: "center" }}>
                  CV&apos;nizi buraya dokunarak dosya seçin
                </Text>
                <Text style={{ fontSize: 16, color: CoachColors.onSurfaceVariant, textAlign: "center" }}>
                  Sadece PDF (Maks. 10MB)
                </Text>
              </Pressable>
            ) : null}

            {isUploading ? (
              <View style={{ padding: 24, alignItems: "center", gap: 16 }}>
                <ActivityIndicator size="large" color={CoachColors.secondary} />
                <Text style={{ fontSize: 16, fontWeight: "500", color: CoachColors.onSurface, textAlign: "center" }}>
                  {PHASE_LABELS[uploadPhase]}
                </Text>
                <Text style={{ fontSize: 13, color: CoachColors.onSurfaceVariant, textAlign: "center" }}>
                  Bu ekrandan ayrılabilirsiniz, işlem arka planda devam eder.
                </Text>
                <Pressable
                  onPress={cancelUpload}
                  style={{ marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: CoachRadii.md, borderWidth: 1, borderColor: CoachColors.outlineVariant }}
                >
                  <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>İptal Et</Text>
                </Pressable>
              </View>
            ) : null}

            {showUploadOk ? (
              <View style={{ marginTop: 4, padding: 16, backgroundColor: CoachColors.emerald50, borderWidth: 1, borderColor: CoachColors.emerald200, borderRadius: CoachRadii.xl, flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
                <MaterialCommunityIcons name="check-circle" size={22} color={CoachColors.emerald600} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "600", fontSize: 14, color: CoachColors.onSurface, marginBottom: 8 }}>
                    {fileName} — yüklendi
                  </Text>
                  <Text style={{ fontSize: 16, color: CoachColors.onSurfaceVariant, marginBottom: 8 }}>
                    Tespit edilen yetenekler:
                  </Text>
                  {skills.length > 0 ? (
                    skills.slice(0, 20).map((s) => (
                      <Text key={s} style={{ fontSize: 14, color: CoachColors.onSurface, marginBottom: 4 }}>• {s}</Text>
                    ))
                  ) : (
                    <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>Yetenek tespit edilemedi</Text>
                  )}
                  {summary || matchLogic ? (
                    <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(16,185,129,0.25)" }}>
                      <Text style={{ fontWeight: "600", fontSize: 14, color: CoachColors.onSurface, marginBottom: 6 }}>Yapay zeka özeti</Text>
                      <Text style={{ fontSize: 14, color: CoachColors.onSurface, lineHeight: 20, marginBottom: 12 }}>{summary || "—"}</Text>
                      <Text style={{ fontWeight: "600", fontSize: 14, color: CoachColors.onSurface, marginBottom: 6 }}>Kısa değerlendirme</Text>
                      <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant, lineHeight: 20 }}>{matchLogic || "—"}</Text>
                    </View>
                  ) : null}
                </View>
                <Pressable onPress={reupload} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <MaterialCommunityIcons name="refresh" size={16} color={CoachColors.onSurfaceVariant} />
                  <Text style={{ fontSize: 12, color: CoachColors.onSurfaceVariant }}>Değiştir</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          <View style={{ position: "relative", backgroundColor: CoachColors.surfaceContainerLowest, borderWidth: 1, borderColor: CoachColors.outlineVariant, borderRadius: CoachRadii.xl, padding: 24, marginBottom: 24, minHeight: step2Unlocked ? undefined : 220, ...CoachShadow.card }}>
            {!step2Unlocked ? (
              <View style={{ ...ABS_FILL, borderRadius: CoachRadii.xl, backgroundColor: "rgba(247,249,251,0.78)", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: CoachColors.surfaceContainer, borderWidth: 1, borderColor: CoachColors.outlineVariant, paddingHorizontal: 16, paddingVertical: 8, borderRadius: CoachRadii.full }}>
                  <MaterialCommunityIcons name="lock" size={18} color={CoachColors.onSurfaceVariant} />
                  <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>Önce CV yükleyin</Text>
                </View>
              </View>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: step2Unlocked ? CoachColors.primaryContainer : CoachColors.surfaceContainerHighest, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontWeight: "700", color: step2Unlocked ? CoachColors.onPrimary : CoachColors.onSurfaceVariant }}>2</Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface }}>Hedef Belirleme</Text>
            </View>
            <View style={{ gap: 16 }}>
              <View>
                <CompanyAutocomplete
                  value={companyName}
                  onChangeText={setCompanyName}
                  selectedCompany={selectedCompany}
                  onSelectCompany={setSelectedCompany}
                  disabled={!step2Unlocked}
                  placeholder="örn: Trendyol"
                  label="Hedef Şirket"
                />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onSurface, marginBottom: 8 }}>Hedef Pozisyon</Text>
                <TextInput
                  mode="outlined"
                  value={positionTitle}
                  onChangeText={setPositionTitle}
                  placeholder="örn: Backend Developer"
                  outlineColor={CoachColors.outlineVariant}
                  activeOutlineColor={CoachColors.secondary}
                  style={{ backgroundColor: CoachColors.surfaceContainerLowest }}
                  editable={step2Unlocked}
                />
              </View>
            </View>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Button
              mode="contained"
              icon="auto-fix"
              disabled={!analyzeReady || analyzePending}
              loading={analyzePending}
              onPress={() => {
                if (!cvId) return;
                setGlobalError(null);
                analyzeMut.mutate({
                  company_name: companyName.trim(),
                  position: positionTitle.trim(),
                  universal_name: selectedCompany?.universal_name,
                  linkedin_company_id: selectedCompany?.id,
                });
              }}
              buttonColor={CoachColors.primary}
              textColor={CoachColors.onPrimary}
              style={{ borderRadius: CoachRadii.md, paddingHorizontal: 8 }}
              contentStyle={{ paddingVertical: 8 }}
            >
              {analyzePending ? "Analiz ediliyor…" : "Analizi Başlat"}
            </Button>
          </View>
        </ScrollView>
        <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={5000}>
          {snack ?? ""}
        </Snackbar>
      </View>
    </KeyboardAvoidingView>
  );
}

const ABS_FILL = {
  position: "absolute" as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
