import { create } from "zustand";
import type { AlignmentScoreResponse } from "../services/api";

type PipelineState = {
  cvId: string | null;
  cvDisplayName: string;
  profileId: string | null;
  companyName: string;
  positionTitle: string;
  cultureSummary: string | null;
  /** Şirket analizi / GET alignment ile gelen aranan profil maddeleri (web key_traits). */
  keyTraits: string[];
  industry: string | null;
  alignmentId: string | null;
  alignment: AlignmentScoreResponse | null;
  setCv: (cvId: string | null, displayName?: string | null) => void;
  setCompany: (
    profileId: string,
    companyName: string,
    positionTitle: string,
    cultureSummary?: string | null,
    keyTraits?: string[] | null,
    industry?: string | null,
  ) => void;
  resetFlow: () => void;
  hydrateFromApplication: (input: {
    cvId: string;
    profileId: string;
    alignmentId: string | null;
    companyName: string;
    positionTitle: string;
  }) => void;
  setAlignment: (alignmentId: string, payload: AlignmentScoreResponse) => void;
};

const initial = {
  cvId: null as string | null,
  cvDisplayName: "",
  profileId: null as string | null,
  companyName: "",
  positionTitle: "",
  cultureSummary: null as string | null,
  keyTraits: [] as string[],
  industry: null as string | null,
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
  setCompany: (profileId, companyName, positionTitle, cultureSummary, keyTraits, industry) =>
    set({
      profileId,
      companyName,
      positionTitle,
      cultureSummary:
        cultureSummary != null && String(cultureSummary).trim().length > 0
          ? String(cultureSummary).trim()
          : null,
      keyTraits: Array.isArray(keyTraits) ? keyTraits.map((t) => String(t).trim()).filter(Boolean) : [],
      industry: industry != null && String(industry).trim() ? String(industry).trim() : null,
    }),
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
      cultureSummary: null,
      keyTraits: [],
      industry: null,
      alignment: null,
    }),
}));
