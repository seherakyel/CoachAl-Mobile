import type { CvAnalysisResponse, CvParsedData, CvUploadResponse } from "../services/api";
import { CvAnalysisRecordSchema, CvParsedDataSchema } from "../schemas/cvAnalysisSchema";

export function normalizeParsedData(raw: unknown): CvParsedData {
  const parsed = CvParsedDataSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  const r = raw as CvParsedData | undefined;
  return {
    skills: Array.isArray(r?.skills) ? r!.skills.map(String) : [],
    experience_years: r?.experience_years ?? null,
    education_level: r?.education_level ?? null,
    summary: r?.summary ?? "",
    match_score_logic: r?.match_score_logic ?? "",
  };
}

export function uploadToAnalysisRecord(upload: CvUploadResponse): CvAnalysisResponse {
  return {
    cv_id: upload.cv_id,
    file_name: upload.file_name,
    analysis_complete: upload.analysis_complete ?? true,
    parsed_data: normalizeParsedData(upload.parsed_data),
    extracted_text_preview: upload.extracted_text_preview,
  };
}

export function validateAnalysisRecord(data: unknown): CvAnalysisResponse | null {
  const wrapped = CvAnalysisRecordSchema.safeParse({
    ...((data && typeof data === "object" ? data : {}) as object),
    analysis_complete:
      (data as { analysis_complete?: boolean })?.analysis_complete ??
      (data as { parsed_data?: unknown })?.parsed_data != null,
  });
  if (!wrapped.success) return null;
  const w = wrapped.data;
  return {
    cv_id: w.cv_id,
    file_name: w.file_name,
    analysis_complete: w.analysis_complete,
    parsed_data: normalizeParsedData(w.parsed_data),
    extracted_text_preview: w.extracted_text_preview,
    analyzed_at: w.analyzed_at,
    storage_path: w.storage_path,
  };
}
