import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { AI_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";


export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatPayload {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  timestamp: string;
}

export interface SymptomCheckPayload {
  symptoms: string[];
  patientAge?: number;
  patientGender?: string;
}

export interface SymptomCheckResponse {
  possibleConditions: { name: string; probability: number }[];
  recommendation: string;
  urgencyLevel: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
}

export interface DiagnosisPayload {
  symptoms: string[];
  medicalHistory?: string[];
  currentMedications?: string[];
  patientAge?: number;
}

export interface DiagnosisResponse {
  suggestions: { condition: string; confidence: number; notes: string }[];
  disclaimer: string;
}

export const sendChatMessage = (payload: ChatPayload) =>
  apiClient.post<ChatResponse>(AI_ENDPOINTS.CHAT, payload);

export const checkSymptoms = (payload: SymptomCheckPayload) =>
  apiClient.post<SymptomCheckResponse>(AI_ENDPOINTS.SYMPTOM_CHECK, payload);

export const getDiagnosisSuggestion = (payload: DiagnosisPayload) =>
  apiClient.post<DiagnosisResponse>(
    AI_ENDPOINTS.DIAGNOSIS_SUGGESTION,
    payload
  );

export const fetchChatHistory = () =>
  apiClient.get<ChatMessage[]>(AI_ENDPOINTS.CHAT_HISTORY);

export const clearChatHistory = () =>
  apiClient.delete(AI_ENDPOINTS.CLEAR_HISTORY);


export const useGetChatHistory = () =>
  useQuery({
    queryKey: queryKeys.ai.chatHistory(),
    queryFn: () => fetchChatHistory().then((r) => r.data),
  });

export const useSendChatMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: sendChatMessage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.ai.chatHistory() });
    },
  });
};

export const useCheckSymptoms = () =>
  useMutation({ mutationFn: checkSymptoms });

export const useGetDiagnosisSuggestion = () =>
  useMutation({ mutationFn: getDiagnosisSuggestion });

export const useClearChatHistory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: clearChatHistory,
    onSuccess: () => {
      qc.removeQueries({ queryKey: queryKeys.ai.chatHistory() });
    },
  });
};
