import { apiClient } from "@api/apiClient";
import {
  Payment,
  Paginated,
  PaymentListParams,
  RecordPaymentPayload,
  LedgerRow,
  StudentPaymentSummary,
  ProrationPreview,
  CreateOnlineOrderPayload,
  OnlineOrder,
} from "@modules/payment/types";

export const paymentApi = {
  list: async (params?: PaymentListParams) => {
    const res = await apiClient.get<Paginated<Payment>>("/payments", {
      params,
    });
    return res.data;
  },
  ledger: async (driverUserId?: string) => {
    const res = await apiClient.get<{ success: boolean; data: LedgerRow[] }>(
      "/payments/ledger",
      { params: driverUserId ? { driverUserId } : undefined },
    );
    return res.data.data;
  },
  studentSummary: async (studentId: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: StudentPaymentSummary;
    }>(`/payments/student/${studentId}/summary`);
    return res.data.data;
  },
  record: async (payload: RecordPaymentPayload) => {
    const res = await apiClient.post<{ success: boolean; data: Payment }>(
      "/payments",
      payload,
    );
    return res.data.data;
  },
  verify: async (id: string) => {
    const res = await apiClient.post<{ success: boolean; data: Payment }>(
      `/payments/${id}/verify`,
    );
    return res.data.data;
  },
  reject: async (id: string, notes?: string) => {
    const res = await apiClient.post<{ success: boolean; data: Payment }>(
      `/payments/${id}/reject`,
      notes ? { notes } : {},
    );
    return res.data.data;
  },
  // Preview the amount due for a student this month (prorated for mid-month joins).
  prorationPreview: async (studentId: string, forMonth?: string) => {
    const res = await apiClient.get<{
      success: boolean;
      data: ProrationPreview;
    }>("/payments/proration-preview", {
      params: { studentId, ...(forMonth ? { forMonth } : {}) },
    });
    return res.data.data;
  },
  // Create an online payment order (Razorpay).
  createOnlineOrder: async (payload: CreateOnlineOrderPayload) => {
    const res = await apiClient.post<{ success: boolean; data: OnlineOrder }>(
      "/payments/online/order",
      payload,
    );
    return res.data.data;
  },
  // Dev/test-mode confirm — completes an order without a real Razorpay charge.
  confirmTestPayment: async (orderId: string) => {
    const res = await apiClient.post<{ success: boolean; data: Payment }>(
      "/payments/online/confirm-test",
      { orderId },
    );
    return res.data.data;
  },
};
