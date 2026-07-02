export interface Branch {
  id: string;
  name: string;
  city: string;
  isActive: boolean;
  createdAt: string;
}

export interface BranchPayload {
  name: string;
  city: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
