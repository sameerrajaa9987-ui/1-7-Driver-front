export interface Driver {
  id: string;
  userId: string | null;
  fullName: string;
  mobile: string;
  address: string;
  licenseNumber: string;
  licenseExpiry: string | null;
  photo: string;
  salaryType: string;
  fixedSalary: number;
  perStudentCommission: number;
  assignedVehicleId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface DriverPayload {
  fullName: string;
  mobile?: string;
  password?: string;
  licenseNumber?: string;
  address?: string;
  licenseExpiry?: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
