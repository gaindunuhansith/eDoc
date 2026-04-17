import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { PATIENT_ENDPOINTS, REPORT_ENDPOINTS, PRESCRIPTION_PATIENT_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;        // UUID
  userId: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  bloodGroup?: string;
  nicNumber?: string;
  allergies?: string;
  emergencyContactPhone?: string;
  height?: number;
  weight?: number;
  deleted: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  deletedBy?: string | null;  // UUID of actor
  deletionReason?: string | null;
  // Enriched from user-service by admin endpoints.
  userName?: string | null;
  userEmail?: string | null;
}

export interface PatientPayload {
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
    queryFn: async () => {
      try {
        const res = await fetchMyPatientProfile();
        return res.data;
      } catch (err: any) {
        // Axios interceptor attaches .status to the thrown Error
        if (err?.status === 404) return null;
        throw err;
      }
    },
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

// ─── Admin Patient Management ────────────────────────────────────────────────

export interface AdminPatientStatusPayload {
  deleted: boolean;
  reason?: string;
}

export const fetchAdminAllPatients = () =>
  apiClient.get<Patient[]>(PATIENT_ENDPOINTS.ADMIN_ALL);

export const fetchAdminPatientById = (id: string) =>
  apiClient.get<Patient>(PATIENT_ENDPOINTS.ADMIN_BY_ID(id));

export const adminUpdatePatientStatus = (id: string, payload: AdminPatientStatusPayload) =>
  apiClient.patch<Patient>(PATIENT_ENDPOINTS.ADMIN_UPDATE_STATUS(id), payload);

export const useGetAdminAllPatients = () =>
  useQuery({
    queryKey: queryKeys.patient.adminList(),
    queryFn: () => fetchAdminAllPatients().then((r) => r.data),
  });

export const useGetAdminPatientById = (id: string | null) =>
  useQuery({
    queryKey: queryKeys.patient.adminDetail(id!),
    queryFn: () => fetchAdminPatientById(id!).then((r) => r.data),
    enabled: id !== null,
  });

export const useAdminUpdatePatientStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminPatientStatusPayload }) =>
      adminUpdatePatientStatus(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.patient.adminList() });
      qc.invalidateQueries({ queryKey: queryKeys.patient.adminDetail(id) });
    },
  });
};

// ─── Medical Reports ──────────────────────────────────────────────────────────

export interface MedicalReport {
  id: string;        // UUID
  patientId: string; // UUID
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

export const deleteReport = (id: string) =>
  apiClient.delete(REPORT_ENDPOINTS.MY_REPORT(id));

export const getReportDownloadUrl = (id: string) =>
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
