export type PaymentMode = "cash" | "transfer" | "online";
export type PaymentStatus = "pending" | "verified" | "rejected";

export interface Payment {
  id: string;
  studentId: string | null;
  amount: number;
  forMonth: string;
  mode: PaymentMode;
  status: PaymentStatus;
  receivedByUserId: string | null;
  receivedByRole: string;
  receivedByName: string;
  reference: string;
  screenshot: string;
  notes: string;
  receiptNumber: string;
  verifiedAt: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface RecordPaymentPayload {
  studentId: string;
  amount: number;
  mode: "cash" | "transfer";
  forMonth?: string;
  reference?: string;
  notes?: string;
}

export interface LedgerRow {
  driverUserId: string | null;
  driverName: string;
  amountHeld: number;
  payments: number;
}

export interface StudentPaymentSummary {
  paid: number;
  pending: number;
  verifiedCount: number;
  pendingCount: number;
}

export interface ProrationPreview {
  amount: number;
  full: number;
  prorated: boolean;
  forMonth: string;
}

export interface CreateOnlineOrderPayload {
  studentId: string;
  forMonth?: string;
}

export interface OnlineOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  testMode: boolean;
  studentId: string;
  forMonth: string;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  studentId?: string;
  status?: PaymentStatus;
  mode?: PaymentMode;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
