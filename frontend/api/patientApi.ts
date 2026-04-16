import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { PATIENT_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: string;
  address?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface MedicalHistory {
  id: string;
  patientId: string;
  condition: string;
  diagnosedDate: string;
  notes?: string;
}

export interface CreatePatientPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: string;
  address?: string;
  phoneNumber?: string;
  emergencyContact?: string;
}

export type UpdatePatientPayload = Partial<CreatePatientPayload>;

export const fetchAllPatients = () =>
  apiClient.get<Patient[]>(PATIENT_ENDPOINTS.GET_ALL);

export const fetchPatientById = (id: string) =>
  apiClient.get<Patient>(PATIENT_ENDPOINTS.GET_BY_ID(id));

export const createPatient = (payload: CreatePatientPayload) =>
  apiClient.post<Patient>(PATIENT_ENDPOINTS.CREATE, payload);

export const updatePatient = ({
  id,
  payload,
}: {
  id: string;
  payload: UpdatePatientPayload;
}) => apiClient.put<Patient>(PATIENT_ENDPOINTS.UPDATE(id), payload);

export const deletePatient = (id: string) =>
  apiClient.delete(PATIENT_ENDPOINTS.DELETE(id));

export const fetchMedicalHistory = (id: string) =>
  apiClient.get<MedicalHistory[]>(PATIENT_ENDPOINTS.MEDICAL_HISTORY(id));

export const useGetAllPatients = () =>
  useQuery({
    queryKey: queryKeys.patient.lists(),
    queryFn: () => fetchAllPatients().then((r) => r.data),
  });

export const useGetPatientById = (id: string) =>
  useQuery({
    queryKey: queryKeys.patient.detail(id),
    queryFn: () => fetchPatientById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useGetMedicalHistory = (patientId: string) =>
  useQuery({
    queryKey: queryKeys.patient.medicalHistory(patientId),
    queryFn: () => fetchMedicalHistory(patientId).then((r) => r.data),
    enabled: !!patientId,
  });

export const useCreatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patient.lists() });
    },
  });
};

export const useUpdatePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePatient,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.patient.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.patient.lists() });
    },
  });
};

export const useDeletePatient = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patient.lists() });
    },
  });
};
