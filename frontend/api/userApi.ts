import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { USER_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";
import { useStore } from "../store/store";


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

// ─── Matches backend PatchUserRequest (all optional for PATCH /api/v1/users/me) ──
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}

// ─── Matches backend UpdateUserRequest (for PUT /api/v1/users/{userId}) ──────
export interface UpdateUserPayload {
  name: string;
  email: string;
  phoneNumber: string;
  password?: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
  phoneNumber?: string;
  isProfileCreated?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

// ─── Matches backend AuthResponse ─────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: UserProfile;
}

// ─── Plain API Functions ──────────────────────────────────────────────────────
export const loginUser = (credentials: LoginCredentials) =>
  apiClient.post<AuthResponse>(USER_ENDPOINTS.LOGIN, credentials);

export const registerUser = (payload: RegisterPayload) =>
  apiClient.post<AuthResponse>(USER_ENDPOINTS.REGISTER, payload);

// Backend has no logout endpoint — JWT is stateless; logout is client-side only
export const logoutUser = () => Promise.resolve();

export const fetchCurrentUser = () =>
  apiClient.get<UserProfile>(USER_ENDPOINTS.ME);

export const updateProfile = (payload: UpdateProfilePayload) =>
  apiClient.patch<UserProfile>(USER_ENDPOINTS.UPDATE_PROFILE, payload);

export const updateUserById = (id: string, payload: UpdateUserPayload) =>
  apiClient.put<UserProfile>(USER_ENDPOINTS.UPDATE_BY_ID(id), payload);

export const patchUserById = (id: string, payload: UpdateProfilePayload) =>
  apiClient.patch<UserProfile>(USER_ENDPOINTS.PATCH_BY_ID(id), payload);

export const fetchAllUsers = () =>
  apiClient.get<UserProfile[]>(USER_ENDPOINTS.ALL_USERS);

export const fetchUserById = (id: string) =>
  apiClient.get<UserProfile>(USER_ENDPOINTS.USER_BY_ID(id));

export const batchFetchUsers = (userIds: string[]) =>
  apiClient.post<UserProfile[]>(USER_ENDPOINTS.BATCH_USERS, userIds);

export const deleteUser = (id: string) =>
  apiClient.delete(USER_ENDPOINTS.DELETE_USER(id));

export const activateUser = (id: string) =>
  apiClient.patch<UserProfile>(USER_ENDPOINTS.ACTIVATE_USER(id));

export const deactivateUser = (id: string) =>
  apiClient.patch<UserProfile>(USER_ENDPOINTS.DEACTIVATE_USER(id));

export const restoreUser = (id: string) =>
  apiClient.patch<UserProfile>(USER_ENDPOINTS.RESTORE_USER(id));

export const markProfileCreated = (userId: string) =>
  apiClient.patch(USER_ENDPOINTS.PROFILE_CREATED(userId));

export const useGetCurrentUser = () =>
  useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: () => fetchCurrentUser().then((r) => r.data),
  });

export const useGetAllUsers = () =>
  useQuery({
    queryKey: queryKeys.user.lists(),
    queryFn: () => fetchAllUsers().then((r) => r.data),
  });

export const useGetUserById = (id: string) =>
  useQuery({
    queryKey: queryKeys.user.detail(id),
    queryFn: () => fetchUserById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useLogin = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      const { token, user } = response.data;
      useStore.getState().setAuth(token, user);
      qc.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: registerUser,
  });
};

export const useLogout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      qc.clear();
    },
  });
};

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.me() });
    },
  });
};

export const useUpdateUserById = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      updateUserById(id, payload).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.user.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
  });
};

export const usePatchUserById = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProfilePayload }) =>
      patchUserById(id, payload).then((r) => r.data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.user.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
  });
};

export const useActivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: activateUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
  });
};

export const useDeactivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
  });
};

export const useRestoreUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: restoreUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
  });
};

export const useMarkProfileCreated = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markProfileCreated,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.me() });
      qc.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
  });
};
