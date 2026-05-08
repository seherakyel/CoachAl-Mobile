import { create } from "zustand";
import { scoreAlignment, type AlignmentScoreResponse } from "../services/api";

export type AnalysisJob = {
  id: string;
  cvId: string;
  profileId: string;
  companyName: string;
  positionTitle: string;
  status: "pending" | "running" | "done" | "error";
  result: AlignmentScoreResponse | null;
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
  clearDone: () => void;
};

let jobCounter = 0;

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
      error: null,
      startedAt: Date.now(),
    };

    set((s) => ({ jobs: [job, ...s.jobs] }));

    scoreAlignment({ cv_id: cvId, profile_id: profileId })
      .then((res) => {
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id ? { ...j, status: "done" as const, result: res } : j,
          ),
        }));
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Analiz başarısız";
        set((s) => ({
          jobs: s.jobs.map((j) =>
            j.id === id ? { ...j, status: "error" as const, error: msg } : j,
          ),
        }));
      });
  },

  removeJob: (id) => set((s) => ({ jobs: s.jobs.filter((j) => j.id !== id) })),
  clearDone: () => set((s) => ({ jobs: s.jobs.filter((j) => j.status !== "done") })),
}));
