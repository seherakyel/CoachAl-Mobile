import { z } from "zod";

/** Firestore `users/{uid}/cvs/{cvId}` — analiz sayfası (CvParsedResult) ile uyumlu */
export const CvParsedDataSchema = z.object({
  skills: z.array(z.string()).default([]),
  experience_years: z.number().nullable().optional(),
  education_level: z.string().nullable().optional(),
  summary: z.string().optional(),
  match_score_logic: z.string().optional(),
});

export type CvParsedData = z.infer<typeof CvParsedDataSchema>;

export const CvAnalysisRecordSchema = z.object({
  cv_id: z.string(),
  file_name: z.string(),
  storage_path: z.string().optional(),
  analyzed_at: z.string().optional(),
  /** Gemini tamamlandıysa true; mobil tekrar analiz istemez */
  analysis_complete: z.boolean().default(false),
  parsed_data: CvParsedDataSchema,
  extracted_text_preview: z.string().optional(),
});

export type CvAnalysisRecord = z.infer<typeof CvAnalysisRecordSchema>;

export const CvListItemSchema = z.object({
  cv_id: z.string(),
  file_name: z.string(),
  created_at: z.string().optional(),
  analysis_complete: z.boolean().default(false),
  storage_path: z.string().optional(),
});

export type CvListItem = z.infer<typeof CvListItemSchema>;

export const MAX_CV_UPLOADS = 3;
