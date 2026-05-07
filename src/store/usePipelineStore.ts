import { create } from "zustand";
import type { AlignmentScoreResponse } from "../services/api";

type PipelineState = {
  cvId: string | null;
  cvDisplayName: string;
  profileId: string | null;
  companyName: string;
  positionTitle: string;
  alignmentId: string | null;
  alignment: AlignmentScoreResponse | null;
  setCv: (cvId: string | null, displayName?: string | null) => void;
  setCompany: (profileId: string, companyName: string, positionTitle: string) => void;
  setAlignment: (alignmentId: string, payload: AlignmentScoreResponse) => void;
  resetFlow: () => void;
  hydrateFromApplication: (input: {
    cvId: string;
    profileId: string;
    alignmentId: string | null;
    companyName: string;
    positionTitle: string;
  }) => void;
};

const initial = {
  cvId: null as string | null,
  cvDisplayName: "",
  profileId: null as string | null,
  companyName: "",
  positionTitle: "",
  alignmentId: null as string | null,
  alignment: null as AlignmentScoreResponse | null,
};

export const usePipelineStore = create<PipelineState>((set) => ({
  ...initial,
  setCv: (cvId, displayName) =>
    set({
      cvId,
      cvDisplayName: cvId && displayName?.trim() ? displayName.trim() : "",
    }),
  setCompany: (profileId, companyName, positionTitle) =>
    set({ profileId, companyName, positionTitle }),
  setAlignment: (alignmentId, payload) => set({ alignmentId, alignment: payload }),
  resetFlow: () => set({ ...initial }),
  hydrateFromApplication: ({ cvId, profileId, alignmentId, companyName, positionTitle }) =>
    set({
      cvId: cvId || null,
      cvDisplayName: "",
      profileId,
      alignmentId,
      companyName,
      positionTitle,
      alignment: null,
    }),
}));
