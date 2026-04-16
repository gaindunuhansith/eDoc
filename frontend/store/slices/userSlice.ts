import { StateCreator } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  phoneNumber?: string;
  profilePicture?: string;
}

export interface UserSlice {
  // State
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (token: string, user: UserProfile) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<UserProfile>) => void;
}

// ─── Slice ────────────────────────────────────────────────────────────────────
export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (
  set
) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token, user) =>
    set({ token, user, isAuthenticated: true }),

  clearAuth: () =>
    set({ token: null, user: null, isAuthenticated: false }),

  updateUser: (partial) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...partial } : null,
    })),
});
