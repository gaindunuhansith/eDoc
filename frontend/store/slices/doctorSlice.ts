import { StateCreator } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DoctorSlice {
  // State
  selectedDoctorId: string | null;
  doctorListFilter: {
    search: string;
    specialization: string;
    availableOnly: boolean;
    page: number;
  };

  // Actions
  setSelectedDoctor: (id: string | null) => void;
  setDoctorFilter: (filter: Partial<DoctorSlice["doctorListFilter"]>) => void;
  resetDoctorFilter: () => void;
}

const defaultFilter = {
  search: "",
  specialization: "",
  availableOnly: false,
  page: 1,
};

// ─── Slice ────────────────────────────────────────────────────────────────────
export const createDoctorSlice: StateCreator<
  DoctorSlice,
  [],
  [],
  DoctorSlice
> = (set) => ({
  selectedDoctorId: null,
  doctorListFilter: defaultFilter,

  setSelectedDoctor: (id) => set({ selectedDoctorId: id }),

  setDoctorFilter: (filter) =>
    set((state) => ({
      doctorListFilter: { ...state.doctorListFilter, ...filter },
    })),

  resetDoctorFilter: () => set({ doctorListFilter: defaultFilter }),
});
