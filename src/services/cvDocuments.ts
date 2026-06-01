/**
 * Web `cv-documents.js` karşılığı — CV liste, detay, seçim (tek kaynak).
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { QueryClient } from "@tanstack/react-query";
import {
  deleteCv,
  fetchCvList,
  getCvById,
  type CvAnalysisResponse,
  type CvListItem,
  type CvListResponse,
} from "./api";
import { uploadToAnalysisRecord } from "../utils/cvAnalysisHelpers";
import type { CvUploadResponse } from "./api";
import { usePipelineStore } from "../store/usePipelineStore";

export const CV_LIST_QUERY_KEY = ["cv-list"] as const;
export const cvAnalysisQueryKey = (cvId: string) => ["cv-analysis", cvId] as const;

export const STORAGE_SELECTED_CV_ID = "coachai_selected_cv_id";

export async function fetchCvListWithMeta(): Promise<CvListResponse> {
  return fetchCvList();
}

export async function fetchCvDetail(cvId: string): Promise<CvAnalysisResponse | null> {
  return getCvById(cvId);
}

export async function deleteCvDocument(cvId: string): Promise<void> {
  await deleteCv(cvId);
  await clearSelectedCvIfDeleted(cvId);
}

export async function clearSelectedCvIfDeleted(cvId: string): Promise<void> {
  const stored = await AsyncStorage.getItem(STORAGE_SELECTED_CV_ID);
  if (stored === cvId) {
    await AsyncStorage.removeItem(STORAGE_SELECTED_CV_ID);
    usePipelineStore.getState().setCv(null);
  }
}

export function applyCvSelection(cvId: string, fileName: string): void {
  usePipelineStore.getState().setCv(cvId, fileName);
  void AsyncStorage.setItem(STORAGE_SELECTED_CV_ID, cvId);
}

export function cacheCvFromUpload(qc: QueryClient, upload: CvUploadResponse): CvAnalysisResponse {
  const record = uploadToAnalysisRecord(upload);
  qc.setQueryData(cvAnalysisQueryKey(upload.cv_id), record);
  return record;
}

export async function persistAndApplyCvSelection(cvId: string, fileName: string): Promise<void> {
  applyCvSelection(cvId, fileName);
}

export async function loadPersistedCvId(): Promise<string | null> {
  const id = await AsyncStorage.getItem(STORAGE_SELECTED_CV_ID);
  return id?.trim() || null;
}

export function getMaxCvsFromList(meta: CvListResponse): number {
  return meta.max_cvs ?? 3;
}

export function isAtCvLimit(meta: CvListResponse): boolean {
  const max = getMaxCvsFromList(meta);
  const count = meta.cv_count ?? meta.items.length;
  return count >= max;
}

export function formatCvListItemSubtitle(item: CvListItem): string {
  if (item.summary?.trim()) return item.summary.trim();
  return item.analysis_complete ? "Analiz kayıtlı" : "Analiz bekleniyor";
}
