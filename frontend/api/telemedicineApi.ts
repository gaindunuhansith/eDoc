import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { TELEMEDICINE_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";
import { useStore } from "../store/store";

// ─── Utility Functions ────────────────────────────────────────────────────────
export const checkTelemedicineAccess = () => {
  const user = useStore.getState().user;
  if (!user) {
    throw new Error("Authentication required for telemedicine access");
  }
  if (!["PATIENT", "DOCTOR"].includes(user.role)) {
    throw new Error("Only patients and doctors can access telemedicine features");
  }
  return user;
};

export type SessionStatus =
  | "SCHEDULED"
  | "ACTIVE"
  | "ENDED"
  | "CANCELLED";

export interface TelemedicineSession {
  id: string;
  appointmentId: string;
  doctorId: string;
  patientId: string;
  status: SessionStatus;
  roomName?: string;
  startedAt?: string;
  endedAt?: string;
  scheduledAt: string;
  durationMinutes?: number;
}

export interface SessionToken {
  token: string;
  roomName: string;
  expiresAt: string;
}

export interface CreateSessionPayload {
  appointmentId: string;
  scheduledAt: string;
}

export const fetchAllSessions = () => {
  checkTelemedicineAccess();
  return apiClient.get<TelemedicineSession[]>(TELEMEDICINE_ENDPOINTS.SESSIONS);
};

export const fetchSessionByAppointmentId = (appointmentId: string) => {
  checkTelemedicineAccess();
  return apiClient.get<TelemedicineSession>(
    TELEMEDICINE_ENDPOINTS.SESSION_BY_APPOINTMENT_ID(appointmentId)
  );
};

export const createSession = (payload: CreateSessionPayload) => {
  checkTelemedicineAccess();
  return apiClient.post<TelemedicineSession>(
    TELEMEDICINE_ENDPOINTS.CREATE_SESSION,
    payload
  );
};

export const startSession = (appointmentId: string) => {
  checkTelemedicineAccess();
  return apiClient.put<TelemedicineSession>(
    TELEMEDICINE_ENDPOINTS.START_SESSION(appointmentId)
  );
};

export const endSession = (appointmentId: string) => {
  checkTelemedicineAccess();
  return apiClient.put<TelemedicineSession>(TELEMEDICINE_ENDPOINTS.END_SESSION(appointmentId));
};

export const fetchSessionToken = (appointmentId: string) => {
  const user = checkTelemedicineAccess();
  return apiClient.get<SessionToken>(
    `${TELEMEDICINE_ENDPOINTS.SESSION_TOKEN(appointmentId)}?userId=${user.userId}`
  );
};

export const deleteSession = (appointmentId: string) => {
  checkTelemedicineAccess();
  return apiClient.delete(TELEMEDICINE_ENDPOINTS.DELETE_SESSION(appointmentId));
};

export const useGetAllSessions = () =>
  useQuery({
    queryKey: queryKeys.telemedicine.sessions(),
    queryFn: () => fetchAllSessions().then((r) => r.data),
  });

export const useGetSessionByAppointmentId = (appointmentId: string) =>
  useQuery({
    queryKey: queryKeys.telemedicine.session(appointmentId),
    queryFn: () => fetchSessionByAppointmentId(appointmentId).then((r) => r.data),
    enabled: !!appointmentId,
  });

export const useGetSessionToken = (appointmentId: string) => {
  const userId = useStore((state) => state.user?.userId);
  return useQuery({
    queryKey: queryKeys.telemedicine.token(appointmentId),
    queryFn: () => fetchSessionToken(appointmentId).then((r) => r.data),
    enabled: !!appointmentId && !!userId,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });
};

export const useCreateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.sessions() });
    },
  });
};

export const useStartSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => startSession(appointmentId),
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: queryKeys.telemedicine.session(data.data.appointmentId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.sessions() });
    },
  });
};

export const useEndSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => endSession(appointmentId),
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: queryKeys.telemedicine.session(data.data.appointmentId),
      });
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.sessions() });
    },
  });
};

export const useDeleteSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => deleteSession(appointmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.sessions() });
    },
  });
};
