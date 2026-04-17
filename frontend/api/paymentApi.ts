import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import apiClient from "./utils/axiosInstance";
import { PAYMENT_ENDPOINTS } from "./utils/endpoints";
import { queryKeys } from "./utils/queryKeys";

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "DIGITAL_WALLET";

export interface Payment {
  id: string;
  patientId: string;
  appointmentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

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

export const fetchAllPayments = () =>
  apiClient.get<Payment[]>(PAYMENT_ENDPOINTS.GET_ALL);

export const fetchPaymentById = (id: string) =>
  apiClient.get<Payment>(PAYMENT_ENDPOINTS.GET_BY_ID(id));

export const initiatePayment = (payload: InitiatePaymentPayload) =>
  apiClient.post<CheckoutPayloadResponse>(PAYMENT_ENDPOINTS.INITIATE, payload);

export const confirmPayment = ({
  id,
  payload,
}: {
  id: string;
  payload: ConfirmPaymentPayload;
}) => apiClient.patch<Payment>(PAYMENT_ENDPOINTS.CONFIRM(id), payload);

export const refundPayment = (id: string) =>
  apiClient.patch<Payment>(PAYMENT_ENDPOINTS.REFUND(id));

export const fetchPaymentsByPatient = (patientId: string) =>
  apiClient.get<Payment[]>(PAYMENT_ENDPOINTS.BY_PATIENT(patientId));

export const fetchPaymentsByAppointment = (appointmentId: string) =>
  apiClient.get<Payment[]>(
    PAYMENT_ENDPOINTS.BY_APPOINTMENT(appointmentId)
  );

export const useGetAllPayments = () =>
  useQuery({
    queryKey: queryKeys.payment.lists(),
    queryFn: () => fetchAllPayments().then((r) => r.data),
  });

export const useGetPaymentById = (id: string) =>
  useQuery({
    queryKey: queryKeys.payment.detail(id),
    queryFn: () => fetchPaymentById(id).then((r) => r.data),
    enabled: !!id,
  });

export const useGetPaymentsByPatient = (patientId: string) =>
  useQuery({
    queryKey: queryKeys.payment.byPatient(patientId),
    queryFn: () => fetchPaymentsByPatient(patientId).then((r) => r.data),
    enabled: !!patientId,
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
      qc.invalidateQueries({ queryKey: queryKeys.payment.lists() });
    },
  });
};

export const useConfirmPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: confirmPayment,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.payment.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.payment.lists() });
    },
  });
};

export const useRefundPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: refundPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.payment.lists() });
    },
  });
};
