import { useMutation } from "@tanstack/react-query";
import apiClient from "./utils/axiosInstance";
import { AI_ENDPOINTS } from "./utils/endpoints";

// --- Types ---

export interface PatientAnalysisRequest {
  patient_id: string;
  symptoms: string;
  description?: string;
}

export interface PatientAnalysisResponse {
  patient_summary?: Record<string, any>;
  analysis: string;
  recommended_actions: string[];
  recommended_specialty: string;
  available_doctors: any[];
  service_errors: string[];
}

export interface DoctorAnalysisRequest {
  patient_id: string;
  professional_notes: string;
}

export interface DoctorAnalysisResponse {
  patient_summary?: Record<string, any>;
  clinical_analysis: string;
  differential_diagnosis: string[];
  investigation_recommendations: string[];
  service_errors: string[];
}

export interface AdminAnalysisRequest {
  query: string;
}

export interface AdminAnalysisResponse {
  operational_insight: string;
  actionable_metrics: string[];
  service_errors: string[];
}

// --- API Functions ---

export const analyzePatient = (payload: PatientAnalysisRequest) =>
  apiClient.post<PatientAnalysisResponse>(AI_ENDPOINTS.PATIENT_ANALYZE, payload);

export const analyzeDoctor = (payload: DoctorAnalysisRequest) =>
  apiClient.post<DoctorAnalysisResponse>(AI_ENDPOINTS.DOCTOR_ANALYZE, payload);

export const analyzeAdmin = (payload: AdminAnalysisRequest) =>
  apiClient.post<AdminAnalysisResponse>(AI_ENDPOINTS.ADMIN_ANALYZE, payload);

// --- Hooks ---

export const useAnalyzePatient = () => {
  return useMutation({
    mutationFn: (payload: PatientAnalysisRequest) => analyzePatient(payload).then((r) => r.data),
  });
};

export const useAnalyzeDoctor = () => {
  return useMutation({
    mutationFn: (payload: DoctorAnalysisRequest) => analyzeDoctor(payload).then((r) => r.data),
  });
};

export const useAnalyzeAdmin = () => {
  return useMutation({
    mutationFn: (payload: AdminAnalysisRequest) => analyzeAdmin(payload).then((r) => r.data),
  });
};
