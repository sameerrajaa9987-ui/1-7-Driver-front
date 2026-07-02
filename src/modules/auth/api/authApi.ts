import { apiClient } from "@api/apiClient";
import type {
  AuthResponse,
  SignupPayload,
  LoginPayload,
  OtpRequestResponse,
} from "@modules/auth/types";

export const authApi = {
  signup: async (payload: SignupPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/signup", payload);
    return res.data;
  },
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/login", payload);
    return res.data;
  },
  requestOtp: async (phone: string): Promise<OtpRequestResponse> => {
    const res = await apiClient.post<OtpRequestResponse>("/auth/otp/request", {
      phone,
    });
    return res.data;
  },
  verifyOtp: async (phone: string, code: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/otp/verify", {
      phone,
      code,
    });
    return res.data;
  },
  logout: async (refreshToken?: string) => {
    const res = await apiClient.post("/auth/logout", { refreshToken });
    return res.data;
  },
};
