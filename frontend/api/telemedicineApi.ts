import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import apiClient from "./utils/axiosInstance";
import { TELEMEDICINE_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";
import { useStore } from "../store/store";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TelemedicineSession {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  patientName?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  scheduledAt: string;
  duration: number;
  status: SessionStatus;
  roomName?: string;
  notes?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionPayload {
  appointmentId: string;
  notes?: string;
}

export interface JoinTokenResponse {
  token: string;
  roomName: string;
  identity: string;
}

// ─── Error Classes ────────────────────────────────────────────────────────────
export class TelemedicineError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "TelemedicineError";
  }
}

export class AuthenticationError extends TelemedicineError {
  constructor(message = "Authentication required for telemedicine access") {
    super(message, "AUTH_REQUIRED", 401);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends TelemedicineError {
  constructor(message = "You don't have permission to access this telemedicine session") {
    super(message, "ACCESS_DENIED", 403);
    this.name = "AuthorizationError";
  }
}

export class SessionNotFoundError extends TelemedicineError {
  constructor(appointmentId: string) {
    super(
      `Telemedicine session not found for appointment ${appointmentId}`,
      "SESSION_NOT_FOUND",
      404
    );
    this.name = "SessionNotFoundError";
  }
}

export class SessionAlreadyActiveError extends TelemedicineError {
  constructor(appointmentId: string) {
    super(
      `Session for appointment ${appointmentId} is already active`,
      "SESSION_ALREADY_ACTIVE",
      409
    );
    this.name = "SessionAlreadyActiveError";
  }
}

export class NetworkError extends TelemedicineError {
  constructor(message = "Network connection failed. Please check your internet connection.") {
    super(message, "NETWORK_ERROR", 0);
    this.name = "NetworkError";
  }
}

// ─── Utility Functions ────────────────────────────────────────────────────────
export const checkTelemedicineAccess = () => {
  const user = useStore.getState().user;
  if (!user) {
    throw new AuthenticationError();
  }
  if (!["PATIENT", "DOCTOR"].includes(user.role)) {
    throw new AuthorizationError();
  }
  return user;
};

export const handleTelemedicineError = (error: unknown, context: string): TelemedicineError => {
  console.error(`Telemedicine error in ${context}:`, error);

  if (error instanceof TelemedicineError) {
    return error;
  }

  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as any;
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    switch (status) {
      case 401:
        return new AuthenticationError();
      case 403:
        return new AuthorizationError();
      case 404:
        return new SessionNotFoundError(data?.appointmentId || "unknown");
      case 409:
        if (data?.message?.includes("already active")) {
          return new SessionAlreadyActiveError(data?.appointmentId || "unknown");
        }
        return new TelemedicineError(data?.message || "Conflict error", "CONFLICT", status);
      case 500:
        return new TelemedicineError(
          "Server error occurred. Please try again later.",
          "SERVER_ERROR",
          status
        );
      default:
        return new TelemedicineError(
          data?.message || `Request failed with status ${status}`,
          "API_ERROR",
          status,
          error
        );
    }
  }

  if (error instanceof Error && error.message.includes("Network")) {
    return new NetworkError();
  }

  return new TelemedicineError(
    "An unexpected error occurred. Please try again.",
    "UNKNOWN_ERROR",
    undefined,
    error
  );
};

export const showTelemedicineErrorToast = (error: TelemedicineError) => {
  let title = "Error";
  let description = error.message;

  switch (error.code) {
    case "AUTH_REQUIRED":
      title = "Authentication Required";
      description = "Please log in to access telemedicine features.";
      break;
    case "ACCESS_DENIED":
      title = "Access Denied";
      description = "You don't have permission to access this telemedicine session.";
      break;
    case "SESSION_NOT_FOUND":
      title = "Session Not Found";
      description = "The requested telemedicine session could not be found.";
      break;
    case "SESSION_ALREADY_ACTIVE":
      title = "Session Already Active";
      description = "This telemedicine session is already in progress.";
      break;
    case "NETWORK_ERROR":
      title = "Connection Error";
      description = "Please check your internet connection and try again.";
      break;
    case "SERVER_ERROR":
      title = "Server Error";
      description = "Our servers are experiencing issues. Please try again later.";
      break;
    default:
      title = "Something went wrong";
      description = "An unexpected error occurred. Please try again.";
  }

  toast.error(title, { description });
};

export const showTelemedicineSuccessToast = (message: string, description?: string) => {
  toast.success(message, description ? { description } : undefined);
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

export const fetchAllSessions = async () => {
  try {
    checkTelemedicineAccess();
    const response = await apiClient.get<TelemedicineSession[]>(TELEMEDICINE_ENDPOINTS.SESSIONS);
    return response;
  } catch (error) {
    throw handleTelemedicineError(error, "fetchAllSessions");
  }
};

export const fetchSessionByAppointmentId = async (appointmentId: string) => {
  try {
    checkTelemedicineAccess();
    const response = await apiClient.get<TelemedicineSession>(
      TELEMEDICINE_ENDPOINTS.SESSION_BY_APPOINTMENT_ID(appointmentId)
    );
    return response;
  } catch (error) {
    throw handleTelemedicineError(error, "fetchSessionByAppointmentId");
  }
};

export const createSession = async (payload: CreateSessionPayload) => {
  try {
    checkTelemedicineAccess();
    const response = await apiClient.post<TelemedicineSession>(
      TELEMEDICINE_ENDPOINTS.CREATE_SESSION,
      payload
    );
    return response;
  } catch (error) {
    throw handleTelemedicineError(error, "createSession");
  }
};

export const startSession = async (appointmentId: string) => {
  try {
    checkTelemedicineAccess();
    const response = await apiClient.put<TelemedicineSession>(
      TELEMEDICINE_ENDPOINTS.START_SESSION(appointmentId)
    );
    return response;
  } catch (error) {
    throw handleTelemedicineError(error, "startSession");
  }
};

export const endSession = async (appointmentId: string) => {
  try {
    checkTelemedicineAccess();
    const response = await apiClient.put<TelemedicineSession>(TELEMEDICINE_ENDPOINTS.END_SESSION(appointmentId));
    return response;
  } catch (error) {
    throw handleTelemedicineError(error, "endSession");
  }
};

export const fetchSessionToken = async (appointmentId: string) => {
  try {
    const user = checkTelemedicineAccess();
    const response = await apiClient.get<SessionToken>(
      `${TELEMEDICINE_ENDPOINTS.SESSION_TOKEN(appointmentId)}?userId=${user.userId}`
    );
    return response;
  } catch (error) {
    throw handleTelemedicineError(error, "fetchSessionToken");
  }
};

export const deleteSession = async (appointmentId: string) => {
  try {
    checkTelemedicineAccess();
    const response = await apiClient.delete(TELEMEDICINE_ENDPOINTS.DELETE_SESSION(appointmentId));
    return response;
  } catch (error) {
    throw handleTelemedicineError(error, "deleteSession");
  }
};

export const useGetAllSessions = () =>
  useQuery({
    queryKey: queryKeys.telemedicine.sessions(),
    queryFn: () => fetchAllSessions().then((r) => r.data),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on authentication/authorization errors
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

export const useGetSessionByAppointmentId = (appointmentId: string) =>
  useQuery({
    queryKey: queryKeys.telemedicine.session(appointmentId),
    queryFn: () => fetchSessionByAppointmentId(appointmentId).then((r) => r.data),
    enabled: !!appointmentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

export const useGetSessionToken = (appointmentId: string) => {
  const userId = useStore((state) => state.user?.userId);
  return useQuery({
    queryKey: queryKeys.telemedicine.token(appointmentId, userId || ""),
    queryFn: () => fetchSessionToken(appointmentId).then((r) => r.data),
    enabled: !!appointmentId && !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - tokens expire quickly
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        return false;
      }
      return failureCount < 2; // Fewer retries for tokens
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
      showTelemedicineSuccessToast("Session Created", "Your telemedicine session has been scheduled successfully.");
    },
    onError: (error) => {
      if (error instanceof TelemedicineError) {
        showTelemedicineErrorToast(error);
      } else {
        showTelemedicineErrorToast(new TelemedicineError("Failed to create session", "CREATE_FAILED"));
      }
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
      showTelemedicineSuccessToast("Session Started", "Your telemedicine session is now active.");
    },
    onError: (error, appointmentId, context) => {
      // Revert optimistic update on error
      if (context?.previousSession) {
        qc.setQueryData(
          queryKeys.telemedicine.session(appointmentId),
          context.previousSession
        );
      }
      if (error instanceof TelemedicineError) {
        showTelemedicineErrorToast(error);
      } else {
        showTelemedicineErrorToast(new TelemedicineError("Failed to start session", "START_FAILED"));
      }
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
      showTelemedicineSuccessToast("Session Ended", "Your telemedicine session has been completed.");
    },
    onError: (error, appointmentId, context) => {
      // Revert optimistic update on error
      if (context?.previousSession) {
        qc.setQueryData(
          queryKeys.telemedicine.session(appointmentId),
          context.previousSession
        );
      }
      if (error instanceof TelemedicineError) {
        showTelemedicineErrorToast(error);
      } else {
        showTelemedicineErrorToast(new TelemedicineError("Failed to end session", "END_FAILED"));
      }
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
      showTelemedicineSuccessToast("Session Deleted", "The telemedicine session has been removed.");
    },
    onError: (error) => {
      if (error instanceof TelemedicineError) {
        showTelemedicineErrorToast(error);
      } else {
        showTelemedicineErrorToast(new TelemedicineError("Failed to delete session", "DELETE_FAILED"));
      }
    },
  });
};

export const useGetSessions = () => {
  return useQuery({
    queryKey: queryKeys.telemedicine.sessions(),
    queryFn: () => fetchAllSessions().then((r) => r.data),
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof AuthenticationError || error instanceof AuthorizationError) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
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
