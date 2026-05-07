import { api } from "./apiClient";

export type HealthResponse = {
  status: string;
  message: string;
};

export type CvUploadResponse = {
  cv_id: string;
  file_name: string;
  parsed_data: {
    skills: string[];
    experience_years?: number | null;
    education_level?: string | null;
    summary?: string;
    match_score_logic?: string;
  };
  extracted_text_preview?: string;
};

export type CompanyAnalyzeBody = {
  company_name: string;
  position: string;
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
};

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

export async function uploadCvPdf(form: FormData): Promise<CvUploadResponse> {
  const res = await api.post<CvUploadResponse>("/cv/upload", form, {
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });
  return res.data;
}

export async function analyzeCompany(body: CompanyAnalyzeBody): Promise<CompanyAnalyzeResponse> {
  const res = await api.post<CompanyAnalyzeResponse>("/company/analyze", body);
  return res.data;
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
