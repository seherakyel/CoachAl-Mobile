import { create } from "zustand";
import type { User } from "firebase/auth";

export type AuthPhase = "boot" | "ready";

type AuthState = {
  phase: AuthPhase;
  user: User | null;
  bootstrapError: string | null;
  setPhase: (phase: AuthPhase) => void;
  setUser: (user: User | null) => void;
  setBootstrapError: (message: string | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  phase: "boot",
  user: null,
  bootstrapError: null,
  setPhase: (phase) => set({ phase }),
  setUser: (user) => set({ user }),
  setBootstrapError: (bootstrapError) => set({ bootstrapError }),
}));
