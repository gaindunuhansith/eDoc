import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { TELEMEDICINE_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

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

export const fetchAllSessions = () =>
  apiClient.get<TelemedicineSession[]>(TELEMEDICINE_ENDPOINTS.SESSIONS);

export const fetchSessionById = (id: string) =>
  apiClient.get<TelemedicineSession>(
    TELEMEDICINE_ENDPOINTS.SESSION_BY_ID(id)
  );

export const createSession = (payload: CreateSessionPayload) =>
  apiClient.post<TelemedicineSession>(
    TELEMEDICINE_ENDPOINTS.CREATE_SESSION,
    payload
  );

export const startSession = (id: string) =>
  apiClient.patch<TelemedicineSession>(
    TELEMEDICINE_ENDPOINTS.START_SESSION(id)
  );

export const endSession = (id: string) =>
  apiClient.patch<TelemedicineSession>(TELEMEDICINE_ENDPOINTS.END_SESSION(id));

export const joinSession = (id: string) =>
  apiClient.post<TelemedicineSession>(TELEMEDICINE_ENDPOINTS.JOIN_SESSION(id));

export const fetchSessionToken = (id: string) =>
  apiClient.get<SessionToken>(TELEMEDICINE_ENDPOINTS.SESSION_TOKEN(id));

export const useGetAllSessions = () =>
  useQuery({
    queryKey: queryKeys.telemedicine.sessions(),
    queryFn: () => fetchAllSessions().then((r) => r.data),
  });

export const useGetSessionById = (id: string) =>
  useQuery({
    queryKey: queryKeys.telemedicine.session(id),
    queryFn: () => fetchSessionById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useGetSessionToken = (id: string) =>
  useQuery({
    queryKey: queryKeys.telemedicine.token(id),
    queryFn: () => fetchSessionToken(id).then((r) => r.data),
    enabled: !!id,
    staleTime: 1 * 60 * 1000,
    gcTime: 2 * 60 * 1000,
  });

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
    mutationFn: startSession,
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: queryKeys.telemedicine.session(data.data.id),
      });
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.sessions() });
    },
  });
};

export const useEndSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: endSession,
    onSuccess: (data) => {
      qc.invalidateQueries({
        queryKey: queryKeys.telemedicine.session(data.data.id),
      });
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.sessions() });
    },
  });
};

export const useJoinSession = () =>
  useMutation({ mutationFn: joinSession });
