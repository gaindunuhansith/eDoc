import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { APPOINTMENT_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AppointmentType = "IN_PERSON" | "VIDEO";

export type PaymentStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "PAID"
  | "REFUNDED";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName?: string;
  doctorSpecialty?: string;
  doctorHospital?: string;
  consultationFee?: number;
  appointmentDate: string;   // LocalDate → "YYYY-MM-DD"
  timeSlot: string;          // e.g. "09:00-09:30"
  dayOfWeek: string;         // e.g. "MONDAY"
  type: AppointmentType;
  status: AppointmentStatus;
  reasonForVisit?: string;
  doctorNotes?: string;
  createdAt: string;
  updatedAt?: string;
  videoSessionLink?: string;
  cancellationReason?: string;
  paymentStatus?: PaymentStatus;
  paymentId?: string;
  paymentDate?: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  doctorId: string;
  appointmentDate: string;   // "YYYY-MM-DD"
  timeSlot: string;          // "09:00-09:30"
  dayOfWeek: string;         // "MONDAY"
  type: AppointmentType;
  reasonForVisit?: string;
}

export const fetchAppointmentsByPatient = (patientId: string) =>
  apiClient.get<Appointment[]>(APPOINTMENT_ENDPOINTS.BY_PATIENT(patientId));

export const fetchAppointmentsByDoctor = (doctorId: string) =>
  apiClient.get<Appointment[]>(APPOINTMENT_ENDPOINTS.BY_DOCTOR(doctorId));

export const fetchAppointmentById = (id: string) =>
  apiClient.get<Appointment>(APPOINTMENT_ENDPOINTS.GET_BY_ID(id));

export const createAppointment = (payload: CreateAppointmentPayload) =>
  apiClient.post<Appointment>(APPOINTMENT_ENDPOINTS.CREATE, payload);

export const cancelAppointment = ({
  id,
  reason,
}: {
  id: string;
  reason?: string;
}) => {
  const url = reason
    ? `${APPOINTMENT_ENDPOINTS.CANCEL(id)}?reason=${encodeURIComponent(reason)}`
    : APPOINTMENT_ENDPOINTS.CANCEL(id);
  return apiClient.delete<Appointment>(url);
};

export interface AppointmentStatusUpdate {
  status: AppointmentStatus;
  doctorNotes?: string;
  cancellationReason?: string;
  videoSessionLink?: string;
}

export const updateAppointmentStatus = ({
  id,
  update,
}: {
  id: string;
  update: AppointmentStatusUpdate;
}) => apiClient.patch<Appointment>(APPOINTMENT_ENDPOINTS.UPDATE_STATUS(id), update);

export const fetchPendingAppointmentsByDoctor = (doctorId: string) =>
  apiClient.get<Appointment[]>(APPOINTMENT_ENDPOINTS.PENDING_BY_DOCTOR(doctorId));

export const useGetAppointmentsByPatient = (patientId: string) =>
  useQuery({
    queryKey: queryKeys.appointment.byPatient(patientId),
    queryFn: () => fetchAppointmentsByPatient(patientId).then((r) => r.data),
    enabled: !!patientId,
  });

export const useGetAppointmentsByDoctor = (doctorId: string) =>
  useQuery({
    queryKey: queryKeys.appointment.byDoctor(doctorId),
    queryFn: () => fetchAppointmentsByDoctor(doctorId).then((r) => r.data),
    enabled: !!doctorId,
  });

export const useGetAppointmentById = (id: string) =>
  useQuery({
    queryKey: queryKeys.appointment.detail(id),
    queryFn: () => fetchAppointmentById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointment.all });
    },
  });
};

export const useCancelAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointment.all });
    },
  });
};

export const useUpdateAppointmentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAppointmentStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointment.all });
    },
  });
};

export const useGetPendingAppointmentsByDoctor = (doctorId: string) =>
  useQuery({
    queryKey: queryKeys.appointment.pendingByDoctor(doctorId),
    queryFn: () => fetchPendingAppointmentsByDoctor(doctorId).then((r) => r.data),
    enabled: !!doctorId,
  });
