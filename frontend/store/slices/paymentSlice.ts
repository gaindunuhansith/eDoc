import { StateCreator } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export type PaymentStep = "idle" | "initiating" | "processing" | "confirming" | "done" | "failed";

export interface PaymentSlice {
  // State
  activePaymentId: string | null;
  paymentStep: PaymentStep;
  pendingAppointmentId: string | null;
  pendingAmount: number | null;

  // Actions
  setActivePayment: (id: string | null) => void;
  setPaymentStep: (step: PaymentStep) => void;
  setPendingPayment: (appointmentId: string, amount: number) => void;
  resetPayment: () => void;
}

// ─── Slice ────────────────────────────────────────────────────────────────────
export const createPaymentSlice: StateCreator<
  PaymentSlice,
  [],
  [],
  PaymentSlice
> = (set) => ({
  activePaymentId: null,
  paymentStep: "idle",
  pendingAppointmentId: null,
  pendingAmount: null,

  setActivePayment: (id) => set({ activePaymentId: id }),

  setPaymentStep: (step) => set({ paymentStep: step }),

  setPendingPayment: (appointmentId, amount) =>
    set({
      pendingAppointmentId: appointmentId,
      pendingAmount: amount,
      paymentStep: "initiating",
    }),

  resetPayment: () =>
    set({
      activePaymentId: null,
      paymentStep: "idle",
      pendingAppointmentId: null,
      pendingAmount: null,
    }),
});
