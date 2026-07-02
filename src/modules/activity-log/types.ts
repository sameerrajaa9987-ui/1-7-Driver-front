export interface ActivityLog {
  id: string;
  userId: string | null;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  description: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
}

export interface ActivityLogListParams {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta?: { total: number; pages: number; page: number };
}
