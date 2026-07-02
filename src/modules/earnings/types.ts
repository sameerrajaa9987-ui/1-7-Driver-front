export interface EarningItem {
  driverId: string;
  driverName: string;
  salaryType: string;
  fixedSalary: number;
  perStudentCommission: number;
  activeStudents: number;
  commission: number;
  fixed: number;
  total: number;
}

export interface EarningsSummary {
  drivers: number;
  monthlyPayroll: number;
}

export interface EarningsResponse {
  items: EarningItem[];
  summary: EarningsSummary;
}
