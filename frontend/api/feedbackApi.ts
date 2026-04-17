import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { FEEDBACK_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

// ─── Types ───────────────────────────────────────────────────────────────────

export type FeedbackStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface Feedback {
  id: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  appointmentId: number;
  rating: number;
  comment?: string;
  timestamp: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedbackPayload {
  appointmentId: number;
  doctorId: number;
  rating: number;
  comment?: string;
}

export interface UpdateFeedbackPayload {
  rating?: number;
  comment?: string;
  status?: FeedbackStatus;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const submitFeedback = (payload: FeedbackPayload) =>
  apiClient.post<Feedback>(FEEDBACK_ENDPOINTS.SUBMIT, payload);

export const fetchFeedbackById = (id: string) =>
  apiClient.get<Feedback>(FEEDBACK_ENDPOINTS.GET_BY_ID(id));

export const fetchFeedbackByPatient = (patientId: string) =>
  apiClient.get<Feedback[]>(FEEDBACK_ENDPOINTS.BY_PATIENT(patientId));

export const fetchFeedbackByDoctor = (doctorId: string) =>
  apiClient.get<Feedback[]>(FEEDBACK_ENDPOINTS.BY_DOCTOR(doctorId));

export const fetchFeedbackByAppointment = (appointmentId: string) =>
  apiClient.get<Feedback>(FEEDBACK_ENDPOINTS.BY_APPOINTMENT(appointmentId));

export const updateFeedback = (id: string, payload: UpdateFeedbackPayload) =>
  apiClient.put<Feedback>(FEEDBACK_ENDPOINTS.UPDATE(id), payload);

export const deleteFeedback = (id: string) =>
  apiClient.delete(FEEDBACK_ENDPOINTS.DELETE(id));

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useSubmitFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitFeedback,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.feedback.byPatient(String(data.data.patientId)) });
      qc.invalidateQueries({ queryKey: queryKeys.feedback.byDoctor(String(data.data.doctorId)) });
    },
  });
};

export const useGetFeedbackById = (id: string) =>
  useQuery({
    queryKey: queryKeys.feedback.detail(id),
    queryFn: () => fetchFeedbackById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useGetFeedbackByPatient = (patientId: string) =>
  useQuery({
    queryKey: queryKeys.feedback.byPatient(patientId),
    queryFn: () => fetchFeedbackByPatient(patientId).then((r) => r.data),
    enabled: !!patientId,
  });

export const useGetFeedbackByDoctor = (doctorId: string) =>
  useQuery({
    queryKey: queryKeys.feedback.byDoctor(doctorId),
    queryFn: () => fetchFeedbackByDoctor(doctorId).then((r) => r.data),
    enabled: !!doctorId,
  });

export const useGetFeedbackByAppointment = (appointmentId: string) =>
  useQuery({
    queryKey: queryKeys.feedback.detail(appointmentId),
    queryFn: () => fetchFeedbackByAppointment(appointmentId).then((r) => r.data),
    enabled: !!appointmentId,
  });

export const useUpdateFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFeedbackPayload }) =>
      updateFeedback(id, payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.feedback.detail(data.data.id.toString()) });
      qc.invalidateQueries({ queryKey: queryKeys.feedback.byPatient(String(data.data.patientId)) });
      qc.invalidateQueries({ queryKey: queryKeys.feedback.byDoctor(String(data.data.doctorId)) });
    },
  });
};

export const useDeleteFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feedback.all });
    },
  });
};
