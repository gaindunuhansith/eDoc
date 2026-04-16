import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { FEEDBACK_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";
export interface Feedback {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  rating: number; // 1–5
  comment?: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface CreateFeedbackPayload {
  doctorId: string;
  appointmentId?: string;
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
}

export type UpdateFeedbackPayload = Partial<
  Omit<CreateFeedbackPayload, "doctorId">
>;


export const fetchAllFeedback = () =>
  apiClient.get<Feedback[]>(FEEDBACK_ENDPOINTS.GET_ALL);

export const fetchFeedbackById = (id: string) =>
  apiClient.get<Feedback>(FEEDBACK_ENDPOINTS.GET_BY_ID(id));

export const fetchFeedbackByDoctor = (doctorId: string) =>
  apiClient.get<Feedback[]>(FEEDBACK_ENDPOINTS.BY_DOCTOR(doctorId));

export const createFeedback = (payload: CreateFeedbackPayload) =>
  apiClient.post<Feedback>(FEEDBACK_ENDPOINTS.CREATE, payload);

export const updateFeedback = ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateFeedbackPayload;
}) => apiClient.put<Feedback>(FEEDBACK_ENDPOINTS.UPDATE(id), payload);

export const deleteFeedback = (id: string) =>
  apiClient.delete(FEEDBACK_ENDPOINTS.DELETE(id));

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

export const useGetFeedbackByDoctor = (doctorId: string) =>
  useQuery({
    queryKey: queryKeys.feedback.byDoctor(doctorId),
    queryFn: () => fetchFeedbackByDoctor(doctorId).then((r) => r.data),
    enabled: !!doctorId,
  });

export const useCreateFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFeedback,
    onSuccess: (_, { doctorId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.feedback.lists() });
      qc.invalidateQueries({ queryKey: queryKeys.feedback.byDoctor(doctorId) });
    },
  });
};

export const useUpdateFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateFeedback,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.feedback.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.feedback.lists() });
    },
  });
};

export const useDeleteFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFeedback,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.feedback.lists() });
    },
  });
};
