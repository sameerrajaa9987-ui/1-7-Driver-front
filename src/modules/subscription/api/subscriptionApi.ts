import { apiClient } from "@api/apiClient";

export type PlanKey = "basic" | "premium";

export interface PlanInfo {
  key: PlanKey;
  label: string;
  price: number;
  features: string[];
}

export interface SubscriptionState {
  plan: PlanKey;
  status: "trial" | "active" | "expired";
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  lastPaymentAt: string | null;
  effectivePlan: PlanKey | null;
  premium: boolean;
  catalog: PlanInfo[];
  testMode: boolean;
}

export const subscriptionApi = {
  get: async () => {
    const res = await apiClient.get<{
      success: boolean;
      data: SubscriptionState;
    }>("/subscription");
    return res.data.data;
  },
  checkout: async (plan: PlanKey) => {
    const res = await apiClient.post<{
      success: boolean;
      data: {
        orderId: string;
        amount: number;
        plan: PlanKey;
        testMode: boolean;
      };
    }>("/subscription/checkout", { plan });
    return res.data.data;
  },
  confirmTest: async (orderId: string, plan: PlanKey) => {
    const res = await apiClient.post<{
      success: boolean;
      data: SubscriptionState;
    }>("/subscription/confirm-test", { orderId, plan });
    return res.data.data;
  },
};
