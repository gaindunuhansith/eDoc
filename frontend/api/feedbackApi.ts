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
  editableUntil: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt?: string;
}

export function isFeedbackEditable(feedback: Feedback): boolean {
  if (!feedback.editableUntil) return false;
  return new Date() < new Date(feedback.editableUntil);
}

export function getEditableUntilLabel(feedback: Feedback): string {
  if (!feedback.editableUntil) return "Not editable";
  const deadline = new Date(feedback.editableUntil);
  const now = new Date();
  if (now >= deadline) return "Edit window expired";
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (diffHours > 0) return `Editable for ${diffHours}h ${diffMins}m`;
  return `Editable for ${diffMins}m`;
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

export const fetchAllFeedback = () =>
  apiClient.get<Feedback[]>(FEEDBACK_ENDPOINTS.ALL);

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

export const updateFeedbackStatus = (id: string, status: FeedbackStatus) =>
  apiClient.patch<Feedback>(FEEDBACK_ENDPOINTS.UPDATE_STATUS(id), null, { params: { status } });

export const deleteFeedback = (id: string) =>
  apiClient.delete(FEEDBACK_ENDPOINTS.DELETE(id));

// ─── Hooks ────────────────────────────────────────────────────────────────────

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useSubmitFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitFeedback,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.feedback.byPatient(String(data.data.patientId)) });
      qc.invalidateQueries({ queryKey: queryKeys.feedback.byDoctor(String(data.data.doctorId)) });
    },
    onError: (error: any) => {
      // Enhanced error handling
      if (error?.response?.status === 409) {
        throw new Error("Feedback already exists for this appointment");
      } else if (error?.response?.status === 400) {
        throw new Error("Invalid feedback data. Please check your input.");
      } else if (error?.response?.status === 404) {
        throw new Error("Appointment or doctor not found.");
      } else if (!error?.response) {
        throw new Error("Network error. Please check your connection and try again.");
      } else {
        throw new Error("Failed to submit feedback. Please try again.");
      }
    },
  });
};

export const useGetAllFeedback = () =>
  useQuery({
    queryKey: queryKeys.feedback.lists(),
    queryFn: () => fetchAllFeedback().then((r) => r.data),
  });

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
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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

export const useUpdateFeedbackStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) =>
      updateFeedbackStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feedback.lists() });
    },
  });
};

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
    onError: (error: any) => {
      if (error?.response?.status === 404) {
        throw new Error("Feedback not found.");
      } else if (error?.response?.status === 400) {
        throw new Error("Invalid feedback data. Please check your input.");
      } else if (!error?.response) {
        throw new Error("Network error. Please check your connection and try again.");
      } else {
        throw new Error("Failed to update feedback. Please try again.");
      }
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
    onError: (error: any) => {
      if (error?.response?.status === 404) {
        throw new Error("Feedback not found.");
      } else if (error?.response?.status === 403) {
        throw new Error("You don't have permission to delete this feedback.");
      } else if (!error?.response) {
        throw new Error("Network error. Please check your connection and try again.");
      } else {
        throw new Error("Failed to delete feedback. Please try again.");
      }
    },
  });
};
