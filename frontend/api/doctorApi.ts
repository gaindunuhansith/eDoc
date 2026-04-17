import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { DOCTOR_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

export interface Doctor {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  specialty?: string;
  qualification?: string;
  licenseNumber?: string;
  experienceYears: number;
  hospital?: string;
  bio?: string;
  profileImageUrl?: string;
  consultationFee: number;
  isVerified: boolean;
  isAvailable: boolean;
  languages?: string[];
}

export interface AvailabilityTimeSlot {
  startTime: string;  // "09:00"
  endTime: string;    // "09:30"
  isBooked: boolean;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: string;         // "MONDAY", "TUESDAY", etc.
  timeSlots: AvailabilityTimeSlot[];
  isActive: boolean;
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  doctorId: string;
  patientId: string;
  appointmentId?: string;
  diagnosis?: string;
  notes?: string;
  medicines: Medicine[];
  issuedAt: string;
  validUntil?: string;
}

export interface CreateDoctorPayload {
  id?: string;
  email?: string;
  firstName: string;
  lastName: string;
  specialty: string;
  qualification?: string;
  licenseNumber: string;
  experienceYears: number;
  hospital?: string;
  consultationFee: number;
  phoneNumber?: string;
  bio?: string;
}

export type UpdateDoctorPayload = Partial<CreateDoctorPayload>;

export interface CreatePrescriptionPayload {
  patientId: string;
  appointmentId?: string;
  diagnosis?: string;
  notes?: string;
  medicines: Medicine[];
}

export const fetchMyDoctorProfile = () =>
  apiClient.get<Doctor>(DOCTOR_ENDPOINTS.ME);

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

export const fetchDoctorsBySpecialty = (specialty: string) =>
  apiClient.get<Doctor[]>(DOCTOR_ENDPOINTS.BY_SPECIALTY(specialty));

export const fetchDoctorAvailability = (id: string) =>
  apiClient.get<DoctorAvailability[]>(DOCTOR_ENDPOINTS.AVAILABILITY(id));
export const setDoctorAvailability = (id: string, payload: { dayOfWeek: string; timeSlots: Omit<AvailabilityTimeSlot, 'isBooked'>[] }) =>
  apiClient.post<DoctorAvailability>(DOCTOR_ENDPOINTS.AVAILABILITY(id), payload);

export const deleteDoctorAvailability = (id: string, day: string) =>
  apiClient.delete(DOCTOR_ENDPOINTS.DELETE_AVAILABILITY(id, day));
export const fetchPrescriptionsByDoctor = (doctorId: string) =>
  apiClient.get<Prescription[]>(DOCTOR_ENDPOINTS.PRESCRIPTIONS_BY_DOCTOR(doctorId));

export const fetchPrescriptionById = (id: string) =>
  apiClient.get<Prescription>(DOCTOR_ENDPOINTS.PRESCRIPTION_BY_ID(id));

export const createPrescription = ({ doctorId, payload }: { doctorId: string; payload: CreatePrescriptionPayload }) =>
  apiClient.post<Prescription>(DOCTOR_ENDPOINTS.CREATE_PRESCRIPTION(doctorId), payload);

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


export const useGetMyDoctorProfile = () =>
  useQuery({
    queryKey: queryKeys.doctor.detail("me"),
    queryFn: () => fetchMyDoctorProfile().then((r) => r.data),
  });

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

export const useGetDoctorsBySpecialty = (specialty: string) =>
  useQuery({
    queryKey: ["doctor", "specialty", specialty],
    queryFn: () => fetchDoctorsBySpecialty(specialty).then((r) => r.data),
    enabled: !!specialty,
  });

export const useGetDoctorAvailability = (id: string) =>
  useQuery({
    queryKey: queryKeys.doctor.availability(id),
    queryFn: () => fetchDoctorAvailability(id).then((r) => r.data),
    enabled: !!id,
  });

export const useSetDoctorAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { dayOfWeek: string; timeSlots: Omit<AvailabilityTimeSlot, 'isBooked'>[] } }) =>
      setDoctorAvailability(id, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.doctor.availability(variables.id) });
    },
  });
};

export const useDeleteDoctorAvailability = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, day }: { id: string; day: string }) =>
      deleteDoctorAvailability(id, day),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.doctor.availability(variables.id) });
    },
  });
};

export const useGetAllPrescriptions = () =>
  useQuery({
    queryKey: queryKeys.doctor.prescriptions.all,
    queryFn: () => fetchPrescriptionsByDoctor("").then((r) => r.data),
  });

export const useGetPrescriptionsByDoctor = (doctorId: string) =>
  useQuery({
    queryKey: [...queryKeys.doctor.prescriptions.all, doctorId],
    queryFn: () => fetchPrescriptionsByDoctor(doctorId).then((r) => r.data),
    enabled: !!doctorId,
  });

export const useGetPrescriptionById = (id: string) =>
  useQuery({
    queryKey: queryKeys.doctor.prescriptions.detail(id),
    queryFn: () => fetchPrescriptionById(id).then((r) => r.data),
    enabled: !!id,
  });

export const verifyDoctor = (id: string) =>
  apiClient.patch<Doctor>(DOCTOR_ENDPOINTS.VERIFY(id));

export const useVerifyDoctor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: verifyDoctor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.doctor.lists() });
    },
  });
};

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
