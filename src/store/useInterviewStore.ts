import { create } from "zustand";
import type { ClassicEvaluateResponse, QuizSubmitResponse } from "../services/api";

type InterviewState = {
  lastSessionId: string | null;
  lastMode: "classic" | "quiz" | null;
  classicResult: ClassicEvaluateResponse | null;
  quizResult: QuizSubmitResponse | null;
  setClassicOutcome: (sessionId: string, payload: ClassicEvaluateResponse) => void;
  setQuizOutcome: (sessionId: string, payload: QuizSubmitResponse) => void;
  clearOutcomes: () => void;
};

export const useInterviewStore = create<InterviewState>((set) => ({
  lastSessionId: null,
  lastMode: null,
  classicResult: null,
  quizResult: null,
  setClassicOutcome: (sessionId, payload) =>
    set({ lastSessionId: sessionId, lastMode: "classic", classicResult: payload, quizResult: null }),
  setQuizOutcome: (sessionId, payload) =>
    set({ lastSessionId: sessionId, lastMode: "quiz", quizResult: payload, classicResult: null }),
  clearOutcomes: () =>
    set({ lastSessionId: null, lastMode: null, classicResult: null, quizResult: null }),
}));
