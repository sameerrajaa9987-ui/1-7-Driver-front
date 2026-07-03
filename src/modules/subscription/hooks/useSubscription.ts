import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  subscriptionApi,
  PlanKey,
} from "@modules/subscription/api/subscriptionApi";

export const useSubscription = () =>
  useQuery({
    queryKey: ["subscription"],
    queryFn: () => subscriptionApi.get(),
  });

/** Checkout that auto-completes in test mode (no gateway needed). */
export const useUpgradePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (plan: PlanKey) => {
      const order = await subscriptionApi.checkout(plan);
      if (order.testMode) {
        return subscriptionApi.confirmTest(order.orderId, plan);
      }
      // Live mode: the Razorpay checkout must collect payment + signature;
      // handled by the payment sheet integration when live keys are set.
      throw new Error(
        "Live checkout requires the Razorpay payment sheet build.",
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
      qc.invalidateQueries({ queryKey: ["fleet-analytics"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
};
