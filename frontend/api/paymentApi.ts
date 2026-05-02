import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { PAYMENT_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

// ─── Actual backend status values ─────────────────────────────────────────────
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "DIGITAL_WALLET";

// ─── Matches backend PaymentHistoryResponse ───────────────────────────────────
export interface PaymentHistoryItem {
  id: string;
  appointmentId?: number;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  orderId?: string;
  createdAt: string;
}

// ─── Matches backend PaymentDetailResponse ────────────────────────────────────
export interface PaymentDetailItem extends PaymentHistoryItem {
  payhereId?: string;
  updatedAt: string;
  billing?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
  };
}

// ─── Spring Page wrapper ───────────────────────────────────────────────────────
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// ─── Legacy types kept for confirm-order page compatibility ───────────────────
export interface InitiatePaymentPayload {
  userId: string;
  appointmentId: string;
  amount: number;
  currency: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  metadata?: Record<string, string>;
}

export interface CheckoutPayloadResponse {
  actionUrl: string;
  fields: Record<string, string>;
}

export interface ConfirmPaymentPayload {
  transactionId: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export const initiatePayment = (payload: InitiatePaymentPayload) =>
  apiClient.post<CheckoutPayloadResponse>(PAYMENT_ENDPOINTS.INITIATE, payload);

export const fetchPaymentsByAppointment = (appointmentId: string) =>
  apiClient.get<SpringPage<PaymentHistoryItem>>(
    PAYMENT_ENDPOINTS.BY_APPOINTMENT(appointmentId)
  );

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useGetMyPaymentHistory = (page = 0, size = 10) =>
  useQuery({
    queryKey: queryKeys.payment.history(page, size),
    queryFn: () =>
      apiClient
        .get<SpringPage<PaymentHistoryItem>>(PAYMENT_ENDPOINTS.HISTORY, {
          params: { page, size, sort: "createdAt,desc" },
        })
        .then((r) => r.data),
  });

export const useGetAllPayments = (page = 0, size = 10) =>
  useQuery({
    queryKey: queryKeys.payment.lists(page, size),
    queryFn: () =>
      apiClient
        .get<SpringPage<PaymentHistoryItem>>(PAYMENT_ENDPOINTS.GET_ALL, {
          params: { page, size, sort: "createdAt,desc" },
        })
        .then((r) => r.data),
  });

export const useGetPaymentById = (id: string) =>
  useQuery({
    queryKey: queryKeys.payment.detail(id),
    queryFn: () =>
      apiClient
        .get<PaymentDetailItem>(PAYMENT_ENDPOINTS.GET_BY_ID(id))
        .then((r) => r.data),
    enabled: !!id,
  });

export const useGetPaymentsByAppointment = (appointmentId: string) =>
  useQuery({
    queryKey: queryKeys.payment.byAppointment(appointmentId),
    queryFn: () => fetchPaymentsByAppointment(appointmentId).then((r) => r.data),
    enabled: !!appointmentId,
  });

export const useInitiatePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InitiatePaymentPayload) =>
      initiatePayment(payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.payment.all });
    },
  });
};
