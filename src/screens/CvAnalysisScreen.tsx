import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
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
import { analyzeCompany, uploadCvPdf } from "../services/api";
import { extractDetail } from "../services/apiClient";
import { usePipelineStore } from "../store/usePipelineStore";
import type { AnalyzeParamList } from "../app/navigationTypes";
import { CoachAppBarTheme, CoachColors, CoachRadii, CoachShadow } from "../theme/coachTheme";

type Nav = NativeStackNavigationProp<AnalyzeParamList>;

export function CvAnalysisScreen() {
  const navigation = useNavigation<Nav>();
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
  const [showUploadOk, setShowUploadOk] = useState(false);
  const [step2Unlocked, setStep2Unlocked] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [positionTitle, setPositionTitle] = useState("");

  useEffect(() => {
    if (storeCvId && !cvId) {
      setCvIdLocal(storeCvId);
      setStep2Unlocked(true);
      setShowUploadOk(true);
      setFileName("Kayıtlı CV");
    }
  }, [storeCvId, cvId]);

  const uploadMut = useMutation({
    mutationFn: uploadCvPdf,
    onError: (e) => setSnack(extractDetail(e)),
  });

  const pickAndUpload = async () => {
    try {
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
        {
          uri: copy.localUri,
          name: fname,
          type: "application/pdf",
        } as unknown as Blob
      );
      setUploading(true);
      setGlobalError(null);
      uploadMut.mutate(form, {
        onSettled: () => setUploading(false),
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
        },
      });
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      setSnack(extractDetail(e));
    }
  };

  const analyzeMut = useMutation({
    mutationFn: analyzeCompany,
    onSuccess: (res) => {
      setCompanyProfile(res.profile_id, res.company_name, res.position);
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      navigation.navigate("AlignmentResult", {});
    },
    onError: (e) => {
      setGlobalError("Analiz başarısız: " + extractDetail(e));
    },
  });

  const reupload = () => {
    setCv(null);
    setCvIdLocal(null);
    setFileName(null);
    setSkills([]);
    setSummary("");
    setMatchLogic("");
    setShowUploadOk(false);
    setStep2Unlocked(false);
    setCompanyName("");
    setPositionTitle("");
    setGlobalError(null);
    analyzeMut.reset();
  };

  const analyzeReady = !!(cvId && companyName.trim() && positionTitle.trim());
  const analyzePending = analyzeMut.isPending;

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
            <View
              style={{
                padding: 16,
                backgroundColor: CoachColors.errorContainer,
                borderRadius: CoachRadii.xl,
                borderWidth: 1,
                borderColor: "rgba(186,26,26,0.2)",
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 14, color: CoachColors.onErrorContainer }}>{globalError}</Text>
            </View>
          ) : null}

          <View
            style={{
              backgroundColor: CoachColors.surfaceContainerLowest,
              borderWidth: 1,
              borderColor: CoachColors.outlineVariant,
              borderRadius: CoachRadii.xl,
              padding: 24,
              marginBottom: 24,
              ...CoachShadow.card,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: CoachColors.primaryContainer,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: CoachColors.onPrimary, fontWeight: "700" }}>1</Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface }}>Özgeçmiş Yükleme</Text>
            </View>

            <Pressable
              onPress={() => void pickAndUpload()}
              disabled={uploading || uploadMut.isPending}
              style={({ pressed }) => ({
                borderWidth: 2,
                borderStyle: "dashed",
                borderColor: CoachColors.outlineVariant,
                borderRadius: CoachRadii.xl,
                padding: 40,
                alignItems: "center",
                backgroundColor: pressed ? CoachColors.surfaceContainer : CoachColors.surfaceContainerLow,
                opacity: uploading || uploadMut.isPending ? 0.6 : 1,
              })}
            >
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: CoachColors.surfaceContainerHighest,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <MaterialCommunityIcons name="cloud-upload-outline" size={36} color={CoachColors.secondary} />
              </View>
              <Text style={{ fontSize: 18, color: CoachColors.onSurface, marginBottom: 8, textAlign: "center" }}>
                CV&apos;nizi buraya dokunarak dosya seçin
              </Text>
              <Text style={{ fontSize: 16, color: CoachColors.onSurfaceVariant, textAlign: "center" }}>
                Sadece PDF (Maks. 10MB)
              </Text>
            </Pressable>

            {uploading || uploadMut.isPending ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 12 }}>
                <ActivityIndicator color={CoachColors.secondary} />
                <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>
                  PDF analiz ediliyor, lütfen bekleyin…
                </Text>
              </View>
            ) : null}

            {showUploadOk ? (
              <View
                style={{
                  marginTop: 16,
                  padding: 16,
                  backgroundColor: CoachColors.emerald50,
                  borderWidth: 1,
                  borderColor: CoachColors.emerald200,
                  borderRadius: CoachRadii.xl,
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
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
                      <Text key={s} style={{ fontSize: 14, color: CoachColors.onSurface, marginBottom: 4 }}>
                        • {s}
                      </Text>
                    ))
                  ) : (
                    <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>Yetenek tespit edilemedi</Text>
                  )}
                  {summary || matchLogic ? (
                    <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: "rgba(16,185,129,0.25)" }}>
                      <Text style={{ fontWeight: "600", fontSize: 14, color: CoachColors.onSurface, marginBottom: 6 }}>
                        Yapay zeka özeti
                      </Text>
                      <Text style={{ fontSize: 14, color: CoachColors.onSurface, lineHeight: 20, marginBottom: 12 }}>
                        {summary || "—"}
                      </Text>
                      <Text style={{ fontWeight: "600", fontSize: 14, color: CoachColors.onSurface, marginBottom: 6 }}>
                        Kısa değerlendirme
                      </Text>
                      <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant, lineHeight: 20 }}>
                        {matchLogic || "—"}
                      </Text>
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

          <View
            style={{
              position: "relative",
              backgroundColor: CoachColors.surfaceContainerLowest,
              borderWidth: 1,
              borderColor: CoachColors.outlineVariant,
              borderRadius: CoachRadii.xl,
              padding: 24,
              marginBottom: 24,
              minHeight: step2Unlocked ? undefined : 220,
              ...CoachShadow.card,
            }}
          >
            {!step2Unlocked ? (
              <View
                style={{
                  ...StyleSheetAbsolute,
                  borderRadius: CoachRadii.xl,
                  backgroundColor: "rgba(247,249,251,0.78)",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    backgroundColor: CoachColors.surfaceContainer,
                    borderWidth: 1,
                    borderColor: CoachColors.outlineVariant,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: CoachRadii.full,
                  }}
                >
                  <MaterialCommunityIcons name="lock" size={18} color={CoachColors.onSurfaceVariant} />
                  <Text style={{ fontSize: 14, color: CoachColors.onSurfaceVariant }}>Önce CV yükleyin</Text>
                </View>
              </View>
            ) : null}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: step2Unlocked ? CoachColors.primaryContainer : CoachColors.surfaceContainerHighest,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    color: step2Unlocked ? CoachColors.onPrimary : CoachColors.onSurfaceVariant,
                  }}
                >
                  2
                </Text>
              </View>
              <Text style={{ fontSize: 24, fontWeight: "600", color: CoachColors.onSurface }}>Hedef Belirleme</Text>
            </View>
            <View style={{ gap: 16 }}>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onSurface, marginBottom: 8 }}>
                  Hedef Şirket
                </Text>
                <TextInput
                  mode="outlined"
                  value={companyName}
                  onChangeText={setCompanyName}
                  placeholder="örn: Trendyol"
                  outlineColor={CoachColors.outlineVariant}
                  activeOutlineColor={CoachColors.secondary}
                  style={{ backgroundColor: CoachColors.surfaceContainerLowest }}
                  editable={step2Unlocked}
                />
              </View>
              <View>
                <Text style={{ fontSize: 14, fontWeight: "500", color: CoachColors.onSurface, marginBottom: 8 }}>
                  Hedef Pozisyon
                </Text>
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

const StyleSheetAbsolute = {
  position: "absolute" as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};
