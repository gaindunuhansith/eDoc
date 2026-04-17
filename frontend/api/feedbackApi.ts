import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { FEEDBACK_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

export interface Feedback {
  id: number;
  patientId: number;
  doctorId: number;
  appointmentId: number;
  rating: number;
  comment?: string;
  timestamp: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

export interface CreateFeedbackPayload {
  appointmentId: number;
  doctorId: number;
  rating: number;
  comment?: string;
}

export interface SubmitFeedbackArgs {
  patientId: number;
  payload: CreateFeedbackPayload;
}

export const fetchFeedbackByPatient = (patientId: string) =>
  apiClient.get<Feedback[]>(FEEDBACK_ENDPOINTS.BY_PATIENT(patientId));

export const fetchFeedbackByDoctor = (doctorId: string) =>
  apiClient.get<Feedback[]>(FEEDBACK_ENDPOINTS.BY_DOCTOR(doctorId));

export const fetchFeedbackById = (id: string) =>
  apiClient.get<Feedback>(FEEDBACK_ENDPOINTS.GET_BY_ID(id));

export const submitFeedback = ({ patientId, payload }: SubmitFeedbackArgs) =>
  apiClient.post<Feedback>(
    `${FEEDBACK_ENDPOINTS.SUBMIT}?patientId=${patientId}`,
    payload
  );

export const updateFeedback = ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<CreateFeedbackPayload>;
}) => apiClient.put<Feedback>(FEEDBACK_ENDPOINTS.UPDATE(id), payload);

export const deleteFeedback = (id: string) =>
  apiClient.delete(FEEDBACK_ENDPOINTS.DELETE(id));

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

export const useGetFeedbackById = (id: string) =>
  useQuery({
    queryKey: queryKeys.feedback.detail(id),
    queryFn: () => fetchFeedbackById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useSubmitFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: submitFeedback,
    onSuccess: (_, { patientId }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.feedback.byPatient(String(patientId)),
      });
    },
  });
};

export const useUpdateFeedback = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateFeedback,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.feedback.detail(id) });
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
