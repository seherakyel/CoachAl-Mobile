import { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from "@react-native-documents/picker";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { uploadCvPdf, type UploadProgress } from "../../services/api";
import { extractDetail } from "../../services/apiClient";
import {
  CV_LIST_QUERY_KEY,
  cacheCvFromUpload,
  deleteCvDocument,
  fetchCvListWithMeta,
  formatCvListItemSubtitle,
  getMaxCvsFromList,
  isAtCvLimit,
} from "../../services/cvDocuments";
import { coachConfirm, coachToast } from "../coach/CoachDialogs";
import { CoachPalette } from "../../theme/coachTheme";

const S = {
  primary: CoachPalette.primary,
  onPrimary: "#ffffff",
  surface: "#ffffff",
  outline: "#e1e3e4",
  onSurface: "#191c1d",
  onSurfaceVariant: "#464554",
  emerald: "#059669",
  error: "#ba1a1a",
} as const;

const PHASE: Record<UploadProgress, string> = {
  uploading: "PDF yükleniyor…",
  processing: "CV analiz ediliyor…",
  finalizing: "Sonuçlar hazırlanıyor…",
};

type Props = {
  onUploaded: (cvId: string, fileName: string) => void;
  /** Web: cv-analysis?cv_id= — hedef şirket analizi akışı */
  onUseForAnalysis: (cvId: string) => void;
  onViewDetail: (cvId: string) => void;
};

export function CvLibraryPanel({ onUploaded, onUseForAnalysis, onViewDetail }: Props) {
  const qc = useQueryClient();
  const [uploadPhase, setUploadPhase] = useState<UploadProgress>("uploading");
  const [localError, setLocalError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: CV_LIST_QUERY_KEY,
    queryFn: fetchCvListWithMeta,
  });

  const meta = listQuery.data ?? { items: [], cv_count: 0, max_cvs: 3 };
  const items = meta.items;
  const maxCvs = getMaxCvsFromList(meta);
  const atLimit = isAtCvLimit(meta);

  useFocusEffect(
    useCallback(() => {
      void listQuery.refetch();
    }, [listQuery.refetch]),
  );

  const uploadMut = useMutation({
    mutationFn: (form: FormData) =>
      uploadCvPdf(form, {
        onProgress: setUploadPhase,
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: CV_LIST_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      cacheCvFromUpload(qc, data);
      coachToast("CV yüklendi ve analiz edildi.", "success");
      onUploaded(data.cv_id, data.file_name);
    },
    onError: (e) => {
      const msg = extractDetail(e);
      setLocalError(msg);
      coachToast(msg, "error");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteCvDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CV_LIST_QUERY_KEY });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      coachToast("CV silindi.", "success");
    },
    onError: (e) => {
      const msg = extractDetail(e);
      setLocalError(msg);
      coachToast(msg, "error");
    },
  });

  const pickAndUpload = useCallback(async () => {
    if (atLimit) {
      const msg = `En fazla ${maxCvs} CV yükleyebilirsiniz.`;
      setLocalError(msg);
      coachToast(msg, "error");
      return;
    }
    setLocalError(null);
    try {
      const [res] = await pick({ type: [types.pdf] });
      const fname = res.name ?? "cv.pdf";
      const [copy] = await keepLocalCopy({
        files: [{ uri: res.uri, fileName: fname }],
        destination: "cachesDirectory",
      });
      if (copy.status === "error") {
        setLocalError(copy.copyError);
        return;
      }
      const form = new FormData();
      form.append(
        "file",
        { uri: copy.localUri, name: fname, type: "application/pdf" } as unknown as Blob,
      );
      uploadMut.mutate(form);
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      const msg = extractDetail(e);
      setLocalError(msg);
      coachToast(msg, "error");
    }
  }, [atLimit, maxCvs, uploadMut]);

  const handleDelete = async (cvId: string, fileName: string) => {
    const ok = await coachConfirm(`"${fileName}" silinsin mi? Bu işlem geri alınamaz.`, {
      title: "CV sil",
      danger: true,
    });
    if (!ok) return;
    deleteMut.mutate(cvId);
  };

  const busy = uploadMut.isPending || deleteMut.isPending;

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint}>
        PDF formatında en fazla {maxCvs} CV yükleyebilirsiniz. Daha önce analiz edilen CV tekrar Gemini&apos;ye
        gönderilmez.
      </Text>

      <View style={styles.counterRow}>
        <Text style={styles.counter}>
          {meta.cv_count ?? items.length} / {maxCvs} CV
        </Text>
        <Pressable onPress={() => void listQuery.refetch()} hitSlop={8} disabled={busy}>
          <MaterialCommunityIcons name="refresh" size={20} color={S.primary} />
        </Pressable>
      </View>

      {localError ? (
        <View style={styles.errBox}>
          <Text style={styles.errText}>{localError}</Text>
        </View>
      ) : null}

      {uploadMut.isPending ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={S.primary} />
          <Text style={styles.loadingText}>{PHASE[uploadPhase]}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={() => void pickAndUpload()}
        disabled={atLimit || busy}
        style={({ pressed }) => [
          styles.uploadBtn,
          (atLimit || busy) && styles.uploadBtnDisabled,
          pressed && !atLimit && { opacity: 0.9 },
        ]}
      >
        <MaterialCommunityIcons
          name="cloud-upload-outline"
          size={22}
          color={atLimit ? S.onSurfaceVariant : S.onPrimary}
        />
        <Text style={[styles.uploadBtnText, atLimit && styles.uploadBtnTextDisabled]}>
          {atLimit ? "CV limiti doldu" : "PDF CV yükle"}
        </Text>
      </Pressable>

      {listQuery.isLoading ? <ActivityIndicator style={{ marginTop: 16 }} color={S.primary} /> : null}

      {items.map((cv) => (
        <View key={cv.cv_id} style={styles.row}>
          <View style={styles.rowMain}>
            <MaterialCommunityIcons
              name={cv.analysis_complete ? "check-circle" : "file-document-outline"}
              size={22}
              color={cv.analysis_complete ? S.emerald : S.primary}
            />
            <View style={styles.rowText}>
              <Text style={styles.fileName} numberOfLines={1}>
                {cv.file_name}
              </Text>
              <Text style={styles.meta} numberOfLines={2}>
                {formatCvListItemSubtitle(cv)}
              </Text>
            </View>
          </View>
          <View style={styles.rowActions}>
            <Pressable
              onPress={() => onUseForAnalysis(cv.cv_id)}
              disabled={busy}
              style={styles.actionBtn}
            >
              <Text style={styles.actionBtnText}>Analizde kullan</Text>
            </Pressable>
            <Pressable onPress={() => onViewDetail(cv.cv_id)} disabled={busy} style={styles.iconBtn}>
              <MaterialCommunityIcons name="file-eye-outline" size={20} color={S.primary} />
            </Pressable>
            <Pressable
              onPress={() => void handleDelete(cv.cv_id, cv.file_name)}
              disabled={busy}
              style={styles.iconBtn}
              accessibilityLabel="CV sil"
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={S.error} />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  hint: { fontSize: 14, lineHeight: 20, color: S.onSurfaceVariant },
  counterRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  counter: { fontSize: 13, fontWeight: "600", color: S.primary },
  errBox: {
    padding: 12,
    backgroundColor: "#ffdad6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(186,26,26,0.2)",
  },
  errText: { fontSize: 13, color: S.error },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: "rgba(56, 95, 140, 0.08)",
    borderRadius: 14,
  },
  loadingText: { fontSize: 14, fontWeight: "500", color: S.onSurface },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: S.primary,
    paddingVertical: 14,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    }),
  },
  uploadBtnDisabled: { backgroundColor: S.outline },
  uploadBtnText: { fontSize: 15, fontWeight: "600", color: S.onPrimary },
  uploadBtnTextDisabled: { color: S.onSurfaceVariant },
  row: {
    borderWidth: 1,
    borderColor: S.outline,
    borderRadius: 14,
    backgroundColor: S.surface,
    padding: 12,
    gap: 10,
  },
  rowMain: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  rowText: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 15, fontWeight: "600", color: S.onSurface },
  meta: { fontSize: 12, color: S.onSurfaceVariant, marginTop: 2 },
  rowActions: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "rgba(56, 95, 140, 0.12)",
  },
  actionBtnText: { fontSize: 12, fontWeight: "600", color: S.primary },
  iconBtn: { padding: 6 },
});
