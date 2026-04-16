import { StateCreator } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FeedbackSlice {
  // State
  isFeedbackModalOpen: boolean;
  targetDoctorId: string | null;
  targetAppointmentId: string | null;
  draftRating: number;
  draftComment: string;

  // Actions
  openFeedbackModal: (doctorId: string, appointmentId?: string) => void;
  closeFeedbackModal: () => void;
  setDraftRating: (rating: number) => void;
  setDraftComment: (comment: string) => void;
  resetFeedbackDraft: () => void;
}

// ─── Slice ────────────────────────────────────────────────────────────────────
export const createFeedbackSlice: StateCreator<
  FeedbackSlice,
  [],
  [],
  FeedbackSlice
> = (set) => ({
  isFeedbackModalOpen: false,
  targetDoctorId: null,
  targetAppointmentId: null,
  draftRating: 0,
  draftComment: "",

  openFeedbackModal: (doctorId, appointmentId) =>
    set({
      isFeedbackModalOpen: true,
      targetDoctorId: doctorId,
      targetAppointmentId: appointmentId ?? null,
    }),

  closeFeedbackModal: () => set({ isFeedbackModalOpen: false }),

  setDraftRating: (rating) => set({ draftRating: rating }),

  setDraftComment: (comment) => set({ draftComment: comment }),

  resetFeedbackDraft: () =>
    set({
      isFeedbackModalOpen: false,
      targetDoctorId: null,
      targetAppointmentId: null,
      draftRating: 0,
      draftComment: "",
    }),
});
