import type { User, Organization } from "@shared/store/useAuthStore";

export interface AuthResponse {
  success: boolean;
  data?: {
    user: User;
    organization: Organization;
    accessToken: string;
    refreshToken: string;
  };
}

export interface SignupPayload {
  organizationName: string;
  businessType?: "solo" | "fleet";
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  city?: string;
  password: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface OtpRequestResponse {
  success: boolean;
  data: { message: string; expiresInMinutes: number; devCode?: string };
}
