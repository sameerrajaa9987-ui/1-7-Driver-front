export type StudentStatus = "pending" | "active" | "inactive";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Student {
  id: string;
  name: string;
  photo: string;
  gender: string;
  dob: string | null;
  bloodGroup: string;

  schoolName: string;
  className: string;
  section: string;
  schoolTiming: string;
  schoolAddress: string;

  homeAddress: string;
  pickupPoint: GeoPoint | null;
  pickupTime: string;
  dropTime: string;

  fatherName: string;
  motherName: string;
  mobile: string;
  alternateNumber: string;
  whatsappNumber: string;
  parentUserId: string | null;

  driverId: string | null;
  vehicleId: string | null;
  routeId: string | null;
  monthlyFee: number;
  joiningDate: string | null;
  dueDate: number;

  // Enriched on GET /students/:id — assigned transport contact card, so
  // parents can see/call the driver without admin permissions.
  driverName?: string;
  driverMobile?: string;
  vehicleNumber?: string;
  vehicleModel?: string;

  status: StudentStatus;
  addedByRole: string;
  approvedAt: string | null;
  createdAt: string;
}

export interface StudentPayload {
  name: string;
  mobile?: string;
  gender?: string;
  dob?: string;
  bloodGroup?: string;
  schoolName?: string;
  className?: string;
  section?: string;
  schoolTiming?: string;
  schoolAddress?: string;
  homeAddress?: string;
  pickupPoint?: GeoPoint | null;
  pickupTime?: string;
  dropTime?: string;
  fatherName?: string;
  motherName?: string;
  alternateNumber?: string;
  whatsappNumber?: string;
}

export interface ApprovePayload {
  driverId?: string;
  vehicleId?: string;
  routeId?: string;
  monthlyFee?: number;
  joiningDate?: string;
  dueDate?: number;
}

export interface StudentListParams {
  page?: number;
  limit?: number;
  status?: StudentStatus;
  routeId?: string;
  driverId?: string;
  search?: string;
}

export interface Paginated<T> {
  success: boolean;
  data: T[];
  meta: { total: number; pages: number; page: number };
}
