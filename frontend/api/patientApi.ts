import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { PATIENT_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PatientStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface Patient {
  id: number;
  userId: number;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  bloodGroup?: string;
  nicNumber?: string;
  allergies?: string;
  emergencyContactPhone?: string;
  height?: number;
  weight?: number;
  status: PatientStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientPayload {
  phone?: string;
  dateOfBirth?: string; // "YYYY-MM-DD"
  address?: string;
  gender?: string;
  bloodGroup?: string;
  nicNumber?: string;
  allergies?: string;
  emergencyContactPhone?: string;
  height?: number;
  weight?: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

export const registerPatient = (payload: PatientPayload) =>
  apiClient.post<Patient>(PATIENT_ENDPOINTS.REGISTER, payload);

export const fetchMyPatientProfile = () =>
  apiClient.get<Patient>(PATIENT_ENDPOINTS.ME);

export const updateMyPatientProfile = (payload: PatientPayload) =>
  apiClient.put<Patient>(PATIENT_ENDPOINTS.UPDATE_ME, payload);

// ─── Hooks ────────────────────────────────────────────────────────────────────

export const useRegisterPatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registerPatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patient.me() });
    },
  });
};

export const useGetMyPatientProfile = () =>
  useQuery({
    queryKey: queryKeys.patient.me(),
    queryFn: () => fetchMyPatientProfile().then((r) => r.data),
    retry: false,
  });

export const useUpdateMyPatientProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateMyPatientProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patient.me() });
    },
  });
};
