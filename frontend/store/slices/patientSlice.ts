import { StateCreator } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PatientSlice {
  // State
  selectedPatientId: string | null;
  patientListFilter: {
    search: string;
    gender: string;
    page: number;
  };

  // Actions
  setSelectedPatient: (id: string | null) => void;
  setPatientFilter: (filter: Partial<PatientSlice["patientListFilter"]>) => void;
  resetPatientFilter: () => void;
}

const defaultFilter = { search: "", gender: "", page: 1 };

// ─── Slice ────────────────────────────────────────────────────────────────────
export const createPatientSlice: StateCreator<
  PatientSlice,
  [],
  [],
  PatientSlice
> = (set) => ({
  selectedPatientId: null,
  patientListFilter: defaultFilter,

  setSelectedPatient: (id) => set({ selectedPatientId: id }),

  setPatientFilter: (filter) =>
    set((state) => ({
      patientListFilter: { ...state.patientListFilter, ...filter },
    })),

  resetPatientFilter: () => set({ patientListFilter: defaultFilter }),
});
