import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { APPOINTMENT_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: AppointmentStatus;
  type: "IN_PERSON" | "TELEMEDICINE";
  reason?: string;
  notes?: string;
  createdAt: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  durationMinutes: number;
  type: "IN_PERSON" | "TELEMEDICINE";
  reason?: string;
}

export type UpdateAppointmentPayload = Partial<CreateAppointmentPayload>;

export const fetchAllAppointments = () =>
  apiClient.get<Appointment[]>(APPOINTMENT_ENDPOINTS.GET_ALL);

export const fetchAppointmentById = (id: string) =>
  apiClient.get<Appointment>(APPOINTMENT_ENDPOINTS.GET_BY_ID(id));

export const createAppointment = (payload: CreateAppointmentPayload) =>
  apiClient.post<Appointment>(APPOINTMENT_ENDPOINTS.CREATE, payload);

export const updateAppointment = ({
  id,
  payload,
}: {
  id: string;
  payload: UpdateAppointmentPayload;
}) =>
  apiClient.put<Appointment>(APPOINTMENT_ENDPOINTS.UPDATE(id), payload);

export const cancelAppointment = (id: string) =>
  apiClient.patch(APPOINTMENT_ENDPOINTS.CANCEL(id));

export const confirmAppointment = (id: string) =>
  apiClient.patch(APPOINTMENT_ENDPOINTS.CONFIRM(id));

export const fetchAppointmentsByPatient = (patientId: string) =>
  apiClient.get<Appointment[]>(APPOINTMENT_ENDPOINTS.BY_PATIENT(patientId));

export const fetchAppointmentsByDoctor = (doctorId: string) =>
  apiClient.get<Appointment[]>(APPOINTMENT_ENDPOINTS.BY_DOCTOR(doctorId));

export const useGetAllAppointments = () =>
  useQuery({
    queryKey: queryKeys.appointment.lists(),
    queryFn: () => fetchAllAppointments().then((r) => r.data),
  });

export const useGetAppointmentById = (id: string) =>
  useQuery({
    queryKey: queryKeys.appointment.detail(id),
    queryFn: () => fetchAppointmentById(id).then((r) => r.data),
    enabled: !!id,
  });

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

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointment.all });
    },
  });
};

export const useUpdateAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAppointment,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.appointment.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.appointment.lists() });
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

export const useConfirmAppointment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: confirmAppointment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.appointment.all });
    },
  });
};
