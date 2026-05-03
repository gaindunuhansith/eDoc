import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { PAYMENT_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

// ─── Actual backend status values ─────────────────────────────────────────────
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";
export type CurrencyType = "LKR" | "USD";

export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "DIGITAL_WALLET";

// ─── Matches backend PaymentHistoryResponse ───────────────────────────────────
export interface PaymentHistoryItem {
  id: string;
  appointmentId?: string;
  userId: string;
  amount: number;
  currency: CurrencyType;
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
  transactionLogs?: Array<{
    id: string;
    event: string;
    rawPayload?: string;
    createdAt: string;
  }>;
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

// ─── Matches backend InitiatePaymentRequest ───────────────────────────────────
export interface InitiatePaymentPayload {
  appointmentId: string;
  amount: number;
  currency: CurrencyType | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

// ─── Matches backend InitiatePaymentResponse ──────────────────────────────────
export interface CheckoutPayloadResponse {
  orderId: string;
  merchantId: string;
  amount: number;
  currency: string;
  hash: string;
  checkoutUrl: string;
  notifyUrl: string;
}

// ─── API Functions ─────────────────────────────────────────────────────────────

export const initiatePayment = (payload: InitiatePaymentPayload) => {
  const fullName = [payload.firstName, payload.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const body = {
    appointmentId: payload.appointmentId,
    amount: payload.amount,
    currency: payload.currency,
    billing: {
      fullName: fullName,
      email: payload.email ?? "",
      phone: payload.phone ?? "",
      address: payload.address,
      city: payload.city,
      country: payload.country || "Sri Lanka",
    },
  };

  return apiClient.post<CheckoutPayloadResponse>(PAYMENT_ENDPOINTS.INITIATE, body);
};

export const fetchPaymentsByAppointment = (appointmentId: string) =>
  apiClient.get<PaymentHistoryItem>(
    PAYMENT_ENDPOINTS.BY_APPOINTMENT(appointmentId)
  );

export const fetchPaymentsByOrder = (orderId: string) =>
  apiClient.get<PaymentHistoryItem>(PAYMENT_ENDPOINTS.BY_ORDER(orderId));

export const downloadInvoice = (id: string) =>
  apiClient.get<Blob>(PAYMENT_ENDPOINTS.INVOICE(id), { responseType: "blob" });

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export const useGetMyPaymentHistory = (page = 0, size = 10) =>
  useQuery({
    queryKey: queryKeys.payment.history(page, size),
    queryFn: () =>
      apiClient
        .get<SpringPage<PaymentHistoryItem>>(PAYMENT_ENDPOINTS.HISTORY, {
          params: { page, size, sort: "createdAt,DESC" },
        })
        .then((r) => r.data),
  });

export const useGetAllPayments = (page = 0, size = 10) =>
  useQuery({
    queryKey: queryKeys.payment.lists(page, size),
    queryFn: () =>
      apiClient
        .get<SpringPage<PaymentHistoryItem>>(PAYMENT_ENDPOINTS.GET_ALL, {
          params: { page, size, sort: "createdAt,DESC" },
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

export const useGetPaymentsByUser = (userId: string, page = 0, size = 10) =>
  useQuery({
    queryKey: [...queryKeys.payment.byPatient(userId), page, size],
    queryFn: () =>
      apiClient
        .get<SpringPage<PaymentHistoryItem>>(PAYMENT_ENDPOINTS.BY_USER(userId), {
          params: { page, size, sort: "createdAt,DESC" },
        })
        .then((r) => r.data),
    enabled: !!userId,
  });

export const useGetPaymentsByStatus = (
  status: "PENDING" | "SUCCESS" | "FAILED",
  page = 0,
  size = 10
) =>
  useQuery({
    queryKey: ["payment", "status", status, page, size],
    queryFn: () =>
      apiClient
        .get<SpringPage<PaymentHistoryItem>>(PAYMENT_ENDPOINTS.BY_STATUS(status), {
          params: { page, size, sort: "createdAt,DESC" },
        })
        .then((r) => r.data),
    enabled: !!status,
  });

export const useGetPaymentByOrder = (orderId: string) =>
  useQuery({
    queryKey: ["payment", "order", orderId],
    queryFn: () => fetchPaymentsByOrder(orderId).then((r) => r.data),
    enabled: !!orderId,
  });

// Polls every 2.5 s until status is SUCCESS or FAILED, then stops.
export const usePollPaymentByOrder = (orderId: string, active: boolean) =>
  useQuery({
    queryKey: ["payment", "order", orderId, "poll"],
    queryFn: () => fetchPaymentsByOrder(orderId).then((r) => r.data),
    enabled: !!orderId && active,
    refetchInterval: (query) => {
      const status = (query.state.data as PaymentHistoryItem | undefined)?.status;
      if (status === "SUCCESS" || status === "FAILED") return false;
      return 2500;
    },
    refetchIntervalInBackground: false,
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

export const useReconcilePayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient
        .post<{ message: string }>(PAYMENT_ENDPOINTS.RECONCILE(id))
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.payment.all });
    },
  });
};
