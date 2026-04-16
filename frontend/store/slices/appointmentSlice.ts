import { StateCreator } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export type CalendarView = "month" | "week" | "day";

export interface AppointmentSlice {
  // State
  selectedAppointmentId: string | null;
  calendarView: CalendarView;
  calendarDate: string; // ISO date string (YYYY-MM-DD)
  appointmentFilter: {
    status: string;
    type: string;
    page: number;
  };

  // Actions
  setSelectedAppointment: (id: string | null) => void;
  setCalendarView: (view: CalendarView) => void;
  setCalendarDate: (date: string) => void;
  setAppointmentFilter: (
    filter: Partial<AppointmentSlice["appointmentFilter"]>
  ) => void;
  resetAppointmentFilter: () => void;
}

const defaultFilter = { status: "", type: "", page: 1 };

// ─── Slice ────────────────────────────────────────────────────────────────────
export const createAppointmentSlice: StateCreator<
  AppointmentSlice,
  [],
  [],
  AppointmentSlice
> = (set) => ({
  selectedAppointmentId: null,
  calendarView: "week",
  calendarDate: new Date().toISOString().split("T")[0],
  appointmentFilter: defaultFilter,

  setSelectedAppointment: (id) => set({ selectedAppointmentId: id }),

  setCalendarView: (view) => set({ calendarView: view }),

  setCalendarDate: (date) => set({ calendarDate: date }),

  setAppointmentFilter: (filter) =>
    set((state) => ({
      appointmentFilter: { ...state.appointmentFilter, ...filter },
    })),

  resetAppointmentFilter: () => set({ appointmentFilter: defaultFilter }),
});
