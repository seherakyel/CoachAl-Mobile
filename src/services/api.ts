import { getApiBaseUrl } from "../config/env";
import { api } from "./apiClient";
import { getIdToken } from "./firebaseAuth";

export type HealthResponse = {
  status: string;
  message: string;
};

export type CvParsedData = {
  skills: string[];
  experience_years?: number | null;
  education_level?: string | null;
  summary?: string;
  match_score_logic?: string;
};

export type CvUploadResponse = {
  cv_id: string;
  file_name: string;
  parsed_data: CvParsedData;
  extracted_text_preview?: string;
  /** Backend Firestore’da kayıt varsa Gemini atlanır */
  from_cache?: boolean;
  analysis_complete?: boolean;
};

export type CvListItem = {
  cv_id: string;
  file_name: string;
  summary?: string;
  created_at?: string;
  analysis_complete?: boolean;
  storage_path?: string;
};

export type CvListResponse = {
  items: CvListItem[];
  cv_count?: number;
  max_cvs?: number;
};

export type CvAnalysisResponse = {
  cv_id: string;
  file_name: string;
  analysis_complete: boolean;
  parsed_data: CvParsedData;
  extracted_text_preview?: string;
  analyzed_at?: string;
  storage_path?: string;
};

export type CompanyAnalyzeBody = {
  company_name: string;
  position: string;
  /**
   * Web’deki LinkedIn şirket seçimiyle gelen stabil kimlik.
   * Backend destekliyorsa, serbest metne ek olarak gönderilir.
   */
  universal_name?: string;
  /** Alternatif backend sözleşmeleri için opsiyonel id alanı. */
  linkedin_company_id?: string;
};

export type CompanyAnalyzeResponse = {
  profile_id: string;
  company_name: string;
  position: string;
  tech_stack?: unknown;
  culture_summary?: string;
  interview_process?: unknown;
  common_questions?: unknown;
  key_traits?: unknown;
  industry?: string;
};

export type CompanySearchItem = {
  id: string;
  name: string;
  universal_name?: string;
  logo_url?: string | null;
  industry?: string | null;
  entity_type?: string;
};

export type AlignmentScoreBody = {
  cv_id: string;
  profile_id: string;
};

export type SkillUiItem = {
  skill?: string;
  label?: string;
  detail?: string;
  [key: string]: unknown;
};

export type AlignmentScoreResponse = {
  result_id: string;
  cv_id: string;
  profile_id: string;
  company_name: string;
  position: string;
  advice: string;
  next_steps: string[];
  matched_skills_ui: SkillUiItem[];
  missing_skills_ui: SkillUiItem[];
  score_percent: number;
  risk_level: string;
  S?: unknown;
  E?: unknown;
  D?: unknown;
  required_skills_used?: unknown;
  matched_skills?: string[];
  missing_skills?: string[];
  /** GET /alignment/{id} ve şirket profili senkronunda gelir; POST /score yanıtında olmayabilir. */
  culture_summary?: string;
  key_traits?: unknown[];
};

/** GET /alignment/{id} — şirket profili alanları `AlignmentScoreResponse` üzerinde opsiyonel. */
export type AlignmentDetailResponse = AlignmentScoreResponse;

export type AlignmentListItem = {
  id: string;
  company_name: string;
  target_position: string;
  score: number;
  risk_level: string;
  created_at: string;
  cv_id: string;
  profile_id: string;
};

export type DashboardSummary = {
  cv_count: number;
  company_count: number;
  interview_count: number;
  applications: Array<{
    profile_id: string;
    company_name: string;
    position: string;
    alignment_score: number | null;
    alignment_id: string | null;
    risk_level: string | null;
    classic_best: number | null;
    classic_count: number;
    quiz_best: number | null;
    quiz_count: number;
  }>;
  recent_alignments: Array<{
    alignment_id: string;
    profile_id: string | null;
    cv_id: string | null;
    score: number;
    risk_level: string | null;
  }>;
  limits: Record<string, number>;
};

export type InterviewStartBody = {
  cv_id: string;
  profile_id: string;
  focus_topic?: string | null;
};

export type ClassicQuestion = {
  index: number;
  type?: string;
  difficulty?: string;
  question: string;
};

export type ClassicStartResponse = {
  session_id: string;
  company_name: string;
  position: string;
  mode: string;
  questions: ClassicQuestion[];
};

export type ClassicEvaluateBody = {
  session_id: string;
  answers: Array<{ question_index: number; answer: string }>;
};

export type ClassicEvaluateResponse = {
  session_id: string;
  total_score: number;
  feedback: string;
  per_question: Array<Record<string, unknown>>;
};

export type QuizQuestion = {
  index: number;
  question: string;
  options: string[];
  difficulty?: string;
};

export type QuizStartResponse = {
  session_id: string;
  company_name: string;
  position: string;
  mode: string;
  seconds_per_question: number;
  questions: QuizQuestion[];
};

export type QuizSubmitBody = {
  session_id: string;
  answers: Array<{ question_index: number; selected_index: number | null }>;
};

export type QuizSubmitResponse = {
  session_id: string;
  correct_count: number;
  total_questions: number;
  total_score: number;
  per_question: Array<Record<string, unknown>>;
};

export type FeedbackBody = {
  alignment_id: string;
  session_id?: string | null;
};

export type FeedbackResponse = {
  report_id: string;
  alignment_id: string;
  session_id?: string | null;
  company_name: string;
  position: string;
  score?: number | null;
  risk_level?: string | null;
  strengths: string[];
  weaknesses: string[];
  why_can_be_eliminated: string;
  action_plan: string;
  recommended_resources: string[];
  estimated_prep_time: string;
};

export type InterviewListItem = {
  id: string;
  session_id: string;
  type: string;
  created_at: string;
  cv_id: string;
  profile_id: string;
  score?: number | null;
};

export async function getHealth(): Promise<HealthResponse> {
  const res = await api.get<HealthResponse>("/health");
  return res.data;
}

/** Kullanıcının kayıtlı CV listesi (web: items + cv_count + max_cvs) */
export async function fetchCvList(): Promise<CvListResponse> {
  const res = await api.get<CvListResponse | CvListItem[] | { items: CvListItem[] }>("/cv/list");
  const data = res.data;
  if (Array.isArray(data)) {
    return { items: data, cv_count: data.length, max_cvs: 3 };
  }
  if (data && typeof data === "object" && Array.isArray((data as CvListResponse).items)) {
    const d = data as CvListResponse;
    return {
      items: d.items,
      cv_count: d.cv_count ?? d.items.length,
      max_cvs: d.max_cvs ?? 3,
    };
  }
  return { items: [], cv_count: 0, max_cvs: 3 };
}

/** @deprecated Use fetchCvList().items */
export async function listUserCvs(): Promise<CvListItem[]> {
  const { items } = await fetchCvList();
  return items;
}

function normalizeCvDetailPayload(raw: unknown, cvId: string): CvAnalysisResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const parsed =
    (r.parsed_data as CvParsedData | undefined) ??
    ({
      skills: Array.isArray(r.skills) ? (r.skills as string[]) : [],
      experience_years: (r.experience_years as number | null) ?? null,
      education_level: (r.education_level as string | null) ?? null,
      summary: typeof r.summary === "string" ? r.summary : "",
      match_score_logic: typeof r.match_score_logic === "string" ? r.match_score_logic : "",
    } satisfies CvParsedData);

  const fileName = String(r.file_name ?? r.fileName ?? "CV").trim() || "CV";
  const id = String(r.cv_id ?? r.cvId ?? cvId).trim() || cvId;

  return {
    cv_id: id,
    file_name: fileName,
    analysis_complete: Boolean(
      r.analysis_complete ??
        ((Array.isArray(parsed.skills) && parsed.skills.length > 0) || !!(parsed.summary?.trim())),
    ),
    parsed_data: parsed,
    extracted_text_preview:
      typeof r.extracted_text_preview === "string" ? r.extracted_text_preview : undefined,
    analyzed_at: typeof r.analyzed_at === "string" ? r.analyzed_at : undefined,
    storage_path: typeof r.storage_path === "string" ? r.storage_path : undefined,
  };
}

/** Web: GET /api/cv/{cv_id} — Firestore önbellek; yoksa 404 */
export async function getCvById(cvId: string): Promise<CvAnalysisResponse | null> {
  const id = encodeURIComponent(cvId);
  try {
    const res = await api.get<unknown>(`/cv/${id}`);
    return normalizeCvDetailPayload(res.data, cvId);
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status;
    if (status !== 404) throw e;
  }
  try {
    const res = await api.get<unknown>(`/cv/${id}/analysis`);
    return normalizeCvDetailPayload(res.data, cvId);
  } catch (e: unknown) {
    const status = (e as { response?: { status?: number } })?.response?.status;
    if (status === 404) return null;
    throw e;
  }
}

/** @deprecated Use getCvById */
export const getCvAnalysis = getCvById;

export async function deleteCv(cvId: string): Promise<void> {
  await api.delete(`/cv/${encodeURIComponent(cvId)}`);
}

const CV_UPLOAD_TIMEOUT_MS = 600_000;
const CV_UPLOAD_MAX_RETRIES = 2;
const CV_UPLOAD_RETRY_DELAY_MS = 1500;

export type UploadProgress = "uploading" | "processing" | "finalizing";

export interface CvUploadOptions {
  signal?: AbortSignal;
  onProgress?: (phase: UploadProgress) => void;
}

export async function uploadCvPdf(
  form: FormData,
  opts: CvUploadOptions = {},
): Promise<CvUploadResponse> {
  const { signal: externalSignal, onProgress } = opts;

  let lastError: unknown;

  for (let attempt = 0; attempt <= CV_UPLOAD_MAX_RETRIES; attempt++) {
    if (externalSignal?.aborted) throw makeAbortError();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CV_UPLOAD_TIMEOUT_MS);

    const abortOnExternal = () => controller.abort();
    externalSignal?.addEventListener("abort", abortOnExternal, { once: true });

    try {
      onProgress?.("uploading");

      const base = getApiBaseUrl().replace(/\/$/, "");
      const token = await getIdToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${base}/api/cv/upload`, {
        method: "POST",
        headers,
        body: form,
        signal: controller.signal,
      });

      onProgress?.("processing");

      const text = await res.text();
      let data: unknown;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }

      if (!res.ok) {
        const detail = parseFastApiDetail(data, text, res.status);
        if (res.status >= 400 && res.status < 500) throw new Error(detail);
        lastError = new Error(detail);
        if (attempt < CV_UPLOAD_MAX_RETRIES) {
          await sleep(CV_UPLOAD_RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        throw lastError;
      }

      onProgress?.("finalizing");

      if (!data || typeof data !== "object") throw new Error("Geçersiz sunucu yanıtı");
      return data as CvUploadResponse;
    } catch (e) {
      if (externalSignal?.aborted) throw makeAbortError();

      const isRetryable =
        e instanceof TypeError ||
        (e instanceof Error && /network|abort|timeout/i.test(e.message));

      if (isRetryable && attempt < CV_UPLOAD_MAX_RETRIES) {
        lastError = e;
        await sleep(CV_UPLOAD_RETRY_DELAY_MS * (attempt + 1));
        continue;
      }
      throw e;
    } finally {
      clearTimeout(timeoutId);
      externalSignal?.removeEventListener("abort", abortOnExternal);
    }
  }

  throw lastError ?? new Error("CV yükleme başarısız");
}

function parseFastApiDetail(data: unknown, rawText: string, status: number): string {
  if (data && typeof data === "object" && "detail" in data) {
    const d = (data as { detail: unknown }).detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return d.map((x) => String(x)).join("\n");
  }
  return rawText.trim() || `HTTP ${status}`;
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function makeAbortError(): Error {
  const e = new Error("Aborted");
  e.name = "AbortError";
  return e;
}

export async function analyzeCompany(body: CompanyAnalyzeBody): Promise<CompanyAnalyzeResponse> {
  const res = await api.post<CompanyAnalyzeResponse>("/company/analyze", body);
  return res.data;
}

export async function searchCompanies(
  q: string,
  opts?: { signal?: AbortSignal; limit?: number },
): Promise<CompanySearchItem[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const res = await api.get<any>("/company/search", {
    // backend’ler farklı param adı kullanabiliyor: q / query / term
    params: { q: query, query, term: query, limit: opts?.limit ?? 8 },
    signal: opts?.signal,
  });

  const data = res.data;
  if (__DEV__) {
    console.info("[api.searchCompanies] raw response", data);
  }

  // Esnek normalize: {items:[]}, {results:[]}, {companies:[]}, {data:{items:[]}}, veya doğrudan []
  const candidates: unknown[] = [
    data,
    data?.items,
    data?.results,
    data?.companies,
    data?.data,
    data?.data?.items,
    data?.data?.results,
    data?.data?.companies,
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) {
      return (c as unknown[]).map(normalizeCompanySearchItem).filter(Boolean) as CompanySearchItem[];
    }
  }

  return [];
}

function extractLogoFromVectorImage(vector: unknown): string | undefined {
  if (!vector || typeof vector !== "object") return undefined;
  const v = vector as { rootUrl?: string; artifacts?: Array<{ fileIdentifyingUrlPathSegment?: string }> };
  const rootUrl = typeof v.rootUrl === "string" ? v.rootUrl : "";
  const artifacts = Array.isArray(v.artifacts) ? v.artifacts : [];
  if (!rootUrl || artifacts.length === 0) return undefined;
  const last = artifacts[artifacts.length - 1];
  const seg = last?.fileIdentifyingUrlPathSegment;
  if (typeof seg === "string" && seg) return rootUrl + seg;
  return undefined;
}

function findLogoInLinkedInNode(node: unknown, depth = 0): string | undefined {
  if (!node || typeof node !== "object" || depth > 6) return undefined;
  const n = node as Record<string, unknown>;

  const direct =
    extractLogoFromVectorImage(n.vectorImage) ??
    extractLogoFromVectorImage((n.logoResolutionResult as { vectorImage?: unknown })?.vectorImage) ??
    extractLogoFromVectorImage((n.image as { vectorImage?: unknown })?.vectorImage);

  if (direct) return direct;

  const lockup = n.entityLockupView as Record<string, unknown> | undefined;
  if (lockup) {
    const fromLockup =
      extractLogoFromVectorImage((lockup.image as { vectorImage?: unknown })?.vectorImage) ??
      findLogoInLinkedInNode(lockup.image, depth + 1);
    if (fromLockup) return fromLockup;
  }

  if (n.view) {
    const fromView = findLogoInLinkedInNode(n.view, depth + 1);
    if (fromView) return fromView;
  }

  return undefined;
}

function normalizeCompanySearchItem(raw: unknown): CompanySearchItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;

  const id =
    String(
      r.id ??
        r.company_id ??
        r.companyId ??
        r.organizationId ??
        r.urn ??
        r.universal_name ??
        r.universalName ??
        r.name ??
        "",
    ).trim() || "";

  const name = String(r.name ?? r.company_name ?? r.companyName ?? r.title ?? r.displayName ?? "").trim();
  if (!name) return null;

  const universal_name =
    String(r.universal_name ?? r.universalName ?? r.slug ?? r.publicIdentifier ?? "").trim() || undefined;
  const industry = String(r.industry ?? r.category ?? r.headline ?? r.subtitle ?? "").trim() || undefined;

  let logo_url: string | undefined =
    (typeof r.logo_url === "string" && r.logo_url) ||
    (typeof r.logoUrl === "string" && r.logoUrl) ||
    (typeof r.logo === "string" && r.logo) ||
    (typeof r.logoURL === "string" && r.logoURL) ||
    (typeof r.imageUrl === "string" && r.imageUrl) ||
    undefined;

  if (!logo_url) {
    logo_url =
      extractLogoFromVectorImage((r.logoResolutionResult as { vectorImage?: unknown })?.vectorImage) ??
      extractLogoFromVectorImage(r.vectorImage) ??
      findLogoInLinkedInNode(r);
  }

  if (logo_url) logo_url = String(logo_url).trim();

  const entity_type =
    String(r.entity_type ?? r.entityType ?? (typeof r.type === "string" ? r.type : "") ?? "").trim() || undefined;

  return {
    id,
    name,
    universal_name,
    logo_url: logo_url || null,
    industry: industry || null,
    entity_type,
  };
}

export async function scoreAlignment(body: AlignmentScoreBody): Promise<AlignmentScoreResponse> {
  const res = await api.post<AlignmentScoreResponse>("/alignment/score", body);
  return res.data;
}

export async function listAlignments(limit = 20): Promise<{ items: AlignmentListItem[]; total: number }> {
  const res = await api.get<{ items: AlignmentListItem[]; total: number }>("/alignment/list", {
    params: { limit },
  });
  return res.data;
}

export async function getAlignmentById(alignmentId: string): Promise<AlignmentDetailResponse> {
  const res = await api.get<AlignmentDetailResponse>(`/alignment/${alignmentId}`);
  return res.data;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const res = await api.get<DashboardSummary>("/dashboard/summary");
  return res.data;
}

export async function startClassicInterview(body: InterviewStartBody): Promise<ClassicStartResponse> {
  const res = await api.post<ClassicStartResponse>("/interview/classic", body);
  return res.data;
}

export async function evaluateClassicInterview(body: ClassicEvaluateBody): Promise<ClassicEvaluateResponse> {
  const res = await api.post<ClassicEvaluateResponse>("/interview/evaluate", body);
  return res.data;
}

export async function startQuizInterview(body: InterviewStartBody): Promise<QuizStartResponse> {
  const res = await api.post<QuizStartResponse>("/interview/quiz", body);
  return res.data;
}

export async function submitQuizInterview(body: QuizSubmitBody): Promise<QuizSubmitResponse> {
  const res = await api.post<QuizSubmitResponse>("/interview/quiz/submit", body);
  return res.data;
}

export async function generateFeedback(body: FeedbackBody): Promise<FeedbackResponse> {
  const res = await api.post<FeedbackResponse>("/feedback/generate", body);
  return res.data;
}

export async function listInterviews(limit = 20): Promise<{ items: InterviewListItem[]; total: number }> {
  const res = await api.get<{ items: InterviewListItem[]; total: number }>("/interview/list", {
    params: { limit },
  });
  return res.data;
}
