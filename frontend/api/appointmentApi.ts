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

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface Appointment {
  id: string;
  patientId: string;
  patientUserId?: string;  // patient's userId (String UUID)
  patientName?: string;
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
  patientUserId?: string;  // patient's userId (String UUID)
  patientName?: string;
  patientEmail?: string;   // snapshotted for direct notification delivery
  patientPhone?: string;   // snapshotted for direct notification delivery
  doctorId: string;
  doctorName?: string;
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
  reason: string;
}) => {
  return apiClient.patch<Appointment>(APPOINTMENT_ENDPOINTS.CANCEL(id), { reason });
};

export const updateAppointment = ({
  id,
  update,
}: {
  id: string;
  update: Partial<CreateAppointmentPayload>;
}) => apiClient.put<Appointment>(APPOINTMENT_ENDPOINTS.UPDATE(id), update);

export const deleteAppointment = ({
  id,
}: {
  id: string;
}) => apiClient.delete<void>(APPOINTMENT_ENDPOINTS.DELETE(id));

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

export interface PaymentStatusUpdate {
  paymentStatus: PaymentStatus;
  paymentId: string;  // Reference ID from payment service
}

export const updatePaymentStatus = ({
  id,
  update,
}: {
  id: string;
  update: PaymentStatusUpdate;
}) => apiClient.patch<Appointment>(APPOINTMENT_ENDPOINTS.UPDATE_PAYMENT(id), update);

export const fetchAllAppointments = () =>
  apiClient.get<Appointment[]>(APPOINTMENT_ENDPOINTS.GET_ALL);

export const fetchAppointmentsByStatus = ({
  patientId,
  status,
}: {
  patientId: string;
  status: AppointmentStatus;
}) =>
  apiClient.get<Appointment[]>(APPOINTMENT_ENDPOINTS.BY_PATIENT_STATUS(patientId, status));

export const fetchUnpaidConfirmedAppointments = (doctorId: string) =>
  apiClient.get<Appointment[]>(APPOINTMENT_ENDPOINTS.UNPAID_BY_DOCTOR(doctorId));

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

export const useGetPendingAppointmentsByDoctor = (doctorId: string) =>
  useQuery({
    queryKey: ["appointments", "pending", doctorId],
    queryFn: () => fetchPendingAppointmentsByDoctor(doctorId).then((r) => r.data),
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

export const useUpdateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointment.all });
    },
  });
};

export const useDeleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointment.all });
    },
  });
};

export const useUpdatePaymentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePaymentStatus,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointment.all });
    },
  });
};

export const useGetAllAppointments = () =>
  useQuery({
    queryKey: queryKeys.appointment.all,
    queryFn: () => fetchAllAppointments().then((r) => r.data),
  });

export const useGetAppointmentsByStatus = ({
  patientId,
  status,
}: {
  patientId: string;
  status: AppointmentStatus;
}) =>
  useQuery({
    queryKey: ["appointments", "patient", patientId, "status", status],
    queryFn: () => fetchAppointmentsByStatus({ patientId, status }).then((r) => r.data),
    enabled: !!patientId && !!status,
  });

export const useGetUnpaidConfirmedAppointments = (doctorId: string) =>
  useQuery({
    queryKey: ["appointments", "unpaid", doctorId],
    queryFn: () => fetchUnpaidConfirmedAppointments(doctorId).then((r) => r.data),
    enabled: !!doctorId,
  });


