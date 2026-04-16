import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { DOCTOR_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  consultationFee: number;
  phoneNumber?: string;
  bio?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface DoctorAvailability {
  doctorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId?: string;
  medications: { name: string; dosage: string; frequency: string }[];
  notes?: string;
  issuedAt: string;
}

export interface CreateDoctorPayload {
  firstName: string;
  lastName: string;
  specialization: string;
  licenseNumber: string;
  yearsOfExperience: number;
  consultationFee: number;
  phoneNumber?: string;
  bio?: string;
}

export type UpdateDoctorPayload = Partial<CreateDoctorPayload>;

export interface CreatePrescriptionPayload {
  patientId: string;
  appointmentId?: string;
  medications: { name: string; dosage: string; frequency: string }[];
  notes?: string;
}

export const fetchAllDoctors = () =>
  apiClient.get<Doctor[]>(DOCTOR_ENDPOINTS.GET_ALL);

export const fetchDoctorById = (id: string) =>
  apiClient.get<Doctor>(DOCTOR_ENDPOINTS.GET_BY_ID(id));

export const createDoctor = (payload: CreateDoctorPayload) =>
  apiClient.post<Doctor>(DOCTOR_ENDPOINTS.CREATE, payload);

export const updateDoctor = ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateDoctorPayload;
}) => apiClient.put<Doctor>(DOCTOR_ENDPOINTS.UPDATE(id), payload);

export const deleteDoctor = (id: string) =>
  apiClient.delete(DOCTOR_ENDPOINTS.DELETE(id));

export const fetchDoctorAvailability = (id: string) =>
  apiClient.get<DoctorAvailability[]>(DOCTOR_ENDPOINTS.AVAILABILITY(id));

export const fetchPrescriptions = () =>
  apiClient.get<Prescription[]>(DOCTOR_ENDPOINTS.PRESCRIPTIONS);

export const fetchPrescriptionById = (id: string) =>
  apiClient.get<Prescription>(DOCTOR_ENDPOINTS.PRESCRIPTION_BY_ID(id));

export const createPrescription = (payload: CreatePrescriptionPayload) =>
  apiClient.post<Prescription>(DOCTOR_ENDPOINTS.CREATE_PRESCRIPTION, payload);

export const updatePrescription = ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<CreatePrescriptionPayload>;
}) =>
  apiClient.put<Prescription>(
    DOCTOR_ENDPOINTS.UPDATE_PRESCRIPTION(id),
    payload
  );


export const useGetAllDoctors = () =>
  useQuery({
    queryKey: queryKeys.doctor.lists(),
    queryFn: () => fetchAllDoctors().then((r) => r.data),
  });

export const useGetDoctorById = (id: string) =>
  useQuery({
    queryKey: queryKeys.doctor.detail(id),
    queryFn: () => fetchDoctorById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useGetDoctorAvailability = (id: string) =>
  useQuery({
    queryKey: queryKeys.doctor.availability(id),
    queryFn: () => fetchDoctorAvailability(id).then((r) => r.data),
    enabled: !!id,
  });

export const useGetAllPrescriptions = () =>
  useQuery({
    queryKey: queryKeys.doctor.prescriptions.all,
    queryFn: () => fetchPrescriptions().then((r) => r.data),
  });

export const useGetPrescriptionById = (id: string) =>
  useQuery({
    queryKey: queryKeys.doctor.prescriptions.detail(id),
    queryFn: () => fetchPrescriptionById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.doctor.lists() });
    },
  });
};

export const useUpdateDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDoctor,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.doctor.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.doctor.lists() });
    },
  });
};

export const useDeleteDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.doctor.lists() });
    },
  });
};

export const useCreatePrescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPrescription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.doctor.prescriptions.all });
    },
  });
};

export const useUpdatePrescription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePrescription,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({
        queryKey: queryKeys.doctor.prescriptions.detail(id),
      });
    },
  });
};
