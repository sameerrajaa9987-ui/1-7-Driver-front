export type ComplaintCategory =
  "late_pickup" | "driver" | "vehicle" | "fee" | "other";

export type ComplaintStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Complaint {
  id: string;
  ticketNumber: string;
  raisedByName: string;
  studentId: string | null;
  category: ComplaintCategory;
  subject: string;
  description: string;
  status: ComplaintStatus;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface RaiseComplaintPayload {
  category: ComplaintCategory;
  subject: string;
  description: string;
  studentId?: string;
}

export interface UpdateComplaintStatusPayload {
  status: ComplaintStatus;
  resolution?: string;
}

export interface ComplaintListParams {
  page?: number;
  limit?: number;
  status?: ComplaintStatus;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
