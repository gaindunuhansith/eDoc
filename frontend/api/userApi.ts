import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { USER_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt: string;
}

// ─── Plain API Functions ──────────────────────────────────────────────────────
export const loginUser = (credentials: LoginCredentials) =>
  apiClient.post<{ token: string; user: UserProfile }>(
    USER_ENDPOINTS.LOGIN,
    credentials
  );

export const registerUser = (payload: RegisterPayload) =>
  apiClient.post<{ token: string; user: UserProfile }>(
    USER_ENDPOINTS.REGISTER,
    payload
  );

export const logoutUser = () => apiClient.post(USER_ENDPOINTS.LOGOUT);

export const fetchCurrentUser = () =>
  apiClient.get<UserProfile>(USER_ENDPOINTS.ME);

export const updateProfile = (payload: UpdateProfilePayload) =>
  apiClient.put<UserProfile>(USER_ENDPOINTS.UPDATE_PROFILE, payload);

export const changePassword = (payload: ChangePasswordPayload) =>
  apiClient.patch(USER_ENDPOINTS.CHANGE_PASSWORD, payload);

export const fetchAllUsers = () =>
  apiClient.get<UserProfile[]>(USER_ENDPOINTS.ALL_USERS);

export const fetchUserById = (id: string) =>
  apiClient.get<UserProfile>(USER_ENDPOINTS.USER_BY_ID(id));

export const deleteUser = (id: string) =>
  apiClient.delete(USER_ENDPOINTS.DELETE_USER(id));


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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.all });
    },
  });
};

export const useRegister = () =>
  useMutation({ mutationFn: registerUser });

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

export const useChangePassword = () =>
  useMutation({ mutationFn: changePassword });

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.lists() });
    },
  });
};
