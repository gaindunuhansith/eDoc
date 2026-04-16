import { create } from "zustand";
import { persist } from "zustand/middleware";

import { createAiSlice, AiSlice } from "./slices/aiSlice";
import { createAppointmentSlice, AppointmentSlice } from "./slices/appointmentSlice";
import { createDashboardSlice, DashboardSlice } from "./slices/dashboardSlice";
import { createDoctorSlice, DoctorSlice } from "./slices/doctorSlice";
import { createFeedbackSlice, FeedbackSlice } from "./slices/feedbackSlice";
import { createNotificationSlice, NotificationSlice } from "./slices/notificationSlice";
import { createPatientSlice, PatientSlice } from "./slices/patientSlice";
import { createPaymentSlice, PaymentSlice } from "./slices/paymentSlice";
import { createTelemedicineSlice, TelemedicineSlice } from "./slices/telemedicineSlice";
import { createUserSlice, UserSlice } from "./slices/userSlice";
import { registerTokenAccessor } from "../api/utils/axiosInstance";

export type AppStore = UserSlice &
  PatientSlice &
  DoctorSlice &
  AppointmentSlice &
  NotificationSlice &
  FeedbackSlice &
  TelemedicineSlice &
  DashboardSlice &
  AiSlice &
  PaymentSlice;


export const useStore = create<AppStore>()(
  persist(
    (...a) => ({
      ...createUserSlice(...a),
      ...createPatientSlice(...a),
      ...createDoctorSlice(...a),
      ...createAppointmentSlice(...a),
      ...createNotificationSlice(...a),
      ...createFeedbackSlice(...a),
      ...createTelemedicineSlice(...a),
      ...createDashboardSlice(...a),
      ...createAiSlice(...a),
      ...createPaymentSlice(...a),
    }),
    {
      name: "edoc-store",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);


registerTokenAccessor(() => useStore.getState().token);


export const useUser = () => useStore((s) => s.user);
export const useToken = () => useStore((s) => s.token);
export const useIsAuthenticated = () => useStore((s) => s.isAuthenticated);
