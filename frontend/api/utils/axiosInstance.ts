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
    // TODO: Re-enable 401 redirect once notification-service JWT claim is fixed.
    // Previously this cleared auth and redirected to "/" on any non-login 401,
    // but it caused patients to be logged out due to stale claim names in some services.

    const data = error.response?.data as any;
    const message =
      data?.message ??
      data?.error ??
      error.message ??
      "An unexpected error occurred";

    const apiError = new Error(message) as Error & { status?: number };
    apiError.status = error.response?.status;
    return Promise.reject(apiError);
  }
);

export default apiClient;
