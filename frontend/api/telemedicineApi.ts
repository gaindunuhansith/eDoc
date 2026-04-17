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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

export const useGetSessionByAppointmentId = (appointmentId: string) =>
  useQuery({
    queryKey: queryKeys.telemedicine.session(appointmentId),
    queryFn: () => fetchSessionByAppointmentId(appointmentId).then((r) => r.data),
    enabled: !!appointmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

export const useGetSessionToken = (appointmentId: string) => {
  const userId = useStore((state) => state.user?.userId);
  return useQuery({
    queryKey: queryKeys.telemedicine.token(appointmentId, userId || ""),
    queryFn: () => fetchSessionToken(appointmentId).then((r) => r.data),
    enabled: !!appointmentId && !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - tokens expire quickly
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      // Invalidate sessions list to refetch
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.sessions() });
      // Set the new session in cache for immediate UI update
      qc.setQueryData(queryKeys.telemedicine.session(data.data.appointmentId), data.data);
    },
    onError: (error) => {
      console.error("Failed to create telemedicine session:", error);
    },
  });
};

export const useStartSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => startSession(appointmentId),
    onMutate: async (appointmentId) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: queryKeys.telemedicine.session(appointmentId) });

      // Snapshot previous value
      const previousSession = qc.getQueryData<TelemedicineSession>(
        queryKeys.telemedicine.session(appointmentId)
      );

      // Optimistically update to ACTIVE status
      if (previousSession) {
        qc.setQueryData(queryKeys.telemedicine.session(appointmentId), {
          ...previousSession,
          status: "ACTIVE" as SessionStatus,
          startedAt: new Date().toISOString(),
        });
      }

      return { previousSession, appointmentId };
    },
    onSuccess: (data) => {
      // Update with server response
      qc.setQueryData(queryKeys.telemedicine.session(data.data.appointmentId), data.data);
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.sessions() });
    },
    onError: (error, appointmentId, context) => {
      // Revert optimistic update on error
      if (context?.previousSession) {
        qc.setQueryData(
          queryKeys.telemedicine.session(appointmentId),
          context.previousSession
        );
      }
      console.error("Failed to start telemedicine session:", error);
    },
  });
};

export const useEndSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => endSession(appointmentId),
    onMutate: async (appointmentId) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: queryKeys.telemedicine.session(appointmentId) });

      // Snapshot previous value
      const previousSession = qc.getQueryData<TelemedicineSession>(
        queryKeys.telemedicine.session(appointmentId)
      );

      // Optimistically update to ENDED status
      if (previousSession) {
        qc.setQueryData(queryKeys.telemedicine.session(appointmentId), {
          ...previousSession,
          status: "ENDED" as SessionStatus,
          endedAt: new Date().toISOString(),
        });
      }

      return { previousSession, appointmentId };
    },
    onSuccess: (data) => {
      // Update with server response
      qc.setQueryData(queryKeys.telemedicine.session(data.data.appointmentId), data.data);
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.sessions() });
      // Invalidate token cache since session is ended
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.token(data.data.appointmentId, "") });
    },
    onError: (error, appointmentId, context) => {
      // Revert optimistic update on error
      if (context?.previousSession) {
        qc.setQueryData(
          queryKeys.telemedicine.session(appointmentId),
          context.previousSession
        );
      }
      console.error("Failed to end telemedicine session:", error);
    },
  });
};

export const useDeleteSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appointmentId: string) => deleteSession(appointmentId),
    onSuccess: (_, appointmentId) => {
      // Remove from cache
      qc.removeQueries({ queryKey: queryKeys.telemedicine.session(appointmentId) });
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.sessions() });
      // Invalidate token cache
      qc.invalidateQueries({ queryKey: queryKeys.telemedicine.token(appointmentId, "") });
    },
    onError: (error) => {
      console.error("Failed to delete telemedicine session:", error);
    },
  });
};

// ─── Composite Hooks ──────────────────────────────────────────────────────────
export const useTelemedicineSession = (appointmentId: string) => {
  const sessionQuery = useGetSessionByAppointmentId(appointmentId);
  const tokenQuery = useGetSessionToken(appointmentId);

  return {
    session: sessionQuery.data,
    token: tokenQuery.data,
    isLoading: sessionQuery.isLoading || tokenQuery.isLoading,
    error: sessionQuery.error || tokenQuery.error,
    refetch: () => {
      sessionQuery.refetch();
      tokenQuery.refetch();
    },
  };
};

export const useCanJoinSession = (appointmentId: string) => {
  const { user } = useStore();
  const { session, isLoading } = useTelemedicineSession(appointmentId);

  if (isLoading || !session || !user) return false;

  const now = new Date();
  const scheduledTime = new Date(session.scheduledAt);
  const timeDiff = Math.abs(now.getTime() - scheduledTime.getTime());
  const isWithinTimeWindow = timeDiff <= 15 * 60 * 1000; // 15 minutes

  const isParticipant = session.patientId === user.userId || session.doctorId === user.userId;
  const isActive = session.status === "ACTIVE";

  return isParticipant && (isActive || isWithinTimeWindow);
};
