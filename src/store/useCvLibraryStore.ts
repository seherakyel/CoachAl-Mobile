import { create } from "zustand";
import type { CvAnalysisResponse, CvListItem } from "../services/api";
import { MAX_CV_UPLOADS } from "../schemas/cvAnalysisSchema";

type CvLibraryState = {
  items: CvListItem[];
  selectedCvId: string | null;
  cachedAnalysis: CvAnalysisResponse | null;
  setItems: (items: CvListItem[]) => void;
  setSelectedCvId: (id: string | null) => void;
  setCachedAnalysis: (a: CvAnalysisResponse | null) => void;
  canUploadMore: () => boolean;
};

export const useCvLibraryStore = create<CvLibraryState>((set, get) => ({
  items: [],
  selectedCvId: null,
  cachedAnalysis: null,
  setItems: (items) => set({ items }),
  setSelectedCvId: (id) => set({ selectedCvId: id }),
  setCachedAnalysis: (a) => set({ cachedAnalysis: a }),
  canUploadMore: () => get().items.length < MAX_CV_UPLOADS,
}));
