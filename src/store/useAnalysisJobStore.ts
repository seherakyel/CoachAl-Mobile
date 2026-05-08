import { create } from "zustand";
import {
  scoreAlignment,
  generateFeedback,
  type AlignmentScoreResponse,
  type FeedbackResponse,
} from "../services/api";

export type AnalysisJob = {
  id: string;
  cvId: string;
  profileId: string;
  companyName: string;
  positionTitle: string;
  status: "running" | "done" | "error";
  result: AlignmentScoreResponse | null;
  feedback: FeedbackResponse | null;
  error: string | null;
  startedAt: number;
};

type Store = {
  jobs: AnalysisJob[];
  startJob: (params: {
    cvId: string;
    profileId: string;
    companyName: string;
    positionTitle: string;
  }) => void;
  removeJob: (id: string) => void;
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

let jobCounter = 0;

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

async function callWithRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      const is429 =
        e instanceof Error && /429|too many|rate/i.test(e.message);
      const isNetwork =
        e instanceof TypeError ||
        (e instanceof Error && /network|timeout/i.test(e.message));
      if ((is429 || isNetwork) && i < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (i + 1));
        continue;
      }
      throw e;
    }
  }
  throw lastErr;
}

export const useAnalysisJobStore = create<Store>((set) => ({
  jobs: [],

  startJob: ({ cvId, profileId, companyName, positionTitle }) => {
    const id = `job_${Date.now()}_${++jobCounter}`;
    const job: AnalysisJob = {
      id,
      cvId,
      profileId,
      companyName,
      positionTitle,
      status: "running",
      result: null,
      feedback: null,
      error: null,
      startedAt: Date.now(),
    };

    set((s) => ({ jobs: [job, ...s.jobs] }));

    (async () => {
      try {
        const alignResult = await callWithRetry(() =>
          scoreAlignment({ cv_id: cvId, profile_id: profileId }),
        );

        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id ? { ...j, result: alignResult } : j,
          ),
        }));

        let feedbackResult: FeedbackResponse | null = null;
        try {
          feedbackResult = await callWithRetry(() =>
            generateFeedback({ alignment_id: alignResult.result_id }),
          );
        } catch {
          // feedback optional, don't fail the whole job
        }

        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id
              ? { ...j, status: "done" as const, feedback: feedbackResult }
              : j,
          ),
        }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Analiz başarısız";
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id ? { ...j, status: "error" as const, error: msg } : j,
          ),
        }));
      }
    })();
  },

  removeJob: (id) => set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),
}));
