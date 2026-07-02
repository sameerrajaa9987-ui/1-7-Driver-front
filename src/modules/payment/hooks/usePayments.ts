import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentApi } from "@modules/payment/api/paymentApi";
import {
  PaymentListParams,
  RecordPaymentPayload,
  CreateOnlineOrderPayload,
} from "@modules/payment/types";

export const usePayments = (params?: PaymentListParams) =>
  useQuery({
    queryKey: ["payments", params],
    queryFn: () => paymentApi.list(params),
  });

export const useLedger = (driverUserId?: string) =>
  useQuery({
    queryKey: ["payments-ledger", driverUserId],
    queryFn: () => paymentApi.ledger(driverUserId),
  });

export const useStudentPaymentSummary = (studentId: string) =>
  useQuery({
    queryKey: ["payment-summary", studentId],
    queryFn: () => paymentApi.studentSummary(studentId),
    enabled: !!studentId,
  });

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordPaymentPayload) => paymentApi.record(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payments-ledger"] });
      qc.invalidateQueries({ queryKey: ["payment-summary"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
};

export const useVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentApi.verify(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payments-ledger"] });
      qc.invalidateQueries({ queryKey: ["payment-summary"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
};

export const useProrationPreview = (studentId?: string, forMonth?: string) =>
  useQuery({
    queryKey: ["proration-preview", studentId, forMonth],
    queryFn: () => paymentApi.prorationPreview(studentId!, forMonth),
    enabled: !!studentId,
  });

export const useCreateOnlineOrder = () =>
  useMutation({
    mutationFn: (payload: CreateOnlineOrderPayload) =>
      paymentApi.createOnlineOrder(payload),
  });

export const useConfirmTestPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId }: { orderId: string }) =>
      paymentApi.confirmTestPayment(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payment-summary"] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
};

export const useRejectPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      paymentApi.reject(id, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["payments-ledger"] });
    },
  });
};
