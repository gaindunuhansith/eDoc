import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

let _getToken: (() => string | null) | null = null;

export const registerTokenAccessor = (fn: () => string | null) => {
  _getToken = fn;
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = _getToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      // Clear persisted auth state and redirect to home/login
      if (typeof window !== "undefined") {
        // Remove persisted Zustand store
        localStorage.removeItem("edoc-store");
        window.location.href = "/";
      }
    }


    const message =
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred";

    return Promise.reject(new Error(message));
  }
);

export default apiClient;
