import { useMutation } from "@tanstack/react-query";
import { authApi } from "@modules/auth/api/authApi";
import type {
  AuthResponse,
  SignupPayload,
  LoginPayload,
} from "@modules/auth/types";
import { useAuthStore } from "@shared/store/useAuthStore";

function applyAuth(res: AuthResponse) {
  if (res.success && res.data) {
    const { user, organization, accessToken, refreshToken } = res.data;
    useAuthStore
      .getState()
      .setAuth(user, organization, accessToken, refreshToken);
  }
}

export const useLogin = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: applyAuth,
  });

export const useSignup = () =>
  useMutation({
    mutationFn: (payload: SignupPayload) => authApi.signup(payload),
    onSuccess: applyAuth,
  });

export const useRequestOtp = () =>
  useMutation({
    mutationFn: (phone: string) => authApi.requestOtp(phone),
  });

export const useVerifyOtp = () =>
  useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      authApi.verifyOtp(phone, code),
    onSuccess: applyAuth,
  });

export function useLogout() {
  return async () => {
    const { refreshToken, logout } = useAuthStore.getState();
    try {
      await authApi.logout(refreshToken || undefined);
    } catch {
      // ignore
    }
    await logout();
  };
}
