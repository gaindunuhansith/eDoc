import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { PATIENT_ENDPOINTS, REPORT_ENDPOINTS, PRESCRIPTION_PATIENT_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

// ─── Types ───────────────────────────────────────────────────────────────────

export type PatientStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export interface Patient {
  id: number;
  userId: string;
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

// ─── Medical Reports ──────────────────────────────────────────────────────────

export interface MedicalReport {
  id: number;
  patientId: number;
  reportName: string;
  reportType: string;
  doctorId?: string;
  appointmentId?: string;
  notes?: string;
  createdAt: string;
}

export const fetchMyReports = () =>
  apiClient.get<MedicalReport[]>(REPORT_ENDPOINTS.MY_REPORTS);

export const uploadReport = (formData: FormData) =>
  apiClient.post<MedicalReport>(REPORT_ENDPOINTS.UPLOAD, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteReport = (id: number) =>
  apiClient.delete(REPORT_ENDPOINTS.MY_REPORT(id));

export const getReportDownloadUrl = (id: number) =>
  REPORT_ENDPOINTS.DOWNLOAD(id);

export const useGetMyReports = () =>
  useQuery({
    queryKey: queryKeys.patient.reports(),
    queryFn: () => fetchMyReports().then((r) => r.data),
    retry: false,
  });

export const useUploadReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patient.reports() });
    },
  });
};

export const useDeleteReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patient.reports() });
    },
  });
};

// ─── Prescriptions ────────────────────────────────────────────────────────────

export interface Medicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  doctorId?: string;
  patientId?: string;
  appointmentId?: string;
  diagnosis?: string;
  notes?: string;
  medicines?: Medicine[];
  issuedAt?: string;
  validUntil?: string;
}

export const fetchMyPrescriptions = () =>
  apiClient.get<Prescription[]>(PRESCRIPTION_PATIENT_ENDPOINTS.MY_PRESCRIPTIONS);

export const useGetMyPrescriptions = () =>
  useQuery({
    queryKey: queryKeys.patient.prescriptions(),
    queryFn: () => fetchMyPrescriptions().then((r) => r.data),
    retry: false,
  });
